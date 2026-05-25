import factory
import os
import requests
from faker import Faker
from datetime import datetime
from dotenv import load_dotenv
from django.core.files.base import ContentFile
from account.factories import UserFactory
from .models import Tag, GameImage, Game

load_dotenv()

CLIENT_ID = os.environ.get('IGDB_TWITCH_CLIENT_ID')
CLIENT_SECRET = os.environ.get('IGDB_TWITCH_CLIENT_SECRET')

faker = Faker(locale="it_IT")

_igdb_token = None

def get_igdb_token():
    global _igdb_token
    if _igdb_token:
        return _igdb_token

    try:
        response = requests.post(
            f"https://id.twitch.tv/oauth2/token?client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}&grant_type=client_credentials",
            timeout=10
        )
        response.raise_for_status()
        _igdb_token = response.json().get('access_token')
        return _igdb_token
    except Exception as e:
        print(f"Error fetching IGDB token: {e}")
        return None
    
def fetch_igdb_game(name=None):
    token = get_igdb_token()
    if not token:
        return None

    id = faker.random_int(min=1, max=500)
    headers = {
        'Client-ID': CLIENT_ID,
        'Authorization': f'Bearer {token}',
    }

    # Fields: name, summary, first_release_date, cover, videos, genres, involved_companies, screenshots
    body = (
        "fields name, summary, first_release_date, cover.url, videos.video_id, genres.name, "
        "involved_companies.publisher, involved_companies.company.name, involved_companies.company.logo.url, "
        "screenshots.url; "
        f"where {f'name = "{name}" &' if name else ''} first_release_date != null & cover != null & videos != null & summary != null "
        "& involved_companies.company.logo.url != null & screenshots != null "
        "& total_rating_count != null; "
        "sort total_rating_count desc; "
        "limit 1;"
        f'{f"offset {id};" if not name else ""}'
    )

    try:
        response = requests.post("https://api.igdb.com/v4/games", headers=headers, data=body, timeout=10)
        response.raise_for_status()
        json = response.json()

        return {
            "title": json[0]['name'],
            "description": json[0]['summary'],
            "release_date": datetime.fromtimestamp(json[0]['first_release_date']).date(),
            "video": f"https://www.youtube.com/watch?v={json[0]['videos'][0]['video_id']}",
            "cover": json[0]['cover']['url'],
            "tag_list": [genre['name'] for genre in json[0]['genres']],
            "publisher": json[0]['involved_companies'][0]['company']['name'],
            "publisher_logo": json[0]['involved_companies'][0]['company']['logo']['url'],
            "screenshots": [s['url'] for s in json[0]['screenshots']]
        }
    except Exception as e:
        print(f"Error fetching games from IGDB: {e}")
        return {}

def download_igdb_image(url):
    if not url:
        return None
    if url.startswith('//'):
        url = 'https:' + url

    # IGDB image sizes: t_thumb -> t_720p or t_cover_big
    url = url.replace('t_thumb', 't_720p')

    try:
        name = url.split('/')[-1]
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return ContentFile(response.content, name=name)
    except Exception as e:
        print(f"Error downloading image {url}: {e}")
        return None

class TagFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Tag
        django_get_or_create = ("name",)

    name = factory.Faker('word', locale='it_IT')

class GameFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Game
        django_get_or_create = ("title",)

    class Params:
        game_info = factory.LazyFunction(fetch_igdb_game)
        publisher_name = factory.LazyAttribute(lambda o: o.game_info.get("publisher") or faker.company())
        publisher_logo = factory.LazyAttribute(lambda o: o.game_info.get("publisher_logo") or faker.image_url())
        
    title = factory.LazyAttribute(lambda o: o.game_info.get("title") or faker.sentence())
    description = factory.LazyAttribute(lambda o: o.game_info.get("description") or faker.paragraph())
    release_date = factory.LazyAttribute(lambda o: o.game_info.get("release_date") or faker.date_this_decade())
    video = factory.LazyAttribute(lambda o: o.game_info.get("video") or f"https://www.youtube.com/watch?v={faker.lexify(text='???????????')}")
    price = factory.Faker('random_int', min=0, max=80)

    @factory.lazy_attribute
    def cover(self):
        url = self.game_info.get("cover")
        content = download_igdb_image(url)
        if content:
            return content
        return factory.django.ImageField(color='blue').generate()
    
    @factory.lazy_attribute
    def publisher(self):
        username = self.publisher_name
        logo_url = self.publisher_logo

        return UserFactory.create(
            username=username,
            profile_image=download_igdb_image(logo_url),
            is_publisher=True
        )
    
    @factory.post_generation
    def tag_list(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for tag in extracted:
                self.tag_list.add(tag)
        else:
            game_info = fetch_igdb_game(self.title)
            tags = game_info.get("tag_list")
            if tags:
                for tag_name in tags:
                    tag = TagFactory(name=tag_name)
                    self.tag_list.add(tag)

    @factory.post_generation
    def screenshots(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for image in extracted:
                GameImageFactory(game=self, image=image)
        else:
            game_info = fetch_igdb_game(self.title)
            urls = game_info.get("screenshots")
            if urls:
                for url in urls:
                    content = download_igdb_image(url)
                    if content:
                        GameImageFactory(game=self, image=content)

class GameImageFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = GameImage

    image = factory.django.ImageField(color='red')
    game = factory.SubFactory(GameFactory)