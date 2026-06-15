from django.urls import reverse
from django.contrib.auth.models import Group
from .models import User
from wallet.models import Wallet
from games.models import Game, Tag
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.files.uploadedfile import SimpleUploadedFile
import datetime


class GenericUser(APITestCase):
    def create_test_user(self, username, password, group):
        user = User.objects.create_user(username=username, password=password)
        Wallet.objects.create(user=user, credit=0)
        customer_group = Group.objects.get(name=group)
        user.groups.add(customer_group)
        return user

    def login_user(self, username, password):
        login_url = reverse("login")
        auth_credentials = {"username": username, "password": password}

        login_response = self.client.post(login_url, auth_credentials, format="json")
        if "access_token" in login_response.cookies:
            self.client.cookies["access_token"] = login_response.cookies[
                "access_token"
            ].value
        return login_response


class CustomerSetUpTest(GenericUser):
    def setUp(self):
        super().setUp()
        self.customer_username = "customer"
        self.customer_password = "customer_password_123"
        self.customer = self.create_test_user(
            self.customer_username, self.customer_password, "Customer"
        )


class PublisherSetUpTest(GenericUser):
    def setUp(self):
        super().setUp()
        self.publisher_username = "publisher"
        self.publisher_password = "publisher_password_123"
        self.publisher = self.create_test_user(
            self.publisher_username, self.publisher_password, "Publisher"
        )

        tag = Tag.objects.create(name="Corse")
        self.publisher_games = [
            Game.objects.create(
                title=f"Formula 1 202{i}",
                release_date=datetime.date.today(),
                description=f"Gioco di Formula 1 del 202{i}",
                video="https://www.youtube.com/watch?v=NnyCWsA6KSI",
                cover=SimpleUploadedFile(
                    name=f"F12{i}_cover.png",
                    content=b"f1_fake_image",
                    content_type="image/png",
                ),
                price=59.99,
                publisher=self.publisher,
            )
            for i in range(4, 6)
        ]
        for game in self.publisher_games:
            game.tag_list.add(tag)


class AccountApiTests(CustomerSetUpTest):
    def setUp(self):
        super().setUp()

    def test_update_info(self):
        self.login_user(self.customer_username, self.customer_password)
        response = self.client.patch(
            reverse("update"),
            {"username": "prova_update", "first_name": "prova_first_name"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.username, "prova_update")
        self.assertEqual(self.customer.first_name, "prova_first_name")

    def test_update_not_customer_null(self):
        self.login_user(self.customer_username, self.customer_password)
        response = self.client.patch(
            reverse("update"),
            {"piva": 11111111111, "website": "https://www.google.com"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertIsNone(self.customer.piva)
        self.assertIsNone(self.customer.website)

    def test_password_reset(self):
        self.login_user(self.customer_username, self.customer_password)
        new_password = "new_password_123"

        response = self.client.post(
            reverse("reset-password"),
            {
                "old_password": self.customer_password,
                "new_password": new_password,
                "confirm_password": new_password,
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertTrue(self.customer.check_password(new_password))

    def test_reset_password_fail_django_constraints(self):
        self.login_user(self.customer_username, self.customer_password)
        new_password = "password"

        response = self.client.post(
            reverse("reset-password"),
            {
                "old_password": self.customer_password,
                "new_password": new_password,
                "confirm_password": new_password,
            },
            format="multipart",
        )

        self.assertNotEqual(response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertTrue(self.customer.check_password(self.customer_password))
