from rest_framework.response import Response
from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from .serializers import (
    CardRegisterSerializer,
    TransactionSerializer,
    CreditCardSerializer,
    DepositSerializer,
)
from .models import Transaction, CreditCard, WalletCard
from account.permissions import IsInCustomerGroup
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.filters import OrderingFilter
from django.db import transaction


class TransactionPaginator(PageNumberPagination):
    max_page_size = 5


class WalletModelViewset(
    viewsets.GenericViewSet, mixins.ListModelMixin, mixins.CreateModelMixin
):
    permission_classes = [IsAuthenticated, IsInCustomerGroup]
    parser_classes = (MultiPartParser, FormParser)
    pagination_class = TransactionPaginator
    filter_backends = [OrderingFilter]
    ordering_fields = ["date", "movement"]
    ordering = ["-date"]

    def get_serializer_class(self):
        if self.action in ["list"]:
            return TransactionSerializer
        return DepositSerializer

    # carico il wallet dell'utente loggato e tutte le sue carte passando per la tabella intermedia con i related names
    def get_queryset(self):
        user = self.request.user
        return Transaction.objects.filter(wallet__user=user)

    @action(detail=False, methods=["GET"], url_path="wallet/credit")
    def get_credit(self):
        wallet = self.get_queryset()[0]
        return Response({"credit": wallet.credit})


class CreditCardModelViewSet(
    viewsets.GenericViewSet,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    mixins.CreateModelMixin,
):
    permission_classes = [IsAuthenticated, IsInCustomerGroup]
    parser_classes = (MultiPartParser, FormParser)

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return CreditCardSerializer
        else:
            return CardRegisterSerializer

    def get_queryset(self):
        user = self.request.user
        return CreditCard.objects.filter(wallets__wallet__user=user)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        user = request.user
        credit_card = self.get_object()

        try:
            wallet_card = WalletCard.objects.filter(
                wallet__user=user, credit_card=credit_card
            ).first()

            if not wallet_card:
                return Response(
                    {"message": "Carta non trovata"}, status=status.HTTP_404_NOT_FOUND
                )
            wallet_card.delete()

            if not WalletCard.objects.filter(credit_card=credit_card).exists():
                credit_card.delete()

            return Response(
                {"message": "Carta rimossa con successo"}, status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"messge": "Errore nella rimozione della carta"},
                status=status.HTTP_400_BAD_REQUEST,
            )
