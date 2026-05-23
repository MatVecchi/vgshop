import os
import shutil
import random
from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand
from games.factories import GameFactory, TagFactory, GameImageFactory
from account.factories import UserFactory
from friends.factories import FriendFactory, MessageFactory
from family.factories import FamilyFactory
from cart.factories import CartItemFactory, LibraryFactory
from reviews.factories import ReviewFactory
from wallet.factories import WalletFactory, WalletCardFactory
from wallet.models import Wallet
import factory

class Command(BaseCommand):
    help = "Seed the database with games, users and related data"

    def add_arguments(self, parser):
        parser.add_argument(
            '--multiplier',
            '-m',
            type=int,
            default=1,
            help='Multiplier for the number of entries to insert to the db (default: 1)'
        )

        parser.add_argument(
            '--reset',
            '-r',
            action='store_true',
            help='Whether to reset the database before seeding (default: False)'
        )

    def handle(self, *args, **options):
        try:
            if options['reset']:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                
                superusers_data = list(User.objects.filter(is_superuser=True).values(
                    'password', 'is_superuser', 'is_staff', 'is_active',
                    'username', 'first_name', 'last_name', 'email',
                    'date_joined', 'piva', 'website', 'profile_image'
                ))

                self.stdout.write(self.style.WARNING("Resetting database..."))
                call_command('flush', interactive=False)
                
                for su_data in superusers_data:
                    User.objects.create(**su_data)

                self.stdout.write(self.style.SUCCESS(f"Database reset successful. {len(superusers_data)} admin users preserved."))

                self.stdout.write(self.style.WARNING("Clearing media directory..."))
                media_root = settings.MEDIA_ROOT
                if os.path.exists(media_root):
                    for filename in os.listdir(media_root):
                        file_path = os.path.join(media_root, filename)
                        try:
                            if os.path.isfile(file_path) or os.path.islink(file_path):
                                os.unlink(file_path)
                            elif os.path.isdir(file_path):
                                shutil.rmtree(file_path)
                        except Exception as e:
                            self.stdout.write(self.style.ERROR(f'Failed to delete {file_path}. Reason: {e}'))
                self.stdout.write(self.style.SUCCESS("Media directory cleared.\n"))

            multiplier = options['multiplier']
            users = []
            games = []
            families = []

            self.stdout.write(f"\nCreating {20 * multiplier} users...\n")
            for i in range(20 * multiplier):
                try:
                    user = UserFactory()
                    users.append(user)
                    self.stdout.write(self.style.SUCCESS(f"Successfully created user: {user.username}"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error creating user {i+1}: {e}"))

            self.stdout.write(f"\nSeeding {10 * multiplier} games...\n")    
            for i in range(10 * multiplier):
                try:
                    game = GameFactory()
                    games.append(game)
                    self.stdout.write(self.style.SUCCESS(f"Successfully created game: {game.title}"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error creating game {i+1}: {e}"))

            self.stdout.write(self.style.SUCCESS(f"\nFinished seeding {10 * multiplier} games."))
            
            self.stdout.write("\nGenerating relations (Friends, Families, Cart, Library, Reviews, Wallet)...")
            for user in users:
                self.stdout.write(f"\nProcessing user: {user.username}")

                self.stdout.write("Creating friends...")
                possible_friends = [u for u in users if u != user]
                num_friends = random.randint(0, min(20, len(possible_friends)))
                friends = random.sample(possible_friends, num_friends)
                for friend in friends:
                    FriendFactory(first_friend=user, second_friend=friend)
                    self.stdout.write(self.style.SUCCESS(f"Created friendship between {user.username} and {friend.username}"))
                    
                    num_messages = random.randint(0, 30)
                    for _ in range(num_messages):
                        if random.choice([True, False]):
                            sender, receiver = user, friend
                        else:
                            sender, receiver = friend, user
                        MessageFactory(sender=sender, receiver=receiver)
                    if num_messages > 0:
                        self.stdout.write(self.style.SUCCESS(f"Created {num_messages} messages between {user.username} and {friend.username}"))
                if random.random() < 0.20:
                    self.stdout.write("Creating family...")
                    if families and random.random() < 0.5:
                        user.family = random.choice(families)
                        user.save()
                        self.stdout.write(self.style.SUCCESS(f"Added {user.username} to family: {user.family.code}"))
                    else:
                        family = FamilyFactory(manager=user)
                        families.append(family)
                        user.family = family
                        user.save()
                        self.stdout.write(self.style.SUCCESS(f"Created family: {family.code} with manager {user.username}"))
                
                self.stdout.write("\nCreating cart items and owned games...")
                num_cart = random.randint(0, min(3, len(games)))
                num_owned = random.randint(0, min(20, len(games)))
                
                cart_games = random.sample(games, num_cart)
                owned_games = random.sample(games, num_owned)
                
                for game in cart_games:
                    CartItemFactory(user=user, game=game)
                    self.stdout.write(self.style.SUCCESS(f"Added {game.title} to {user.username}'s cart"))
                
                for game in owned_games:
                    LibraryFactory(user=user, game=game)
                    self.stdout.write(self.style.SUCCESS(f"Added {game.title} to {user.username}'s library"))

                self.stdout.write("\nCreating reviews...")
                if owned_games:
                    num_reviews = random.randint(0, min(20, len(owned_games)))
                    review_games = random.sample(owned_games, num_reviews)
                    for game in review_games:
                        ReviewFactory(user=user, game=game)
                        self.stdout.write(self.style.SUCCESS(f"{user.username} reviewed {game.title}"))
                
                self.stdout.write("\nCreating wallet...")
                wallet = WalletFactory(user=user)

                self.stdout.write("\nCreated credit cards...")
                num_cards = random.randint(0, 3)
                for _ in range(num_cards):
                    WalletCardFactory(wallet=wallet)
                    self.stdout.write(self.style.SUCCESS(f"Added credit card to {user.username}'s wallet"))
                    
            self.stdout.write(self.style.SUCCESS("\nSuccessfully seeded all relations!"))

        except KeyboardInterrupt as e:
            self.stdout.write("Aborted seeding.")
