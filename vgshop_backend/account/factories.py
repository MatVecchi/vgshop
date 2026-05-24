import factory
import requests
from faker import Faker
from django.core.files.base import ContentFile
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import Group
from .models import User

faker = Faker(locale="it_IT")

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ("username",)

    first_name = factory.Faker("first_name", locale="it_IT")
    last_name = factory.Faker("last_name", locale="it_IT")
    username = factory.Faker("user_name", locale="it_IT")
    email = factory.Faker("email", locale="it_IT")

    password = factory.LazyFunction(lambda: make_password("password123"))
    
    is_active = True
    is_staff = False

    piva = None
    website = None
    family = None

    @factory.lazy_attribute 
    def profile_image(self): 
        url = f"https://api.dicebear.com/9.x/glass/png?seed={self.username}"
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                nome_file = f"avatar_{self.username}.png"
                return ContentFile(response.content, name=nome_file)
        except requests.RequestException:
            pass
            
        return factory.django.ImageField(color='blue').generate()

    class Params:
        is_publisher = factory.Trait(
            piva=factory.Faker("numerify", text="###########"),
            website=factory.Faker("url"),
            family=None
        )

    @factory.post_generation
    def assign_to_group(self, create, extracted, **kwargs):
        is_publisher_value = self.piva != None
        group, _ = Group.objects.get_or_create( name = "Publisher" if is_publisher_value else "Customer")
        self.groups.add(group)
        
