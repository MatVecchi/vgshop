from friends.views import are_friends
from account.permissions import IsInCustomerGroup
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny, IsAuthenticated
from account.serializers import (
    UserSerializer,
    UserRegisterSerializer,
    UserProfileSerializer,
    UserUpdateSerializer,
    ChangeLostPassword,
    ChangePasswordSerializer,
    RequestForgotPassword,
    FamilyJoinSerializer,
)
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from account.models import User
from wallet.models import Wallet
from django.db import transaction
from family.models import Family
from django.shortcuts import get_object_or_404
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
import os


def get_user_from_token(raw_token):
    try:
        token = AccessToken(raw_token)
        return User.objects.get(id=token["user_id"])
    except (User.DoesNotExist, Exception):
        return None


class AccountViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    # Permessi specifici per ogni azione (default: IsAuthenticated)
    permission_map = {
        "login": [AllowAny],
        "register": [AllowAny],
        "token_refresh": [AllowAny],
        "lost_password": [AllowAny],
        "confirm_password": [AllowAny],
        "logout": [IsAuthenticated],
        "profile": [IsAuthenticated],
        "username": [IsAuthenticated],
        "update_profile": [IsAuthenticated],
        "reset_password": [IsAuthenticated],
    }

    serializer_map = {
        "login": UserSerializer,
        "register": UserRegisterSerializer,
        "token_refresh": TokenRefreshSerializer,
        "lost_password": RequestForgotPassword,
        "confirm_password": ChangeLostPassword,
        "logout": UserSerializer,
        "profile": UserSerializer,
        "username": UserProfileSerializer,
        "update_profile": UserUpdateSerializer,
        "reset_password": ChangePasswordSerializer,
    }

    def get_permissions(self):
        permission_classes = self.permission_map.get(self.action, [IsAuthenticated])
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        return self.serializer_map.get(self.action, None)

    def login(self, request):
        try:
            username = request.data.get("username")
            password = request.data.get("password")

            user = authenticate(username=username, password=password)
            if user:
                refresh = RefreshToken.for_user(user)
                response = Response(
                    {
                        "user": self.get_serializer(user, context={"request": request}).data,
                        "message": "Login successful !",
                    }
                )

                response.set_cookie(
                    key="access_token",
                    value=str(refresh.access_token),
                    httponly=True,
                    secure=False,  # In produzione metti True
                    max_age=60 * 15,  # 15 minuti
                    samesite="Lax",
                    path="/",
                )
                response.set_cookie(
                    key="refresh_token",
                    value=str(refresh),
                    httponly=True,
                    secure=False,
                    max_age=60 * 60 * 24 * 30,  # 30 giorni
                    samesite="Lax",
                    path="/api/token/refresh/",
                )
                response.set_cookie(
                    key="is_logged_in",
                    value="true",
                    httponly=False,  # accessibile dal frontend se serve
                    secure=False,
                    max_age=60 * 60 * 24 * 30,  # 30 giorni
                    samesite="Lax",
                    path="/",
                )
                return response
            return Response(
                {"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception:
            return Response(
                {"message": "Server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @transaction.atomic
    def register(self, request):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            Wallet.objects.create(user=user)

            return Response(
                {"message": "Registration completed !"}, status=status.HTTP_201_CREATED
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def token_refresh(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            print("Refresh token mancante nei cookie")
            return Response(
                {"error": "Refresh token missing"}, status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = self.get_serializer(data={"refresh": refresh_token})

        try:
            serializer.is_valid(raise_exception=True)
        except (InvalidToken, TokenError):
            print("Token non valido o scaduto")
            return Response(
                {"error": "Token not valid"}, status=status.HTTP_401_UNAUTHORIZED
            )

        response = Response({"detail": "Token updated"}, status=status.HTTP_200_OK)

        response.set_cookie(
            key="access_token",
            value=serializer.validated_data["access"],
            httponly=True,
            secure=False,  # In produzione metti True
            max_age=60 * 15,  # 15 minuti
            samesite="Lax",
            path="/",
        )

        if "refresh" in serializer.validated_data:
            response.set_cookie(
                key="refresh_token",
                value=serializer.validated_data["refresh"],
                httponly=True,
                secure=False,
                max_age=60 * 60 * 24 * 30,  # 30 giorni
                samesite="Lax",
                path="/api/token/refresh/",
            )

        return response

    def logout(self, request):
        response = Response(
            {"message": "Logout successful !"}, status=status.HTTP_200_OK
        )
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token", path="/api/token/refresh/")
        response.delete_cookie("is_logged_in")
        return response

    # --- PROFILO ---

    def username(self, request):
        user = request.user
        serializer = self.get_serializer(user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def profile(self, request):
        user = request.user
        serializer = self.get_serializer(user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update_profile(self, request):
        user = request.user
        serializer = self.get_serializer(
            instance=user, data=request.data, partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                self.get_serializer(user, context={"request": request}).data,
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # --- PASSWORD ---

    def _modify_password(self, request, serializer_class, get_user):
        serializer = serializer_class(data=request.data, context={"request": request})
        if serializer.is_valid():
            user = get_user(serializer)
            user.set_password(serializer.validated_data["new_password"])
            user.save()
            return Response(
                {"message": "Password cambiata con successo !"},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def reset_password(self, request):
        return self._modify_password(
            request=request,
            serializer_class=self.get_serializer_class(),
             get_user=lambda _: request.user
        )
    
    def confirm_password(self, request):
       return self._modify_password(
           request=request,
           serializer_class=self.get_serializer_class(),
           get_user = lambda serializer: serializer.validated_data["user"]
       )
    

    def _change_password_email(self, user):
        email = user.email

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        context = {
            "username": user.username,
            "reset_link": f"http://{os.environ['DOMAIN']}:3000/reset_password/?uid={uid}&token={token}",
        }

        html_content = render_to_string("email/reset_password.html", context=context)
        text_content = strip_tags(html_content)

        msg = EmailMultiAlternatives(
            subject="Link per il cambio di password",
            body=text_content,
            from_email=settings.EMAIL_HOST_USER,
            to=[email],
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)

    def lost_password(self, request):
        serializer = self.get_serializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            try:
                user = User.objects.get(username=serializer.validated_data["username"])
                self._change_password_email(user)
            except Exception as e:
                pass
        return Response(
            {
                "message": [
                    "Ti abbiamo inviato un'email di cambio di password, vai e controlla !"
                ]
            }
        )




class FamilyJoinView(APIView):
    permission_classes = [IsAuthenticated, IsInCustomerGroup]

    def put(self, request, family_code):
        raw_token = request.COOKIES.get("access_token")
        if not raw_token:
            return Response(
                {"message": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED
            )
        family = get_object_or_404(Family, code=family_code)
        if User.objects.filter(family=family).count() >= 5:
            return Response(
                {"message": "Family is full"}, status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user
        if not are_friends(user, family.manager):
            return Response(
                {"message": "Family not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = FamilyJoinSerializer(
            user, data={"id": family.id}, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Family joined successfully !"}, status=status.HTTP_200_OK
            )
        return Response(
            {"message": "Family join failed", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )


class FamilyLeaveView(APIView):
    permission_classes = [IsAuthenticated, IsInCustomerGroup]

    def delete(self, request):
        raw_token = request.COOKIES.get("access_token")
        if not raw_token:
            return Response(
                {"message": "Token not found"}, status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = UserRegisterSerializer(
            request.user, data={"family": None}, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Family left successfully !"}, status=status.HTTP_200_OK
            )
        return Response(
            {"message": "Family left failed", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )
