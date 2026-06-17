from rest_framework import viewsets, status, mixins, filters
from .models import Review
from .serializers import ReviewSerializer, AddReviewSerializer, UpdateReviewSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from account.permissions import IsInCustomerGroup
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from django.db.models import Count
from .permissions import IsOwnerReviewer
from rest_framework.exceptions import NotFound
from rest_framework.exceptions import APIException


class ReviewPaginator(PageNumberPagination):
    page_size = 12


class ReviewViewSet(
    viewsets.GenericViewSet,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
):
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
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
        elif self.action in ["create", "my_reviews", "destroy", "partial_update"]:
            permission_classes = [IsAuthenticated, IsInCustomerGroup]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action in ["list", "my_reviews", "destroy"]:
            return ReviewSerializer
        if self.action in ["partial_update"]:
            return UpdateReviewSerializer
        return AddReviewSerializer

    # se non gli passa il gioco o non si richiama "my_reviews" allora lancia un validation error
    def get_queryset(self):
        if self.action in ["list"]:
            game_title = self.kwargs.get("game", None)
            star_rate = self.request.query_params.get("stars", None)

            if not game_title:
                raise ValidationError({"message": "Titolo del gioco mancante !"})

            result = Review.objects.filter(game__title=game_title).select_related(
                "user"
            )
            if star_rate:
                result = result.filter(stars=star_rate)
            return result

        return Review.objects.filter(user=self.request.user).order_by("-date")

    def list(self, request, *args, **kwargs):
        try:
            list_result = super().list(request, *args, **kwargs)
            queryset = self.get_queryset()
            total_reviews = queryset.count()
            
            if total_reviews > 0:
                counts = queryset.values("stars").annotate(total=Count("stars"))
                stats = {i: 0 for i in range(1, 6)}
                for star_rate in counts:
                    percentage = star_rate["total"] / total_reviews *100
                    stats[star_rate["stars"]] = round(percentage, 2)
                list_result.data["stats"] = stats

            return list_result

        except APIException as exc:
            return Response(
                {
                    "errors": exc.detail,
                },
                status=exc.status_code,
            )

    
    def my_reviews(self, request):
        reviews = self.get_queryset()
        paginator = ReviewPaginator()

        try:
            page = paginator.paginate_queryset(reviews, request=request)
            serializer = self.get_serializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        except NotFound:
            return Response(
                {"count": 0, "next": None, "previous": None, "results": []},
                status=status.HTTP_404_NOT_FOUND,
            )
