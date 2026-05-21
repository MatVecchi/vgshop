import factory
from django.contrib.auth.hashers import make_password
from faker import Faker
from django.utils import timezone
from games.factories import GameFactory
from account.factories import UserFactory
from .models import CartItem, Order, OrderItem, Library

faker = Faker(locale="it_IT")

class CartItemFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CartItem
        django_get_or_create = ("user", "game")

    user = factory.SubFactory(UserFactory)
    game = factory.SubFactory(GameFactory)

class OrderFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Order

    user = factory.SubFactory(UserFactory)
    payment_method = factory.Iterator(Order.PaymentMethods.values)
    
    @factory.lazy_attribute
    def date(self):
        return faker.date_time_between(
            start_date=self.user.date_joined, 
            end_date='now',
            tzinfo=timezone.get_current_timezone()
        )

class OrderItemFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = OrderItem

    order = factory.SubFactory(OrderFactory)
    game = factory.SubFactory(GameFactory)

class LibraryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Library
        django_get_or_create = ("user", "game")

    user = factory.SubFactory(UserFactory)
    game = factory.SubFactory(GameFactory)