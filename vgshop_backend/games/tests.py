from django.urls import reverse
from django.contrib.auth.models import Group
from account.models import User
from games.models import Game, Tag
from rest_framework import status
from account.tests import CustomerSetUpTest, PublisherSetUpTest
from rest_framework.test import APITestCase
from django.core.files.uploadedfile import SimpleUploadedFile
import datetime


class GameApiTest(CustomerSetUpTest, PublisherSetUpTest):
    def setUp(self):
        super().setUp()

    def test_list_games(self):
        response = self.client.get(reverse("catalogue-list"))

        # risponde come paginator
        self.assertEqual(response.data["count"], len(self.publisher_games))

    def _create_game(self):
        self.login_user(self.publisher_username, self.publisher_password)

        new_game = {
            "title": "Formula 1 2027",
            "release_date": datetime.date.today(),
            "description": "Gioco di Formula 1 del 2027",
            "video": "https://www.youtube.com/watch?v=NnyCWsA6KSI",
            "cover": SimpleUploadedFile(
                name="F127_cover.png",
                content=b"f1_fake_image",
                content_type="image/png",
            ),
            "price": 59.99,
            "publisher": self.publisher,
            "uploaded_images": [],
        }
        response = self.client.post(
            reverse("catalogue-list"), data=new_game, format="multipart"
        )

        print(response.data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
