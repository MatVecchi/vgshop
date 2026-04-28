from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem
from games.serializers import GameSerializer
from games.models import Game
from django.shortcuts import get_object_or_404
from django.db import IntegrityError


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

    def create(self, validated_data):
        user = self.context["request"].user
        game_title = validated_data["game"]["title"]
        game = get_object_or_404(Game, title=game_title)

        try:
            cart, cart_created = Cart.objects.get_or_create(user=user)
            cart_item, cart_item_created = CartItem.objects.create(cart=cart, game=game)
            return cart_item

        except IntegrityError:
            raise serializers.ValidationError(
                {"cart_item": "Hai già aggiunto al carrello questo articolo"}
            )
        except Exception as e:
            raise serializers.ValidationError({"cart": str(e)})


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    user = serializers.CharField(source="user.username", read_only=True)
    total = serializers.SerializerMethodField(method_name="get_total_cost")

    class Meta:
        model = Cart
        fields = [
            "user",
            "date",
            "items",
            "total",
        ]

    def get_total_cost(self, cart):
        return sum(cart_item.game.price for cart_item in cart.items.all())


class OrderItemSerializer(serializers.ModelSerializer):
    game = GameSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "game",
        ]


class OrderSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", read_only=True)
    order_items = OrderItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField(method_name="get_total_cost")

    class Meta:
        model = Order
        fields = ["user", "date", "order_items", "total"]

    def get_total_cost(self, order):
        return sum(row_order.game.price for row_order in order.order_items.all())
