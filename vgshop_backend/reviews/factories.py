import factory
from faker import Faker
from django.utils import timezone
from account.factories import UserFactory
from games.factories import GameFactory
from .models import Review

fake = Faker('it_IT')

class ReviewFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Review
        django_get_or_create = ("user", "game")

    user = factory.SubFactory(UserFactory)
    game = factory.SubFactory(GameFactory)
    stars = factory.Faker('random_int', min=1, max=5)
    comment = factory.Faker('paragraph', locale='it_IT')

    @factory.lazy_attribute
    def date(self):
        user_date = self.user.date_joined.date() if hasattr(self.user.date_joined, 'date') else self.user.date_joined
        game_date = self.game.release_date
        start_date = max(user_date, game_date)
        
        # Faker's date_time_between expects dates or datetimes
        return fake.date_time_between(
            start_date=start_date,
            end_date='now',
            tzinfo=timezone.get_current_timezone()
        )