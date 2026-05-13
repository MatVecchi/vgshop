from django.db import IntegrityError
from typing import ReadOnly
from account.serializers import UserSerializer, UserProfileSerializer
from django.db import transaction
from rest_framework import serializers
from family.models import Family
from account.models import User

class FamilySerializer(serializers.ModelSerializer):
    manager = UserProfileSerializer(read_only=True)
    class Meta:
        model = Family
        fields = ["id", "code", "manager"]
        read_only_fields = ["id", "manager", "code"]

class FamilyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Family
        fields = []

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user

        family, success = Family.objects.get_or_create(
            manager=user
        )

        if user.family is not None:
            raise serializers.ValidationError("User is already in a family")

        user.family = family
        user.save()

        return family

class FamilyMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "profile_image"]