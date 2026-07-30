import json
from decimal import Decimal

from django.db import connection
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

DEFAULT_IMAGE = "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop"


def _to_float(value):
    if value in (None, ""):
        return None
    return float(value)


def _to_int(value):
    if value in (None, ""):
        return 0
    return int(value)


def _table_exists(cursor, table_name):
    cursor.execute("SHOW TABLES LIKE %s", [table_name])
    return cursor.fetchone() is not None


def _fetch_all(cursor, sql, params=None):
    cursor.execute(sql, params or [])
    columns = [column[0] for column in cursor.description or []]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def _serialize_product(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "slug": row.get("slug") or str(row["id"]),
        "category": row.get("category_slug") or row.get("category_name") or "general",
        "brand": row.get("brand_name") or "Divishaa",
        "price": _to_float(row.get("price") or 0),
        "originalPrice": _to_float(row.get("original_price") or row.get("price") or 0),
        "rating": _to_float(row.get("rating") or 0),
        "reviewCount": _to_int(row.get("review_count") or 0),
        "badge": row.get("badge") or None,
        "image": row.get("image_url") or DEFAULT_IMAGE,
    }


def _build_home_payload():
    with connection.cursor() as cursor:
        category_table = "customer_category" if _table_exists(cursor, "customer_category") else "categories" if _table_exists(cursor, "categories") else None
        brand_table = "customer_brand" if _table_exists(cursor, "customer_brand") else "brands" if _table_exists(cursor, "brands") else None
        product_table = "customer_product" if _table_exists(cursor, "customer_product") else "products" if _table_exists(cursor, "products") else None
        review_table = "customer_review" if _table_exists(cursor, "customer_review") else "reviews" if _table_exists(cursor, "reviews") else None

        # The vendor dashboard writes into the schema's `products` and
        # `categories` tables.  That schema has `image` columns (not the
        # `image_url` / `product_count` fields used by the older demo tables),
        # so build the customer catalogue directly from those saved records.
        vendor_catalogue = product_table == "products" and category_table == "categories"

        categories = []
        if vendor_catalogue:
            category_rows = _fetch_all(cursor, """
                SELECT c.id, c.name, c.slug,
                       COUNT(p.id) AS product_count,
                       COALESCE(
                           (SELECT latest.image FROM products AS latest
                            WHERE latest.category_id = c.id
                              AND latest.image IS NOT NULL AND latest.image <> ''
                            ORDER BY latest.created_at DESC, latest.id DESC LIMIT 1),
                           c.image
                       ) AS image_url
                FROM categories AS c
                LEFT JOIN products AS p ON p.category_id = c.id
                GROUP BY c.id, c.name, c.slug, c.image
                ORDER BY c.name
            """)
            categories = [
                {
                    "id": row["slug"],
                    "name": row["name"],
                    "slug": row["slug"],
                    "productCount": int(row.get("product_count") or 0),
                    "image": row.get("image_url") or DEFAULT_IMAGE,
                }
                for row in category_rows
            ]
        elif category_table:
            category_sql = f"SELECT id, name, slug, image_url, product_count FROM {category_table} ORDER BY name"
            category_rows = _fetch_all(cursor, category_sql)
            categories = [
                {
                    "id": row["slug"],
                    "name": row["name"],
                    "slug": row["slug"],
                    "productCount": int(row.get("product_count") or 0),
                    "image": row.get("image_url") or DEFAULT_IMAGE,
                }
                for row in category_rows
            ]

        brands = []
        if brand_table:
            brand_sql = f"SELECT id, name, slug FROM {brand_table} ORDER BY name"
            brand_rows = _fetch_all(cursor, brand_sql)
            brands = [{"id": row["slug"], "name": row["name"]} for row in brand_rows]

        products = []
        if vendor_catalogue:
            product_rows = _fetch_all(cursor, """
                SELECT p.id, p.name, p.category_id, c.slug AS category_slug,
                       c.name AS category_name, p.brand AS brand_name, p.price,
                       p.original_price, p.image AS image_url, p.created_at
                FROM products AS p
                INNER JOIN categories AS c ON c.id = p.category_id
                ORDER BY p.created_at DESC, p.id DESC
            """)
            products = [_serialize_product(row) for row in product_rows]
        elif product_table and category_table and brand_table:
            product_sql = f"""
                SELECT p.id, p.name, p.slug, p.category_id, c.slug AS category_slug, c.name AS category_name,
                       p.brand_id, b.name AS brand_name, p.price, p.original_price, p.rating,
                       p.review_count, p.image_url, p.badge, p.is_featured, p.is_new_arrival, p.is_best_seller
                FROM {product_table} p
                LEFT JOIN {category_table} c ON c.id = p.category_id
                LEFT JOIN {brand_table} b ON b.id = p.brand_id
                ORDER BY p.id DESC
            """
            product_rows = _fetch_all(cursor, product_sql)
            products = [_serialize_product(row) for row in product_rows]
        elif product_table:
            product_sql = f"SELECT id, name, slug, price, original_price, rating, review_count, image_url, badge FROM {product_table} ORDER BY id DESC"
            product_rows = _fetch_all(cursor, product_sql)
            products = [_serialize_product(row) for row in product_rows]

        trending_products = [p for p in products if p.get("badge") in {"sale", "bestseller", "new"}] or products[:8]
        new_arrivals = [p for p in products if p.get("badge") == "new"] or products[:6]
        best_sellers = [p for p in products if p.get("badge") == "bestseller"] or products[:4]

        reviews = []
        if review_table:
            review_sql = f"SELECT id, customer_name, customer_image, rating, purchased_product, text FROM {review_table} ORDER BY created_at DESC LIMIT 4"
            review_rows = _fetch_all(cursor, review_sql)
            reviews = [
                {
                    "id": row["id"],
                    "customerName": row.get("customer_name"),
                    "customerImage": row.get("customer_image") or DEFAULT_IMAGE,
                    "rating": int(row.get("rating") or 0),
                    "purchasedProduct": row.get("purchased_product") or "Divishaa Collection",
                    "text": row.get("text") or "",
                }
                for row in review_rows
            ]

    return {
        "slides": [
            {
                "id": "hero-1",
                "eyebrow": "Summer Couture Edit",
                "title": "New Summer Collection",
                "highlight": "Collection",
                "subtitle": "Handcrafted silhouettes curated for the season.",
                "image": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop",
                "ctaPrimary": "Shop Now",
                "ctaSecondary": "Explore Collection",
            },
            {
                "id": "hero-2",
                "eyebrow": "Evening Wear",
                "title": "Draped in Elegance",
                "highlight": "Elegance",
                "subtitle": "Limited edition eveningwear with rich embroidery and premium drapes.",
                "image": "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop",
                "ctaPrimary": "Shop Now",
                "ctaSecondary": "Explore Collection",
            },
        ],
        "categories": categories,
        "trending": {
            "items": trending_products[:8],
            "page": 1,
            "pageSize": 8,
            "totalItems": len(trending_products),
            "totalPages": 1,
        },
        "newArrivals": new_arrivals[:6],
        "bestSellers": best_sellers[:4],
        "brands": brands,
        "reviews": reviews,
    }


@require_http_methods(["GET"])
def home_data(request):
    return JsonResponse(_build_home_payload())


@require_http_methods(["GET", "POST"])
def products_api(request):
    if request.method == "GET":
        payload = _build_home_payload()
        return JsonResponse({"products": payload["trending"]["items"] + payload["newArrivals"] + payload["bestSellers"]})

    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Invalid JSON body"}, status=400)

    with connection.cursor() as cursor:
        product_table = "customer_product" if _table_exists(cursor, "customer_product") else "products" if _table_exists(cursor, "products") else None
        if not product_table:
            return JsonResponse({"success": False, "error": "Products table not found"}, status=500)

        name = payload.get("name") or "New Product"
        slug = payload.get("slug") or name.lower().replace(" ", "-")
        price = Decimal(str(payload.get("price", 0)))
        original_price = Decimal(str(payload.get("original_price", price))) if payload.get("original_price") is not None else None
        rating = float(payload.get("rating", 0))
        review_count = int(payload.get("review_count", 0))
        image_url = payload.get("image_url") or DEFAULT_IMAGE
        badge = payload.get("badge") or ""
        is_featured = bool(payload.get("is_featured", False))
        is_new_arrival = bool(payload.get("is_new_arrival", False))
        is_best_seller = bool(payload.get("is_best_seller", False))

        cursor.execute(
            f"""
            INSERT INTO {product_table} (name, slug, price, original_price, rating, review_count, image_url, badge, is_featured, is_new_arrival, is_best_seller)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            [name, slug, price, original_price, rating, review_count, image_url, badge, is_featured, is_new_arrival, is_best_seller],
        )
        product_id = cursor.lastrowid

    return JsonResponse({"success": True, "product": {"id": product_id, "name": name, "slug": slug}})


@require_http_methods(["PUT", "DELETE"])
def product_detail_api(request, product_id):
    with connection.cursor() as cursor:
        product_table = "customer_product" if _table_exists(cursor, "customer_product") else "products" if _table_exists(cursor, "products") else None
        if not product_table:
            return JsonResponse({"success": False, "error": "Products table not found"}, status=500)

        if request.method == "PUT":
            try:
                payload = json.loads(request.body.decode("utf-8") or "{}")
            except json.JSONDecodeError:
                return JsonResponse({"success": False, "error": "Invalid JSON body"}, status=400)

            fields = []
            values = []
            if "name" in payload:
                fields.append("name = %s")
                values.append(payload["name"])
            if "price" in payload:
                fields.append("price = %s")
                values.append(Decimal(str(payload["price"])))
            if "badge" in payload:
                fields.append("badge = %s")
                values.append(payload["badge"])
            if not fields:
                return JsonResponse({"success": False, "error": "No valid fields were provided"}, status=400)

            values.append(product_id)
            cursor.execute(f"UPDATE {product_table} SET {', '.join(fields)} WHERE id = %s", values)
            return JsonResponse({"success": True, "productId": product_id})

        cursor.execute(f"DELETE FROM {product_table} WHERE id = %s", [product_id])
        return JsonResponse({"success": True, "deletedId": product_id})


def profile(request):
    return JsonResponse({"app": "customer", "message": "Customer profile"})
