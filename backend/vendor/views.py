from django.http import JsonResponse


def home(request):
    return JsonResponse({'app': 'vendor', 'message': 'Vendor home'})


def dashboard(request):
    return JsonResponse({'app': 'vendor', 'message': 'Vendor dashboard'})
