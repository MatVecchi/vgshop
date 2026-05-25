import factory
from account.factories import UserFactory
from .models import Family, generate_family_code

class FamilyFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Family

    manager = factory.SubFactory(UserFactory)
    code = factory.LazyFunction(generate_family_code)