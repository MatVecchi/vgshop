import factory
from faker import Faker
from django.utils import timezone
from account.factories import UserFactory
from .models import Wallet, Transaction, CreditCard, WalletCard

fake = Faker('it_IT')

class WalletFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Wallet
        django_get_or_create = ("user",)
    
    user = factory.SubFactory(UserFactory)
    credit = factory.Faker('random_int', min=0, max=500)

class TransactionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Transaction
    
    wallet = factory.SubFactory(WalletFactory)
    movement = factory.Faker('random_int', min=-100, max=100)
    
    @factory.lazy_attribute
    def date(self):
        return fake.date_time_between(
            start_date=self.wallet.user.date_joined,
            end_date='now',
            tzinfo=timezone.get_current_timezone()
        )
    
class CreditCardFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CreditCard
    
    number = factory.Faker('credit_card_number')
    name = factory.Faker('name')
    expiration_date = factory.Faker('future_date')

class WalletCardFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = WalletCard
    
    wallet = factory.SubFactory(WalletFactory)
    credit_card = factory.SubFactory(CreditCardFactory)