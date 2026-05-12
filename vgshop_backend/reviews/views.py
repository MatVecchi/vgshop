from rest_framework import viewsets, status, mixins, filters
from .models import Review
from .serializers import ReviewSerializer, AddReviewSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from account.permissions import IsInCustomerGroup
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import ValidationError


class ReviewPaginator(PageNumberPagination):
    max_page_size = 12


class ReviewViewSet(
    viewsets.GenericViewSet, mixins.ListModelMixin, mixins.CreateModelMixin
):
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    ordering_fields = ["date", "stars"]
    ordering = ["-date"]

    pagination_class = ReviewPaginator
    parser_classes = (MultiPartParser, FormParser)

    def get_permissions(self):
        permission_classes = [IsAuthenticated]

        if self.action in ["list"]:
            permission_classes = [AllowAny]
        elif self.action in ["create"]:
            permission_classes = [IsAuthenticated, IsInCustomerGroup]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action in ["list"]:
            return ReviewSerializer
        return AddReviewSerializer

    def get_queryset(self):
        game_title = self.kwargs.get("game", None)

        if not game_title:
            raise ValidationError({"message": "Titolo del gioco mancante !"})

        result = Review.objects.filter(game__title=game_title).select_related("user")
        return result
