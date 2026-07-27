from django.http import JsonResponse


def home(request):
    return JsonResponse({'app': 'customer', 'message': 'Customer home'})


def profile(request):
    return JsonResponse({'app': 'customer', 'message': 'Customer profile'})
