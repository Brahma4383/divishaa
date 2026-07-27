from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='customer-home'),
    path('profile/', views.profile, name='customer-profile'),
]
