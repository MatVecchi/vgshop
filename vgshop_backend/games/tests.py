from django.urls import reverse
from rest_framework import status
from account.tests import CustomerSetUpTest, PublisherSetUpTest


class GameApiTest(CustomerSetUpTest, PublisherSetUpTest):
    def setUp(self):
        super().setUp()

    def test_list_games(self):
        response = self.client.get(reverse("catalogue-list"))

        # risponde come paginator
        self.assertEqual(response.data["count"], len(self.publisher_games))

    # test non banale che verifica il content based filtering
    def have_common_tags(self, first, second):
        return len(set(first) & set(second)) >= 1

    def test_content_based_filtering(self):
        self.login_user(self.customer_username, self.customer_password)

        game_target = "Formula 1 2024"
        response = self.client.get(
            reverse("catalogue-detail", kwargs={"title": game_target})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        similar_games = response.data["similar_games"]
        self.assertEqual(len(similar_games), 1)

        first_similar_game = similar_games[0]
        first_similar_game_tag_list = [
            name for tag in first_similar_game["tag_list"] for key, name in tag.items()
        ]

        # simulo un semplice comportamento del recomendation system
        content_filter_simulation = [
            game.title
            for game in self.publisher_games
            if (
                self.have_common_tags(
                    game.tag_list.values_list("name", flat=True),
                    first_similar_game_tag_list,
                )
                and game.title != game_target
            )
        ]

        print(content_filter_simulation)

        self.assertIn(first_similar_game["title"], content_filter_simulation)
