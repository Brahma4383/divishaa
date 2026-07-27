from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='auth-home'),
    path('register/', views.register, name='auth-register'),
    path('login/', views.login_view, name='auth-login'),
]
