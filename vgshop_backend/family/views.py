from games.models import Game
from friends.views import are_friends
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status, viewsets, mixins
from rest_framework.permissions import IsAuthenticated
from account.serializers import UserProfileSerializer
from account.permissions import IsInCustomerGroup
from account.models import User
from rest_framework.filters import OrderingFilter
from family.serializers import FamilySerializer, FamilyCreateSerializer, FamilyMemberSerializer
from family.models import Family
from cart.models import Library
from cart.serializers import LibrarySerializer

class FamilyModelViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.CreateModelMixin, mixins.DestroyModelMixin):
    permission_classes = [IsAuthenticated, IsInCustomerGroup]

    def get_queryset(self):
        user = self.request.user
        if user.family is None:
            return Family.objects.none()
        return Family.objects.filter(pk=user.family.id) 
    
    def get_serializer_class(self):
        if self.action == "create":
            return FamilyCreateSerializer
        return FamilySerializer
    
    @action(
        detail=False, methods=["GET"], url_path="games"
    )
    def family_library(self, request):
        user = request.user
        if user.family is None:
            return Response(
                {"message": "Non hai una famiglia"},
                status=status.HTTP_403_FORBIDDEN,
            )

        family_members = User.objects.filter(family=user.family).exclude(id=user.id)
        user_games = Library.objects.filter(user=user).values_list('game', flat=True)
        library = Library.objects.filter(user__in=family_members).exclude(game__in=user_games)
        titles = [ item.game.title for item in library]
        return Response({"titles": titles}, status=status.HTTP_200_OK)
    
    @action(
        detail=False, methods=["GET"], url_path="games/(?P<game_id>[^/.]+)"
    )
    def family_game(self, request, game_id):
        user = request.user
        if user.family is None:
            return Response(
                {"message": "Non hai una famiglia"},
                status=status.HTTP_403_FORBIDDEN,
            )
        game = get_object_or_404(Game, title=game_id)
        family_members = User.objects.filter(family=user.family).exclude(id=user.id)
        library = Library.objects.filter(user__in=family_members, game=game).first()
        serializer = LibrarySerializer(library, context={"request":request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class FamilyMemberModelViewSet(viewsets.GenericViewSet, mixins.ListModelMixin):
    permission_classes = [IsAuthenticated, IsInCustomerGroup]
    serializer_class = FamilyMemberSerializer

    def get_queryset(self):
        user = self.request.user
        if user.family is None:
            return User.objects.none()
        return User.objects.filter(family=user.family)
