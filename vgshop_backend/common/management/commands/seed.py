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
from cart.factories import CartItemFactory, LibraryFactory, OrderFactory, OrderItemFactory
from reviews.factories import ReviewFactory
from wallet.factories import WalletFactory, WalletCardFactory, TransactionFactory
from wallet.models import Wallet
from friends.models import Message
from django.db.models import Q
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
            
            # Ensure unique lists of users and games to prevent duplicate seeding and UNIQUE constraint failures
            users = list(set(users))
            games = list(set(games))

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
                        chat_messages = list(Message.objects.filter(
                            Q(sender=user, receiver=friend) | Q(sender=friend, receiver=user)
                        ).order_by('date'))
                        
                        for idx, msg in enumerate(chat_messages):
                            msg_sender = msg.sender
                            for prev_msg in chat_messages[:idx]:
                                if prev_msg.sender != msg_sender and prev_msg.status != "R":
                                    prev_msg.status = "R"
                                    prev_msg.save()
                                    
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
                num_owned = random.randint(0, min(20, len(games)))
                owned_games = random.sample(games, num_owned)
                
                non_owned_games = [g for g in games if g not in owned_games]
                num_cart = random.randint(0, min(3, len(non_owned_games)))
                cart_games = random.sample(non_owned_games, num_cart)
                
                for game in cart_games:
                    CartItemFactory(user=user, game=game)
                    self.stdout.write(self.style.SUCCESS(f"Added {game.title} to {user.username}'s cart"))
                
                wallet_purchases = []
                card_purchases = []
                for game in owned_games:
                    if random.random() < 0.5:  
                        wallet_purchases.append(game)
                    else:
                        card_purchases.append(game)
                
                def chunk_list(lst, min_size=1, max_size=3):
                    chunks = []
                    i = 0
                    while i < len(lst):
                        size = random.randint(min_size, max_size)
                        chunks.append(lst[i:i+size])
                        i += size
                    return chunks
                
                wallet_chunks = chunk_list(wallet_purchases)
                card_chunks = chunk_list(card_purchases)
                
                wallet_orders_info = []
                for chunk in wallet_chunks:
                    order = OrderFactory(user=user, payment_method="W")
                    total_price = 0
                    for game in chunk:
                        OrderItemFactory(order=order, game=game)
                        LibraryFactory(user=user, game=game)
                        total_price += game.price
                        self.stdout.write(self.style.SUCCESS(f"Added {game.title} to {user.username}'s library via Wallet Order"))
                    wallet_orders_info.append(total_price)
                    
                for chunk in card_chunks:
                    order = OrderFactory(user=user, payment_method="C")
                    for game in chunk:
                        OrderItemFactory(order=order, game=game)
                        LibraryFactory(user=user, game=game)
                        self.stdout.write(self.style.SUCCESS(f"Added {game.title} to {user.username}'s library via Card Order"))

                self.stdout.write("\nCreating reviews...")
                if owned_games:
                    num_reviews = random.randint(0, min(20, len(owned_games)))
                    review_games = random.sample(owned_games, num_reviews)
                    for game in review_games:
                        ReviewFactory(user=user, game=game)
                        self.stdout.write(self.style.SUCCESS(f"{user.username} reviewed {game.title}"))
                
                self.stdout.write("\nCreating wallet and transactions...")
                wallet = WalletFactory(user=user, credit=0)
                
                total_purchase_cost = sum(wallet_orders_info)
                remaining_credit = random.randint(10, 200)
                needed_deposits = total_purchase_cost + remaining_credit
                
                num_deposits = random.randint(1, 3)
                deposits = []
                if num_deposits == 1:
                    deposits.append(needed_deposits)
                elif num_deposits == 2:
                    d1 = random.randint(int(needed_deposits * 0.3), int(needed_deposits * 0.7))
                    deposits.append(d1)
                    deposits.append(needed_deposits - d1)
                else:
                    d1 = random.randint(int(needed_deposits * 0.2), int(needed_deposits * 0.4))
                    d2 = random.randint(int(needed_deposits * 0.2), int(needed_deposits * 0.5))
                    deposits.append(d1)
                    deposits.append(d2)
                    deposits.append(needed_deposits - d1 - d2)
                
                total_credit = 0
                
                for deposit_amt in deposits:
                    TransactionFactory(
                        wallet=wallet,
                        movement=deposit_amt,
                    )
                    total_credit += deposit_amt
                
                for order_total in wallet_orders_info:
                    TransactionFactory(
                        wallet=wallet,
                        movement=-order_total,
                    )
                    total_credit -= order_total
                
                wallet.credit = total_credit
                wallet.save()
                self.stdout.write(self.style.SUCCESS(f"Created wallet for {user.username} with credit {total_credit} and {len(deposits) + len(wallet_orders_info)} transactions"))

                self.stdout.write("\nCreated credit cards...")
                num_cards = random.randint(0, 3)
                for _ in range(num_cards):
                    WalletCardFactory(wallet=wallet)
                    self.stdout.write(self.style.SUCCESS(f"Added credit card to {user.username}'s wallet"))
                    
            self.stdout.write(self.style.SUCCESS("\nSuccessfully seeded all relations!"))

        except KeyboardInterrupt as e:
            self.stdout.write("Aborted seeding.")
