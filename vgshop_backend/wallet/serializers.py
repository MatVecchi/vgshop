from rest_framework import serializers
from .models import Wallet, WalletCard, CreditCard, Transaction
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.core.validators import RegexValidator
from django.db import IntegrityError
import datetime
import hashlib


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["id", "movement", "date"]


class CreditCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditCard
        fields = ["id", "number", "name", "expiration_date"]


class CardRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditCard
        fields = ["name", "number", "expiration_date"]

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        wallet = get_object_or_404(Wallet, user=user)

        card_number_hash = hashlib.sha256(validated_data["number"].encode()).hexdigest()

        validated_data["number_hash"] = card_number_hash

        try:
            credit_card = CreditCard.objects.filter(
                number_hash=card_number_hash,
            ).first()

            if credit_card:
                if (
                    credit_card.name != validated_data["name"].upper()
                    or credit_card.expiration_date != validated_data["expiration_date"]
                ):
                    raise serializers.ValidationError(
                        {"number": ["Credenziali della carta non valide"]}
                    )
            else:
                validated_data["name"] = validated_data["name"].upper()
                credit_card = CreditCard.objects.create(**validated_data)

            wallet_card, wallet_inserted = WalletCard.objects.get_or_create(
                wallet=wallet, credit_card=credit_card
            )
            if not wallet_inserted:
                raise serializers.ValidationError(
                    {"message": ["Hai già questa carta nel tuo wallet"]}
                )

            return credit_card
        except IntegrityError as e:
            raise serializers.ValidationError(
                {"number": ["Errore nella registrazione della carta"]}
            )

    def validate_expiration_date(self, value):
        today = datetime.date.today()
        if value > today:
            return value
        else:
            raise serializers.ValidationError("La carta è scaduta")


class DepositSerializer(serializers.ModelSerializer):
    deposit = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        write_only=True,
        required=True,
    )

    number_validator = RegexValidator(
        regex=r"^\d+$", message="Il numero deve avere 16 cifre"
    )

    number = serializers.CharField(
        write_only=True, min_length=16, max_length=16, validators=[number_validator]
    )

    cvv_validator = RegexValidator(
        regex=r"^\d+$", message="Il cvv deve avere solo 3 cifre"
    )
    cvv = serializers.CharField(
        write_only=True, min_length=3, max_length=3, validators=[cvv_validator]
    )

    expiration_date = serializers.DateField(write_only=True)
    name = serializers.CharField(write_only=True)

    class Meta:
        model = Transaction
        fields = ["deposit", "number", "name", "expiration_date", "cvv"]

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        movement = validated_data["deposit"]
        wallet = get_object_or_404(Wallet, user=user)

        try:
            transaction, _ = Transaction.objects.get_or_create(
                wallet=wallet, movement=movement
            )
            wallet.credit += movement
            wallet.save()
            return transaction
        except Exception as e:
            raise serializers.ValidationError("Errore nel deposito, riprova")

    def validate_expiration_date(self, value):
        today = datetime.date.today()
        if value < today:
            raise serializers.ValidationError("La carta è scaduta")
        return value

    def validate_deposit(self, value):
        if value > 0:
            return value
        raise serializers.ValidationError("Non puoi depositare una somma negativa")
