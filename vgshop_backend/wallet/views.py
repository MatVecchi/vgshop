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
from .models import Transaction, CreditCard, WalletCard, Wallet
from account.permissions import IsInCustomerGroup, IsInPublisherGroup
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.filters import OrderingFilter
from django.db import transaction
from rest_framework.views import APIView
from rest_framework import serializers
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.shortcuts import get_object_or_404
import datetime


class TransactionPaginator(PageNumberPagination):
    page_size = 4


class WalletModelViewset(
    viewsets.GenericViewSet, mixins.ListModelMixin, mixins.CreateModelMixin
):
    
    parser_classes = (MultiPartParser, FormParser)
    pagination_class = TransactionPaginator
    filter_backends = [OrderingFilter]
    ordering_fields = ["date", "movement"]
    ordering = ["-date"]

    def get_serializer_class(self):
        if self.action in ["list", "get_cash_back", "get_credit"]:
            return TransactionSerializer
        return DepositSerializer
    
    def get_permissions(self):
        permission_classes = [IsAuthenticated]
        if self.action in ["create"]:
            permission_classes += [IsInCustomerGroup]
        elif self.action in ["get_cash_back"]:
            permission_classes += [IsInPublisherGroup]
        return [permission() for permission in permission_classes]

    # carico il wallet dell'utente loggato e tutte le sue carte passando per la tabella intermedia con i related names
    def get_queryset(self):
        user = self.request.user
        return Transaction.objects.filter(wallet__user=user)

    @action(detail=False, methods=["GET"], url_path="wallet/credit")
    def get_credit(self, request):
        wallet = get_object_or_404(Wallet, user=request.user)
        return Response({"credit": wallet.credit})
    
    @action(detail=False, methods=["GET"], url_path="wallet/cash_back")
    @transaction.atomic
    def get_cash_back(self, request):
        wallet = get_object_or_404(Wallet, user=request.user)
        cash_back_amount = wallet.credit
        if cash_back_amount <= 0:
            return Response({"message": "Il conto è vuoto !"}, status=status.HTTP_400_BAD_REQUEST) 
        
        try:
            transaction = Transaction.objects.create(
                wallet=wallet, movement=-cash_back_amount
            )
            wallet.credit = 0
            wallet.save()
        except Exception as e:
            raise serializers.ValidationError("Errore nel ritiro, riprova")

        context = {
            "movement": cash_back_amount,
            "date": datetime.datetime.today(),
            "piva": request.user.piva,
            "iban": request.user.iban
        }

        html_content = render_to_string('email/cash_back.html', context)
        text_content = strip_tags(html_content)

        msg = EmailMultiAlternatives(
            subject="Conferma avvenuto ritiro - Grazie per il tuo sostegno!",
            body=text_content,
            from_email=settings.EMAIL_HOST_USER,
            to=[request.user.email]  
        )

        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)

        return Response({"message": "Ritiro avvenuto con successo !"})
    
    def perform_create(self, serializer):
        data = super().perform_create(serializer)
        completed_transaction = serializer.instance
        context = {
            "movement": completed_transaction.movement,
            "date": completed_transaction.date,
        }

        html_content = render_to_string('email/deposit.html', context)
        text_content = strip_tags(html_content)

        msg = EmailMultiAlternatives(
            subject="Conferma avvenuto deposito - Grazie per il tuo sostegno!",
            body=text_content,
            from_email=settings.EMAIL_HOST_USER,
            to=[self.request.user.email]  
        )

        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        return data


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

