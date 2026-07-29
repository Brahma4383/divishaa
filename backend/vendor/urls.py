from django.urls import path

from . import views

urlpatterns = [
    path("dashboard/", views.dashboard_api, name="vendor-dashboard-api"),
    path("categories/", views.categories_api, name="vendor-categories-api"),
    path("uploads/", views.upload_image_api, name="vendor-image-upload-api"),
    path("products/", views.products_api, name="vendor-products-api"),
    path("products/<int:product_id>/", views.product_detail_api, name="vendor-product-detail-api"),
]
