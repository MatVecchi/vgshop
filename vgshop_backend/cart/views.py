from rest_framework import viewsets, status
from .models import Cart
from rest_framework.permissions import IsAuthenticated
from account.permissions import IsInCustomerGroup
from .serializers import CartSerializer, CartItemSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404


class CartModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsInCustomerGroup]
    queryset = Cart.objects.all()

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return CartItemSerializer
        else:
            return Cart

    parser_classes = (MultiPartParser, FormParser)

    def list(self, request):
        user = request.user
        cart = get_object_or_404(Cart, username=user.username)
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        user = request.user
        if pk == user.username:
            cart = get_object_or_404(Cart, username=user.username)
            serializer = CartSerializer(cart)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(
            {"mesage": "Forbidden cart"}, status=status.HTTP_403_UNAUTHORIZED
        )
