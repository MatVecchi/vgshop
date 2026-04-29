from typing import ReadOnly
from account.serializers import UserSerializer, UserProfileSerializer
from django.db import transaction
from rest_framework import serializers
from account.models import User
from .models import Friend

class FriendSerializer(serializers.ModelSerializer):
    first_friend = UserSerializer(read_only=True)
    second_friend = UserSerializer(read_only=True)
    class Meta:
        model = Friend
        fields = ["first_friend", "second_friend", "date", "status"]

class FriendCreateSerializer(serializers.ModelSerializer):

    second_friend = serializers.CharField(
        source='second_friend.username',
        write_only=True
    )

    class Meta:
        model = Friend
        fields = ["second_friend"]

    @transaction.atomic
    def create(self, validated_data):
        print(validated_data["second_friend"])
        friend, success = Friend.objects.get_or_create(first_friend=self.context['request'].user, second_friend=User.objects.get(username=validated_data["second_friend"]["username"]))
        return friend

class FriendUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friend
        fields = ["status"]

    def validate_status(self, value):
        if not self.instance:
            return
        
        status = self.instance.status
        if status != Friend.Status.PENDING:
            return serializers.ValidationError("Azione non consentita")
        return value

class FriendGetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friend
        fields = ["status"]

    def to_representation(self, instance):
        # Get serialized id and status
        representation = super().to_representation(instance)
        
        request = self.context.get('request')
        if not request:
            return representation

        # Determine which user is the "friend" relative to the requester
        user = request.user
        if instance.first_friend == user:
            friend = instance.second_friend
            is_sender = True
        else:
            friend = instance.first_friend
            is_sender = False
            
        # Serialize friend's details
        friend_data = UserProfileSerializer(friend, context=self.context).data
        
        # Flatten friend's data (username, profile_image) into the representation
        representation.update(friend_data)
        
        # Add a flag to distinguish if the request was sent or received by the current user
        representation["is_sender"] = is_sender
        
        return representation