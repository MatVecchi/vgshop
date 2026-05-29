from rest_framework import serializers
from account.models import User
from django.core import exceptions
from django.contrib.auth.password_validation import (
    validate_password as django_validate_password,
)
from django.contrib.auth.models import Group
from django.db import transaction
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.tokens import default_token_generator

# Cero un serializer per la classe user
# Preso un oggetto Model: User lo trasforma in un JSON leggibile da react


# Serializer --> crea il dizionario validated data che contiene l'attributo di classe (se esiste)
# in alternativa il relativo ed omonimo attributo del modello, se nessuno dei due esiste --> ignora


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "piva",
            "website",
            "profile_image",
            "iban",
        ]


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "profile_image"]


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    isPublisher = serializers.BooleanField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "password",
            "email",
            "family",
            "piva",
            "website",
            "isPublisher",
            "iban",
        ]

    @transaction.atomic
    def create(self, validated_data):
        is_publisher_value = validated_data.pop("isPublisher")
        password_value = validated_data.pop("password")

        piva = validated_data.get("piva", None)
        iban = validated_data.get("iban", None)
        website = validated_data.get("website", None)

        if is_publisher_value:
            if not piva or piva == "":
                raise serializers.ValidationError(
                    {"message": ["Non puoi essere publisher senza la partita iva"]}
                )
            if not iban or iban == "":
                raise serializers.ValidationError(
                    {"message": ["Non puoi essere publisher senza iban"]}
                )
        else:
            validated_data["piva"] = None
            validated_data["website"] = None
            validated_data["iban"] = None

        user = User.objects.create_user(**validated_data, password=password_value)

        group, _ = Group.objects.get_or_create(
            name="Publisher" if is_publisher_value else "Customer"
        )
        user.groups.add(group)

        return user

    def validate_password(self, password):
        try:
            django_validate_password(
                password=password, user=User(self.initial_data.get("username"))
            )
        except exceptions.ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return password

    def validate_iban(self, iban):
        if iban == "" or iban is None:
            return None
        return iban

    def validate_piva(self, piva):
        if piva == "" or piva is None:
            return None
        return piva

    def validate_website(self, value):
        if value == "" or value is None:
            return None
        return value


class UserUpdateSerializer(UserSerializer):
    isPublisher = serializers.SerializerMethodField(
        method_name="verify_is_publisher", read_only=True
    )

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ["isPublisher"]

    def verify_is_publisher(self, obj):
        return obj.groups.filter(name="Publisher").exists()

    @transaction.atomic
    def update(self, instance, validated_data):

        is_publisher = self.verify_is_publisher(instance)

        if is_publisher:
            piva = validated_data.get("piva", instance.piva)
            iban = validated_data.get("iban", instance.iban)

            if not piva or piva == "":
                raise serializers.ValidationError(
                    {"message": ["Un publisher deve avere una partita iva valida !"]}
                )
            if not iban or iban == "":
                raise serializers.ValidationError(
                    {"message": ["Un publisher deve avere un Iban valido !"]}
                )
        else:
            validated_data.pop("website", None)
            validated_data.pop("iban", None)
            validated_data.pop("piva", None)

        instance = super().update(instance, validated_data)
        return instance


class ResetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
        validators=[django_validate_password],
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
        validators=[django_validate_password],
    )

    def validate(self, attrs):
        data = super().validate(attrs)
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError(
                {"message": ["Le password non corrispondono !"]}
            )
        return data


class RequestForgotPassword(serializers.Serializer):
    username = serializers.CharField(write_only=True, required=True)

    def validate_username(self, username):
        if not User.objects.filter(username=username).exists():
            raise serializers.ValidationError({"message": ["Utente non trovato !"]})
        return username


class ChangeLostPassword(ResetPasswordSerializer):
    uid = serializers.CharField(write_only=True, required=True)
    token = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        data = super().validate(attrs)

        try:
            uid = force_str(urlsafe_base64_decode(data["uid"]))
            user = User.objects.get(pk=uid)
        except Exception:
            raise serializers.ValidationError({"message": ["Link non valido !"]})

        if not default_token_generator.check_token(data["token"]):
            raise serializers.ValidationError({"message": ["Token scaduto !"]})

        data["user"] = user
        return data


class ChangePasswordSerializer(ResetPasswordSerializer):
    old_password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )

    def validate(self, attrs):
        data = super().validate(attrs)
        request = self.context.get("request", None)
        if not request.user:
            raise serializers.ValidationError({"message": ["Utente non trovato !"]})

        if not request.user.check_password(data["old_password"]):
            raise serializers.ValidationError(
                {"message": ["Vecchia password errata !"]}
            )

        data["user"] = request.user
        return attrs
