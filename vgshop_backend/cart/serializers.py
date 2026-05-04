from rest_framework import serializers
from .models import Library, CartItem, Order, OrderItem
from games.serializers import GameSerializer
from games.models import Game
from django.shortcuts import get_object_or_404
from django.db import transaction


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
    class Meta:
        model = Order
        fields = ["payment_method"]

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        cart_items = CartItem.objects.filter(user=user)

        if cart_items.exists():
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


class LibrarySerializer(serializers.ModelSerializer):
    game = GameSerializer(read_only=True)

    class Meta:
        model = Library
        fields = ["game"]
