from rest_framework import serializers
from .models import Wallet, WalletCard, CreditCard, Transaction
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
import datetime
import hashlib


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ["id", "movement", "date"]


class CreditCardSerializer(serializers.ModelSerializer):
    encrypted_number = serializers.SerializerMethodField(
        method_name="get_encrypted_number"
    )

    class Meta:
        model = CreditCard
        fields = ["id", "encrypted_number", "name", "expiration_date"]

    def get_encrypted_number(self, obj):
        number = obj.number
        return f"**** **** **** {number[-4:]}"


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
                if ( credit_card.name != validated_data["name"].upper() or credit_card.expiration_date != validated_data["expiration_date"] ):
                    raise serializers.ValidationError(
                        {
                            "number": [
                                "Credenziali della carta non valide"
                            ]
                        }
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
            raise serializers.ValidationError({"number": ["Errore nella registrazione della carta"]})

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

    class Meta:
        model = Transaction
        fields = ["deposit"]

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        movement = validated_data["deposit"]
        wallet = get_object_or_404(Wallet, user=user)

        try:
            transaction, _ = Transaction.objects.get_or_create(
                wallet=wallet, movement=movement
            )
            return transaction
        except Exception as e:
            raise serializers.ValidationError("Errore nel deposito, riprova")

    def validate_deposit(self, value):
        if value > 0:
            return value
        raise serializers.ValidationError("Non puoi depositare una somma negativa")
