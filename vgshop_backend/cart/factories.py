import factory
from django.contrib.auth.hashers import make_password
from faker import Faker
from django.utils import timezone
from games.factories import GameFactory
from account.factories import UserFactory
from .models import CartItem, Order, OrderItem, Library, Collection

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
    
    class Params:
        start_date = None

    @factory.lazy_attribute
    def date(self):
        s_date = self.start_date if self.start_date else self.user.date_joined.date()
        e_date = timezone.now().date()
        if s_date > e_date:
            return e_date
        return faker.date_between(start_date=s_date, end_date=e_date)

class OrderItemFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = OrderItem

    order = factory.SubFactory(OrderFactory)
    game = factory.SubFactory(GameFactory)

class CollectionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Collection

    name = factory.Faker("word")

class LibraryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Library
        django_get_or_create = ("user", "game")

    user = factory.SubFactory(UserFactory)
    game = factory.SubFactory(GameFactory)
    collection = factory.SubFactory(CollectionFactory)