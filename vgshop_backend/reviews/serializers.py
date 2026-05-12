from rest_framework import serializers
from .models import Review
from games.models import Game
from django.db import transaction


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Review
        fields = ["user", "comment", "stars", "game", "date"]


class AddReviewSerializer(serializers.ModelSerializer):
    game = serializers.SlugRelatedField(slug_field="title", queryset=Game.objects.all())

    class Meta:
        model = Review
        fields = ["comment", "game", "stars"]

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user

        review = Review.objects.create(user=user, **validated_data)

        return review
