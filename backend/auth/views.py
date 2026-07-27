from django.http import JsonResponse


def home(request):
    return JsonResponse({'app': 'auth', 'message': 'Auth home'})


def login_view(request):
    return JsonResponse({'app': 'auth', 'message': 'Login endpoint'})
