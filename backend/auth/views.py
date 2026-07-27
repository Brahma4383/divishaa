import json
import datetime

import jwt
from django.conf import settings
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import UserProfile


ALLOWED_ROLES = {'customer', 'vendor', 'admin'}


def generate_jwt_token(user):
    now = datetime.datetime.utcnow()
    payload = {
        'user_id': user.id,
        'username': user.username,
        'email': user.email,
        'role': getattr(getattr(user, 'profile', None), 'role', 'customer'),
        'iat': now,
        'exp': now + datetime.timedelta(hours=24),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')


def home(request):
    return JsonResponse({'status': 'ok', 'message': 'Auth service is running'})


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

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None, JsonResponse({'error': 'User not found'}, status=401)

    return user, None


def profile(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    user, error_response = decode_jwt_token(request)
    if error_response:
        return error_response

    profile = getattr(user, 'profile', None)
    role = profile.role if profile else 'customer'

    return JsonResponse({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': role,
        }
    })


@csrf_exempt
def register(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        payload = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON payload'}, status=400)

    username = payload.get('username')
    email = payload.get('email')
    password = payload.get('password')
    role = payload.get('role', 'customer')

    if not username or not email or not password:
        return JsonResponse({'error': 'username, email, and password are required'}, status=400)

    if role not in ALLOWED_ROLES:
        return JsonResponse({'error': f'role must be one of {sorted(ALLOWED_ROLES)}'}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({'error': 'Username already exists'}, status=400)

    if User.objects.filter(email=email).exists():
        return JsonResponse({'error': 'Email already exists'}, status=400)

    user = User(username=username, email=email)
    user.set_password(password)
    user.save()

    profile = UserProfile.objects.create(user=user, role=role)
    token = generate_jwt_token(user)

    return JsonResponse({
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': profile.role,
        },
    })


@csrf_exempt
def login_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        payload = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON payload'}, status=400)

    username = payload.get('username')
    password = payload.get('password')

    if not username or not password:
        return JsonResponse({'error': 'username and password are required'}, status=400)

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Invalid username or password'}, status=401)

    if not user.check_password(password):
        return JsonResponse({'error': 'Invalid username or password'}, status=401)

    profile = getattr(user, 'profile', None)
    role = profile.role if profile else 'customer'
    token = generate_jwt_token(user)

    return JsonResponse({
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': role,
        },
    })
