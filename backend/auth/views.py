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
