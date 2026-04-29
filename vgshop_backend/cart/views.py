from rest_framework import viewsets, status, mixins
from .models import CartItem, Order, OrderItem
from rest_framework.permissions import IsAuthenticated
from account.permissions import IsInCustomerGroup
from .serializers import (
    CartItemSerializer,
    CartItemCreateSerializer,
    OrderSerializer,
    OrderCreateSerializer,
)
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response


class CartModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsInCustomerGroup]

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
