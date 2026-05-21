import factory
from faker import Faker
from django.utils import timezone
from account.factories import UserFactory
from .models import Friend, Message

fake = Faker('it_IT')

class FriendFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Friend

    first_friend = factory.SubFactory(UserFactory)
    second_friend = factory.SubFactory(UserFactory)
    status = factory.Iterator(Friend.Status.values)

    @factory.lazy_attribute
    def date(self):
        start_date = max(
            self.first_friend.date_joined, 
            self.second_friend.date_joined
        )
        
        return fake.date_time_between(
            start_date=start_date,
            end_date='now',
            tzinfo=timezone.get_current_timezone()
        )
    
class MessageFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Message

    sender = factory.SubFactory(UserFactory)
    receiver = factory.SubFactory(UserFactory)
    message = factory.Faker('paragraph', locale='it_IT')
    status = factory.Iterator(Message.Status.values)

    @factory.lazy_attribute
    def date(self):
        start_date = max(
            self.sender.date_joined, 
            self.receiver.date_joined
        )
        
        return fake.date_time_between(
            start_date=start_date,
            end_date='now',
            tzinfo=timezone.get_current_timezone()
        )