import json
import datetime

import jwt
from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.db import connection, OperationalError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


ALLOWED_ROLES = {'customer', 'vendor', 'admin'}


def get_cors_headers(request):
    origin = request.headers.get('Origin') or request.META.get('HTTP_ORIGIN')
    headers = {
        'Access-Control-Allow-Origin': origin or '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
    if origin:
        headers['Vary'] = 'Origin'
    return headers


def options_response(request):
    response = JsonResponse({'status': 'ok'})
    for name, value in get_cors_headers(request).items():
        response[name] = value
    return response


def add_cors(response, request):
    for name, value in get_cors_headers(request).items():
        response[name] = value
    return response


def get_user_columns():
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users'"
        )
        return {row[0] for row in cursor.fetchall()}


def ensure_user_table():
    create_sql = '''
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(150) NOT NULL,
        last_name VARCHAR(150) NOT NULL,
        email VARCHAR(254) NOT NULL UNIQUE,
        password VARCHAR(128) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'customer',
        phone VARCHAR(20),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    '''
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'users'"
        )
        exists = cursor.fetchone()[0] > 0
        if not exists:
            cursor.execute(create_sql)
            return

        columns = get_user_columns()

        if 'name' in columns:
            if 'first_name' not in columns:
                cursor.execute(
                    'ALTER TABLE users ADD COLUMN first_name VARCHAR(150) NOT NULL DEFAULT "" AFTER id'
                )
            if 'last_name' not in columns:
                cursor.execute(
                    'ALTER TABLE users ADD COLUMN last_name VARCHAR(150) NOT NULL DEFAULT "" AFTER first_name'
                )
            cursor.execute('UPDATE users SET first_name = name WHERE first_name = ""')
            cursor.execute('UPDATE users SET last_name = "" WHERE last_name = ""')
            cursor.execute('ALTER TABLE users DROP COLUMN name')
            columns = get_user_columns()

        if 'first_name' not in columns:
            cursor.execute(
                'ALTER TABLE users ADD COLUMN first_name VARCHAR(150) NOT NULL DEFAULT "" AFTER id'
            )
        if 'last_name' not in columns:
            cursor.execute(
                'ALTER TABLE users ADD COLUMN last_name VARCHAR(150) NOT NULL DEFAULT "" AFTER first_name'
            )

        if 'password' not in columns:
            if 'password_hash' in columns:
                cursor.execute(
                    'ALTER TABLE users CHANGE COLUMN password_hash password VARCHAR(128) NOT NULL'
                )
            else:
                cursor.execute(
                    'ALTER TABLE users ADD COLUMN password VARCHAR(128) NOT NULL DEFAULT "" AFTER email'
                )


def fetch_user_by_email(email):
    ensure_user_table()
    with connection.cursor() as cursor:
        cursor.execute(
            'SELECT id, first_name, last_name, email, password, role FROM users WHERE email = %s',
            [email],
        )
        row = cursor.fetchone()
    if not row:
        return None
    return {
        'id': row[0],
        'first_name': row[1],
        'last_name': row[2],
        'email': row[3],
        'password': row[4],
        'role': row[5],
    }


def fetch_user_by_id(user_id):
    ensure_user_table()
    with connection.cursor() as cursor:
        cursor.execute(
            'SELECT id, first_name, last_name, email, password, role FROM users WHERE id = %s',
            [user_id],
        )
        row = cursor.fetchone()
    if not row:
        return None
    return {
        'id': row[0],
        'first_name': row[1],
        'last_name': row[2],
        'email': row[3],
        'password': row[4],
        'role': row[5],
    }


def create_user(first_name, last_name, email, password, role):
    ensure_user_table()
    hashed_password = make_password(password)
    with connection.cursor() as cursor:
        cursor.execute(
            'INSERT INTO users (first_name, last_name, email, password, role) VALUES (%s, %s, %s, %s, %s)',
            [first_name, last_name, email, hashed_password, role],
        )
        user_id = cursor.lastrowid
    return {
        'id': user_id,
        'first_name': first_name,
        'last_name': last_name,
        'email': email,
        'role': role,
    }


def generate_jwt_token(user):
    now = datetime.datetime.utcnow()
    payload = {
        'user_id': user['id'],
        'first_name': user['first_name'],
        'last_name': user['last_name'],
        'email': user['email'],
        'role': user['role'],
        'iat': now,
        'exp': now + datetime.timedelta(hours=24),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')


def home(request):
    if request.method == 'OPTIONS':
        return options_response(request)

    response = JsonResponse({'status': 'ok', 'message': 'Auth service is running'})
    return add_cors(response, request)


def decode_jwt_token(request):
    auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, JsonResponse({'error': 'Authorization header required'}, status=401)

    token = auth_header.split('Bearer ')[1].strip()
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None, JsonResponse({'error': 'Token expired'}, status=401)
    except jwt.InvalidTokenError:
        return None, JsonResponse({'error': 'Invalid token'}, status=401)

    user_id = payload.get('user_id')
    if not user_id:
        return None, JsonResponse({'error': 'Invalid token payload'}, status=401)

    user = fetch_user_by_id(user_id)
    if not user:
        return None, JsonResponse({'error': 'User not found'}, status=401)

    return user, None


def profile(request):
    if request.method == 'OPTIONS':
        return options_response(request)

    if request.method != 'GET':
        response = JsonResponse({'error': 'Invalid request method'}, status=405)
        return add_cors(response, request)

    user, error_response = decode_jwt_token(request)
    if error_response:
        return add_cors(error_response, request)

    response = JsonResponse({
        'user': {
            'id': user['id'],
            'firstName': user['first_name'],
            'lastName': user['last_name'],
            'email': user['email'],
            'role': user['role'],
        }
    })
    return add_cors(response, request)


@csrf_exempt
def register(request):
    if request.method == 'OPTIONS':
        return options_response(request)

    if request.method != 'POST':
        response = JsonResponse({'error': 'Invalid request method'}, status=405)
        return add_cors(response, request)

    try:
        payload = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        response = JsonResponse({'error': 'Invalid JSON payload'}, status=400)
        return add_cors(response, request)

    first_name = payload.get('firstName', '').strip()
    last_name = payload.get('lastName', '').strip()
    email = payload.get('email', '').strip().lower()
    password = payload.get('password')
    role = payload.get('role', 'customer')

    if not first_name or not last_name or not email or not password:
        response = JsonResponse({'error': 'firstName, lastName, email, and password are required'}, status=400)
        return add_cors(response, request)

    if '@' not in email:
        response = JsonResponse({'error': 'Invalid email address'}, status=400)
        return add_cors(response, request)

    if role not in ALLOWED_ROLES:
        response = JsonResponse({'error': f'role must be one of {sorted(ALLOWED_ROLES)}'}, status=400)
        return add_cors(response, request)

    if fetch_user_by_email(email):
        response = JsonResponse({'error': 'Email already exists'}, status=400)
        return add_cors(response, request)

    user = create_user(first_name, last_name, email, password, role)
    token = generate_jwt_token(user)

    response = JsonResponse({
        'token': token,
        'user': {
            'id': user['id'],
            'firstName': user['first_name'],
            'lastName': user['last_name'],
            'email': user['email'],
            'role': user['role'],
        },
    })
    return add_cors(response, request)


@csrf_exempt
def login_view(request):
    if request.method == 'OPTIONS':
        return options_response(request)

    if request.method != 'POST':
        response = JsonResponse({'error': 'Invalid request method'}, status=405)
        return add_cors(response, request)

    try:
        payload = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        response = JsonResponse({'error': 'Invalid JSON payload'}, status=400)
        return add_cors(response, request)

    email = payload.get('email', '').strip().lower()
    password = payload.get('password')

    if not email or not password:
        response = JsonResponse({'error': 'email and password are required'}, status=400)
        return add_cors(response, request)

    user = fetch_user_by_email(email)
    if not user:
        response = JsonResponse({'error': 'Invalid email or password'}, status=401)
        return add_cors(response, request)

    if not check_password(password, user['password']):
        response = JsonResponse({'error': 'Invalid email or password'}, status=401)
        return add_cors(response, request)

    token = generate_jwt_token(user)

    response = JsonResponse({
        'token': token,
        'user': {
            'id': user['id'],
            'firstName': user['first_name'],
            'lastName': user['last_name'],
            'email': user['email'],
            'role': user['role'],
        },
    })
    return add_cors(response, request)
