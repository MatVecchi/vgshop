from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status, viewsets, mixins
from rest_framework.permissions import IsAuthenticated
from account.models import User
from account.serializers import UserProfileSerializer
from account.permissions import IsInCustomerGroup
from .models import Friend, Message
from .serializers import FriendSerializer, FriendCreateSerializer, FriendUpdateSerializer, FriendGetSerializer, MessageSerializer, MessageCreateSerializer, MessageReadSerializer
from rest_framework.filters import OrderingFilter


class CataloguePaginator(PageNumberPagination):
    page_size=15

class FriendsModelViewSet(viewsets.ModelViewSet):
    
    permission_classes = [IsAuthenticated, IsInCustomerGroup]
    pagination_class = CataloguePaginator
    search_fields = ["first_friend__username", "second_friend__username"]
    lookup_field = "username"

    def get_object(self):
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]
        user = self.request.user

        from account.models import User
        from django.shortcuts import get_object_or_404
        from django.db.models import Q

        other_user = get_object_or_404(User, username=lookup_value)
        
        friendship = get_object_or_404(
            Friend,
            Q(first_friend=user, second_friend=other_user) | 
            Q(first_friend=other_user, second_friend=user)
        )
        
        self.check_object_permissions(self.request, friendship)
        return friendship

    def get_queryset(self):
        user = self.request.user
        if self.action == "update_partial":
            return Friend.objects.filter(second_friend=user)
        return Friend.objects.filter(first_friend=user) | Friend.objects.filter(second_friend=user)

    def get_serializer_class(self):
        if self.action == "create":
            return FriendCreateSerializer
        elif self.action == "partial_update":
            return FriendUpdateSerializer
        elif self.action == "list":
            return FriendGetSerializer
        else:
            return FriendSerializer

    def list(self, request):
        search = request.GET.get("search")
        user = request.user

        if search:
            friends_1 = Friend.objects.filter(first_friend=user).values_list('second_friend', flat=True)
            friends_2 = Friend.objects.filter(second_friend=user).values_list('first_friend', flat=True)
            
            users_not_friends = User.objects.filter(username__icontains=search, groups__name="Customer") \
                .exclude(id=user.id) \
                .exclude(id__in=friends_1) \
                .exclude(id__in=friends_2)[:5]
                
            serializer = UserProfileSerializer(users_not_friends, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        return super().list(request)

    def update(self, request, *args, **kwargs):
        if not kwargs.get('partial', False):
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        return super().update(request, *args, **kwargs)

class MessagesPaginator(PageNumberPagination):
    page_size = 15

class ChatModelViewSet(viewsets.GenericViewSet,  
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.UpdateModelMixin,
):
    permission_classes = [IsAuthenticated, IsInCustomerGroup]
    pagination_class = MessagesPaginator
    filter_backends = [OrderingFilter]
    ordering_fields = ["date"]
    ordering = ["-date"]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(sender=user) | Message.objects.filter(receiver=user)
    
    def get_serializer_class(self):
        if self.action == "create":
            return MessageCreateSerializer
        elif self.action == "list":
            return MessageSerializer
        elif self.action == "partial_update":
            return MessageReadSerializer

    def list(self, request):
        friend = request.GET.get("friend", None)
        if not Friend:
            return Response({"msg": "friend field not found"}, status=status.HTTP_400_BAD_REQUEST)
        messages = self.get_queryset().filter(sender__username=friend) | self.get_queryset().filter(receiver__username=friend)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)        
    
    def update(self, request, *args, **kwargs):
        if not kwargs.get('partial', False):
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        return super().update(request, *args, **kwargs)