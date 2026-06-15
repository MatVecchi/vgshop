from rest_framework import serializers
from .models import Game, GameImage, Tag
from reviews.models import Review
from django.db import transaction
from statistics import mean
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
    publisher = serializers.CharField(source="publisher.username", read_only=True)
    stars = serializers.SerializerMethodField(method_name="calculate_rating")
    is_owner = serializers.SerializerMethodField(
        method_name="get_is_owner", read_only=True
    )

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
            "stars",
            "is_owner",
        ]

    def get_is_owner(self, obj):
        request = self.context.get("request")
        return request.user == obj.publisher

    def calculate_rating(self, game):
        reviews = Review.objects.filter(game__title=game.title)
        if len(reviews) == 0:
            return 0
        return round(mean((r.stars for r in reviews)), 2)


class GameRegisterSerializer(serializers.ModelSerializer):
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=True,
    )

    tag_list = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
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
        extra_kwargs = {"publisher": {"read_only": True}}

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

    def validate_tag_list(self, value):
        if not value:
            return value

        existing_tags = Tag.objects.filter(name__in=value).values_list(
            "name", flat=True
        )
        not_existing_tags = set(value) - set(existing_tags)

        if not_existing_tags:
            raise serializers.ValidationError("Tag non esistente")
        return value

    def validate_release_date(self, value):
        if value < datetime.date(1972, 11, 29):
            raise serializers.ValidationError("Data non valida")
        return value

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Il prezzo deve essere positivo o nullo")
        return value


class GameUpdateSerializer(GameRegisterSerializer):
    images = GameImageSerializer(many=True, read_only=True)
    publisher = serializers.CharField(source="publisher.username", read_only=True)
    is_owner = serializers.SerializerMethodField(
        method_name="get_is_owner", read_only=True
    )
    stars = serializers.SerializerMethodField(method_name="calculate_rating", read_only=True)

    uploaded_images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=False,
    )
    keep_images = serializers.ListField(
        child=serializers.CharField(),
        write_only = True,
        required=False
    )

    class Meta(GameRegisterSerializer.Meta):
        fields = GameRegisterSerializer.Meta.fields + [
            "images",
            "publisher",
            "is_owner",
            "stars",
            "keep_images"
        ]

    def get_is_owner(self, obj):
        request = self.context.get("request")
        return request.user == obj.publisher
    
    def calculate_rating(self, game):
        reviews = Review.objects.filter(game__title=game.title)
        if len(reviews) == 0:
            return 0
        return round(mean((r.stars for r in reviews)), 2)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["tag_list"] = TagSerializer(instance.tag_list.all(), many=True).data
        return data

    def update(self, instance, validated_data):
        new_images = validated_data.pop("uploaded_images", [])
        keep_images = validated_data.pop("keep_images", [])
        
        tag_list = validated_data.pop("tag_list", None)

        instance = super().update(instance, validated_data)
    
        if keep_images:
            image_to_delete = instance.images.exclude(image__in=keep_images)
            image_to_delete.delete()
        else:
            instance.images.all().delete()

        if new_images:
            for image in new_images:
                GameImage.objects.create(game=instance, image=image)


        if tag_list:
            instance.tag_list.set(tag_list)

        return instance


class GamePieChartSerializer(serializers.Serializer):
    title = serializers.CharField(source="game__title")
    price = serializers.DecimalField(
        source="game__price", max_digits=10, decimal_places=2
    )
    count = serializers.IntegerField()


class GameChartSerializer(serializers.Serializer):
    month = serializers.CharField()

    # metodo richiamato nella costruzione del json
    def to_representation(self, instance):
        data = super().to_representation(instance)

        for key, value in instance.items():
            if key != "month":
                data[key] = value
        return data


class GameAreaChartSerializer(serializers.Serializer):
    date = serializers.DateField()

    # metodo richiamato nella costruzione del json
    def to_representation(self, instance):
        data = super().to_representation(instance)

        for key, value in instance.items():
            if key != "date":
                data[key] = value
        return data
