from rest_framework import viewsets, status, mixins
from .models import CartItem, Order, Library
from rest_framework.permissions import IsAuthenticated
from account.permissions import IsInCustomerGroup
from account.models import User
from .serializers import (
    CartItemSerializer,
    CartItemCreateSerializer,
    OrderSerializer,
    OrderCreateSerializer,
    LibrarySerializer,
)
from friends.models import Friend
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404

class CartOrderPaginator(PageNumberPagination):
    page_size = 12


class CartModelViewSet(viewsets.GenericViewSet,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin):
    
    permission_classes = [IsAuthenticated, IsInCustomerGroup]
    pagination_class = CartOrderPaginator

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return CartItemCreateSerializer
        else:
            return CartItemSerializer

    parser_classes = (MultiPartParser, FormParser)

    # Non serve modificare i metodi per verificare l'utente perchè il queryset
    # su cui lavora comprende solo i giochi di quell'utente


# Ordini del Customer, separati dall'ordini del publisher per la dashboard


class OrderModelViewSet(
    viewsets.GenericViewSet,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
):
    permission_classes = [IsAuthenticated, IsInCustomerGroup]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related(
            "order_items__game"
        )  # Pre-carica i dati per velocizzare il costo totale

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return OrderSerializer
        return OrderCreateSerializer

    # create serve per poter confermare un pagamento dal carrello


class LibraryModelViewSet(
    viewsets.GenericViewSet, mixins.ListModelMixin, mixins.RetrieveModelMixin
):
    permission_classes = [IsAuthenticated, IsInCustomerGroup]
    serializer_class = LibrarySerializer

    def get_queryset(self):
        return Library.objects.filter(user=self.request.user)

    @action(
        detail=False, methods=["GET"], url_path="friend/(?P<friend_username>[^/.]+)"
    )
    def firend_library(self, request, friend_username):
        friend = get_object_or_404(User, username=friend_username)
        is_first_friend = Friend.objects.filter(
            first_friend=request.user,
            second_friend=friend,
            status=Friend.Status.ACCEPTED,
        ).exists()
        is_second_friend = Friend.objects.filter(
            first_friend=friend,
            second_friend=request.user,
            status=Friend.Status.ACCEPTED,
        ).exists()

        if is_first_friend or is_second_friend:
            library = Library.objects.filter(user=friend)
            serializer = self.get_serializer(library, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(
                {"message": "Non sei amico con questo utente"},
                status=status.HTTP_403_FORBIDDEN,
            )
