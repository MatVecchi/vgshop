from django.db import IntegrityError
from typing import ReadOnly
from account.serializers import UserSerializer, UserProfileSerializer
from django.db import transaction
from rest_framework import serializers
from .models import Family

class FamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = Family
        fields = ["code", "manager"]
        read_only_fields = ["manager"]