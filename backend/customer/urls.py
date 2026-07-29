from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_data, name='customer-home-data'),
    path('home/', views.home_data, name='customer-home-page'),
    path('products/', views.products_api, name='customer-products-api'),
    path('products/<int:product_id>/', views.product_detail_api, name='customer-product-detail-api'),
    path('profile/', views.profile, name='customer-profile'),
]
