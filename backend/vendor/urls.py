from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='vendor-home'),
    path('dashboard/', views.dashboard, name='vendor-dashboard'),
]
