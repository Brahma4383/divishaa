from django.test import TestCase
from django.urls import reverse

from .models import Brand, Category, Product, Review


class CustomerHomeViewTests(TestCase):
    def setUp(self):
        category = Category.objects.create(name="Women", slug="women", image_url="https://example.com/women.jpg")
        brand = Brand.objects.create(name="Divishaa Label", slug="divishaa-label")
        Product.objects.create(
            name="Emerald Draped Saree",
            slug="emerald-draped-saree",
            category=category,
            brand=brand,
            price=6499,
            original_price=9999,
            rating=4.8,
            review_count=212,
            image_url="https://example.com/product.jpg",
            badge="sale",
            is_featured=True,
            is_new_arrival=True,
            is_best_seller=True,
        )
        Review.objects.create(
            customer_name="Ananya",
            customer_image="https://example.com/customer.jpg",
            rating=5,
            purchased_product="Emerald Draped Saree",
            text="Beautiful craftsmanship and lovely fit.",
        )

    def test_home_payload_contains_database_products(self):
        response = self.client.get(reverse("customer-home-data"))

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("categories", payload)
        self.assertGreaterEqual(len(payload["categories"]), 1)
        self.assertGreaterEqual(len(payload["trending"]["items"]), 1)
        self.assertGreaterEqual(len(payload["newArrivals"]), 1)
        self.assertGreaterEqual(len(payload["bestSellers"]), 1)
        self.assertGreaterEqual(len(payload["brands"]), 1)
        self.assertGreaterEqual(len(payload["reviews"]), 1)
