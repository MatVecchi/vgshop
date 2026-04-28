from rest_framework import serializers
from .models import Game, GameImage, Tag
from django.db import transaction
import datetime


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["name"]


class GameImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameImage
        fields = ["id", "image"]


class GameSerializer(serializers.ModelSerializer):
    tag_list = TagSerializer(many=True, read_only=True)
    images = GameImageSerializer(many=True, read_only=True)

    class Meta:
        model = Game
        fields = [
            "id",
            "title",
            "release_date",
            "price",
            "description",
            "video",
            "tag_list",
            "publisher",
            "images",
            "cover",
        ]


class GameRegisterSerializer(serializers.ModelSerializer):
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=True,
    )

    class Meta:
        model = Game
        fields = [
            "title",
            "release_date",
            "price",
            "description",
            "video",
            "tag_list",
            "cover",
            "uploaded_images",
        ]
        extra_kwargs = {
            'publisher': {'read_only': True}
        }

    @transaction.atomic
    def create(self, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        tags = validated_data.pop("tag_list", [])
        publisher = self.context["request"].user
        validated_data["publisher"] = publisher

        game = Game.objects.create(**validated_data)
        for image in uploaded_images:
            GameImage.objects.create(game=game, image=image)

        if tags:
            game.tag_list.set(tags)

        return game

    def validate_release_date(self, value):
        if value < datetime.date(1972, 11, 29):
            raise serializers.ValidationError("Data non valida")
        return value

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Il prezzo deve essere positivo o nullo")
        return value
