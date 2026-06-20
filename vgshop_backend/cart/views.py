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
from friends.views import are_friends
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from rest_framework.filters import OrderingFilter
from friends.views import are_friends
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from rest_framework.exceptions import PermissionDenied, NotFound


class CartPaginator(PageNumberPagination):
    page_size = 12


class OrderPaginator(PageNumberPagination):
    page_size = 5


class CartModelViewSet(
    viewsets.GenericViewSet,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
):
    permission_classes = [IsAuthenticated, IsInCustomerGroup]
    pagination_class = CartPaginator

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action in ["create"]:
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
    pagination_class = OrderPaginator
    filter_backends = [OrderingFilter]
    ordering_fields = ["date", "total"]
    ordering = ["-date"]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related(
            "order_items__game"
        )  # Pre-carica i dati per velocizzare il costo totale

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return OrderSerializer
        return OrderCreateSerializer

    def perform_create(self, serializer):
        result = super().perform_create(serializer)
        order = serializer.instance

        new_games = [order_item.game for order_item in order.order_items.all()]
        total = sum(game.price for game in new_games)
        context = {
            "items": new_games,
            "total": total,
            "payment_method": order.payment_method,
            "date": order.date,
        }

        html_content = render_to_string("email/confirm_order_email.html", context)
        text_content = strip_tags(html_content)

        msg = EmailMultiAlternatives(
            subject=f"Conferma Ordine #ORD-{order.id} - Grazie per il tuo acquisto!",
            body=text_content,
            from_email=settings.EMAIL_HOST_USER,
            to=[order.user.email],
        )

        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        return result

    # create serve per poter confermare un pagamento dal carrello


class LibraryModelViewSet(
    viewsets.GenericViewSet,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
):
    permission_classes = [IsAuthenticated, IsInCustomerGroup]
    serializer_class = LibrarySerializer

    lookup_url_kwarg = "game_title"
    lookup_value_regex = r"[^/]+"

    def get_queryset(self):
        if self.action in ["get_friend_library", "list_friend_titles"]:
            return Library.objects.filter(user=self.kwargs.get("friend_id"))
        return Library.objects.filter(user=self.request.user)

    def get_object(self):
        queryset = self.get_queryset()
        title = self.kwargs.get("game_title", None)
        game = get_object_or_404(queryset, game__title=title)
        return game

    def _verify_friend(self, request, friend_id):
        if not friend_id:
            raise NotFound("Amico non trovato !")

        friend = get_object_or_404(User, id=friend_id)

        if not are_friends(request.user, friend=friend):
            raise PermissionDenied("Non siete amici !")

        return friend

    @action(
        detail=True,
        methods=["GET"],
    )
    def get_friend_library(self, request, friend_id, *args, **kwargs):
        try:
            friend = self._verify_friend(request=request, friend_id=friend_id)
            game_title = kwargs.get("game_title", None)
            if game_title:
                friend_game = self.get_object()
            else:
                friend_game = self.get_queryset().first()
                if not friend_game:
                    raise NotFound(f"{friend.username} non ha giochi")

            serialzier = self.get_serializer(friend_game)
            return Response(serialzier.data, status=status.HTTP_200_OK)
        except PermissionDenied as e:
            return Response(
                {"message": e.detail},
                status=status.HTTP_403_FORBIDDEN,
            )
        except NotFound as e:
            return Response(
                {"message": e.detail},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"message": "Amico non valido o non trovato !"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(
        detail=False,
        methods=["GET"],
    )
    def list_friend_titles(self, request, friend_id):
        try:
            friend = self._verify_friend(request=request, friend_id=friend_id)
            friend_library = self.get_queryset()
            friend_titles = [
                {
                    "title": item.game.title,
                }
                for item in friend_library
            ]
            return Response({"titles": friend_titles}, status=status.HTTP_200_OK)

        except PermissionDenied as e:
            return Response(
                {"message": e.detail},
                status=status.HTTP_403_FORBIDDEN,
            )
        except NotFound as e:
            return Response(
                {"message": e.detail},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"message": "Amico non valido o non trovato !"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=False, methods=["GET"])
    def list_titles(self, request):
        queryset = self.get_queryset()
        titles = [
            {
                "title": item.game.title,
                "collection": item.collection.name if item.collection else None,
            }
            for item in queryset
        ]
        return Response({"titles": titles}, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        if not kwargs.get("partial", False):
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        return super().update(request, *args, **kwargs)
