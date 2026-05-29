from rest_framework import serializers
from .models import Library, CartItem, Order, OrderItem
from games.serializers import GameSerializer
from games.models import Game
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.core.validators import RegexValidator
from wallet.models import Wallet, Transaction
from decimal import Decimal
import datetime


class CartItemSerializer(serializers.ModelSerializer):
    game = GameSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = ["id", "game"]


class CartItemCreateSerializer(serializers.ModelSerializer):
    game = serializers.CharField(source="game.title", write_only=True, required=True)

    class Meta:
        model = CartItem
        fields = ["game"]

    def validate(self, attrs):
        user = self.context["request"].user
        game = get_object_or_404(Game, title=attrs["game"]["title"])

        if Library.objects.filter(user=user, game=game).exists():
            raise serializers.ValidationError(
                {"cart_item": "Hai già questo gioco nella libreria"}
            )

        if CartItem.objects.filter(user=user, game=game).exists():
            raise serializers.ValidationError(
                {"cart_item": "Hai già questo gioco nel carrello"}
            )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        game_title = validated_data["game"]["title"]
        game = get_object_or_404(Game, title=game_title)

        try:
            cart_item = CartItem.objects.create(user=user, game=game)
            return cart_item

        except Exception as e:
            raise serializers.ValidationError({"cart": str(e)})


class OrderItemSerializer(serializers.ModelSerializer):
    game = GameSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "game",
        ]


class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField(method_name="get_total_cost")

    class Meta:
        model = Order
        fields = ["id", "date", "order_items", "total", "payment_method"]

    def get_total_cost(self, order):
        return sum(row_order.game.price for row_order in order.order_items.all())


class OrderCreateSerializer(serializers.ModelSerializer):
    number_validator = RegexValidator(
        regex=r"^\d+$", message="Il numero deve avere 16 cifre"
    )

    number = serializers.CharField(
        write_only=True,
        min_length=16,
        max_length=16,
        validators=[number_validator],
        required=False,
    )

    cvv_validator = RegexValidator(
        regex=r"^\d+$", message="Il cvv deve avere solo 3 cifre"
    )
    cvv = serializers.CharField(
        write_only=True,
        min_length=3,
        max_length=3,
        validators=[cvv_validator],
        required=False,
    )

    expiration_date = serializers.DateField(write_only=True, required=False)
    name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Order
        fields = ["payment_method", "number", "cvv", "expiration_date", "name"]

    def validate(self, attrs):
        payment_method = attrs.get("payment_method", None)

        if not payment_method:
            raise serializers.ValidationError(
                {"payment_method": "Metodo di pagamento non valido"}
            )

        if payment_method == "C":
            required_fields = ["number", "cvv", "expiration_date", "name"]
            missing_fields = {}

            for field in required_fields:
                if not attrs.get(field):
                    missing_fields[field] = field + " mancante !"

            if missing_fields:
                raise serializers.ValidationError(missing_fields)
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        cart_items = CartItem.objects.filter(user=user)

        if cart_items.exists():
            total = Decimal(sum(item.game.price for item in cart_items))

            if validated_data["payment_method"] == "C":
                print("Il numero della carta è: ", validated_data["number"])
                # logica di pagamento con api Stripe
                
            else:
                wallet = get_object_or_404(Wallet, user=user)
                if wallet.credit < total:
                    raise serializers.ValidationError(
                        {"message": ["Non hai credito sufficiente per l'acquisto !"]}
                    )
                wallet.credit = wallet.credit - total
                wallet.save()
                transaction = Transaction.objects.create(wallet=wallet, movement=-total)

            for item in cart_items:
                publisher_wallet = get_object_or_404(Wallet, user=item.game.publisher )
                publisher_wallet.credit+=item.game.price
                publisher_wallet.save()

            order = Order.objects.create(
                user=user, payment_method=validated_data["payment_method"]
            )
            order_items = [
                OrderItem(order=order, game=item.game) for item in cart_items
            ]
            library_items = [Library(user=user, game=item.game) for item in cart_items]

            OrderItem.objects.bulk_create(order_items)
            Library.objects.bulk_create(library_items)
            cart_items.delete()

            return order
        else:
            raise serializers.ValidationError({"cart": "Il carrello è vuoto"})

    def validate_expiration_date(self, value):
        today = datetime.date.today()
        if value < today:
            raise serializers.ValidationError("La carta è scaduta")
        return value


class LibrarySerializer(serializers.ModelSerializer):
    game = GameSerializer(read_only=True)

    class Meta:
        model = Library
        fields = ["game"]
