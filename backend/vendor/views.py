"""Function-based vendor APIs backed by the project MySQL schema.

This app intentionally does not use Django REST Framework or Django models.
"""
import json
from decimal import Decimal, InvalidOperation

from django.db import connection, DatabaseError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from auth.views import add_cors, decode_jwt_token, options_response


def _json_response(request, payload, status=200):
    return add_cors(JsonResponse(payload, status=status), request)


def _require_vendor(request):
    user, error = decode_jwt_token(request)
    if error:
        return None, add_cors(error, request)
    if user["role"] not in {"vendor", "admin"}:
        return None, _json_response(request, {"error": "Vendor access is required"}, 403)
    return user, None


def _read_json(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}"), None
    except json.JSONDecodeError:
        return None, _json_response(request, {"error": "Invalid JSON payload"}, 400)


def _product_payload(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "brand": row.get("brand") or "",
        "description": row.get("description") or "",
        "categoryId": row["category_id"],
        "categoryName": row.get("category_name") or "Uncategorised",
        "price": float(row["price"]),
        "originalPrice": float(row["original_price"]) if row.get("original_price") is not None else None,
        "stock": int(row["stock"]),
        "sizes": json.loads(row["sizes"]) if row.get("sizes") else [],
        "colors": json.loads(row["colors"]) if row.get("colors") else [],
        "image": row.get("image") or "",
        "status": row["status"],
        "createdAt": row["created_at"].isoformat() if row.get("created_at") else None,
    }


def _validate_product(payload):
    errors = {}
    name = str(payload.get("name", "")).strip()
    if not name:
        errors["name"] = "Product name is required"
    if not payload.get("categoryId"):
        errors["categoryId"] = "Category is required"
    try:
        category_id = int(payload.get("categoryId"))
    except (TypeError, ValueError):
        category_id = 0
        errors["categoryId"] = "Category is invalid"
    try:
        price = Decimal(str(payload.get("price")))
        if price < 0:
            raise InvalidOperation
    except (InvalidOperation, TypeError, ValueError):
        price = Decimal("0")
        errors["price"] = "Enter a valid non-negative price"
    try:
        stock = int(payload.get("stock", 0))
        if stock < 0:
            raise ValueError
    except (TypeError, ValueError):
        stock = 0
        errors["stock"] = "Stock must be a non-negative whole number"
    original_price = payload.get("originalPrice")
    try:
        original_price = Decimal(str(original_price)) if original_price not in (None, "") else None
        if original_price is not None and original_price < price:
            errors["originalPrice"] = "Original price cannot be lower than selling price"
    except (InvalidOperation, TypeError, ValueError):
        original_price = None
        errors["originalPrice"] = "Enter a valid original price"
    for field in ("sizes", "colors"):
        if payload.get(field, []) and not isinstance(payload[field], list):
            errors[field] = f"{field.title()} must be a list"
    if errors:
        return None, errors
    return {
        "name": name,
        "category_id": category_id,
        "brand": str(payload.get("brand", "")).strip(),
        "description": str(payload.get("description", "")).strip(),
        "price": price,
        "original_price": original_price,
        "stock": stock,
        "sizes": json.dumps(payload.get("sizes", [])),
        "colors": json.dumps(payload.get("colors", [])),
        "image": str(payload.get("image", "")).strip(),
    }, None


@csrf_exempt
def categories_api(request):
    if request.method == "OPTIONS":
        return options_response(request)
    _, error = _require_vendor(request)
    if error:
        return error
    if request.method != "GET":
        return _json_response(request, {"error": "Method not allowed"}, 405)
    with connection.cursor() as cursor:
        cursor.execute("SELECT id, name, slug FROM categories ORDER BY name")
        categories = [{"id": row[0], "name": row[1], "slug": row[2]} for row in cursor.fetchall()]
    return _json_response(request, {"categories": categories})


@csrf_exempt
def dashboard_api(request):
    if request.method == "OPTIONS":
        return options_response(request)
    user, error = _require_vendor(request)
    if error:
        return error
    if request.method != "GET":
        return _json_response(request, {"error": "Method not allowed"}, 405)
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT COUNT(*), COALESCE(SUM(stock), 0),
                   COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0),
                   COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0)
            FROM products WHERE vendor_id = %s
        """, [user["id"]])
        total, inventory, approved, pending = cursor.fetchone()
    return _json_response(request, {"vendor": {"id": user["id"], "name": f"{user['first_name']} {user['last_name']}".strip()}, "metrics": {"totalProducts": total, "inventoryUnits": int(inventory), "approvedProducts": approved, "pendingProducts": pending}})


@csrf_exempt
def products_api(request):
    if request.method == "OPTIONS":
        return options_response(request)
    user, error = _require_vendor(request)
    if error:
        return error
    if request.method == "GET":
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT p.id, p.name, p.brand, p.description, p.category_id, c.name AS category_name,
                       p.price, p.original_price, p.stock, p.sizes, p.colors, p.image, p.status, p.created_at
                FROM products p JOIN categories c ON c.id = p.category_id
                WHERE p.vendor_id = %s ORDER BY p.created_at DESC, p.id DESC
            """, [user["id"]])
            columns = [column[0] for column in cursor.description]
            products = [_product_payload(dict(zip(columns, row))) for row in cursor.fetchall()]
        return _json_response(request, {"products": products})
    if request.method != "POST":
        return _json_response(request, {"error": "Method not allowed"}, 405)
    payload, error = _read_json(request)
    if error:
        return error
    product, errors = _validate_product(payload)
    if errors:
        return _json_response(request, {"error": "Please correct the highlighted fields", "fields": errors}, 400)
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM categories WHERE id = %s", [product["category_id"]])
            if not cursor.fetchone():
                return _json_response(request, {"error": "Selected category does not exist"}, 400)
            cursor.execute("""
                INSERT INTO products (vendor_id, category_id, name, brand, description, price, original_price, stock, sizes, colors, image, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending')
            """, [user["id"], product["category_id"], product["name"], product["brand"], product["description"], product["price"], product["original_price"], product["stock"], product["sizes"], product["colors"], product["image"]])
            product_id = cursor.lastrowid
    except DatabaseError:
        return _json_response(request, {"error": "Unable to save product. Please try again."}, 500)
    return _json_response(request, {"message": "Product submitted for approval", "productId": product_id}, 201)


@csrf_exempt
def product_detail_api(request, product_id):
    if request.method == "OPTIONS":
        return options_response(request)
    user, error = _require_vendor(request)
    if error:
        return error
    if request.method not in {"PUT", "DELETE"}:
        return _json_response(request, {"error": "Method not allowed"}, 405)
    with connection.cursor() as cursor:
        cursor.execute("SELECT id FROM products WHERE id = %s AND vendor_id = %s", [product_id, user["id"]])
        if not cursor.fetchone():
            return _json_response(request, {"error": "Product not found"}, 404)
        if request.method == "DELETE":
            cursor.execute("DELETE FROM products WHERE id = %s AND vendor_id = %s", [product_id, user["id"]])
            return _json_response(request, {"message": "Product deleted"})
    payload, error = _read_json(request)
    if error:
        return error
    product, errors = _validate_product(payload)
    if errors:
        return _json_response(request, {"error": "Please correct the highlighted fields", "fields": errors}, 400)
    with connection.cursor() as cursor:
        cursor.execute("SELECT id FROM categories WHERE id = %s", [product["category_id"]])
        if not cursor.fetchone():
            return _json_response(request, {"error": "Selected category does not exist"}, 400)
        cursor.execute("""
            UPDATE products SET category_id=%s, name=%s, brand=%s, description=%s, price=%s,
                original_price=%s, stock=%s, sizes=%s, colors=%s, image=%s, status='pending'
            WHERE id=%s AND vendor_id=%s
        """, [product["category_id"], product["name"], product["brand"], product["description"], product["price"], product["original_price"], product["stock"], product["sizes"], product["colors"], product["image"], product_id, user["id"]])
    return _json_response(request, {"message": "Product updated and resubmitted for approval"})
