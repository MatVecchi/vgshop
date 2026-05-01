from rest_framework.response import Response
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import GameRegisterSerializer, GameSerializer, TagSerializer
from .models import Game, Tag
from account.permissions import IsInPublisherGroup
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.exceptions import ValidationError
from .permissions import IsOwnerPublisher
import django_filters
import datetime


class GameFilters(django_filters.FilterSet):
    publisher_name = django_filters.CharFilter(
        field_name="publisher__name", lookup_expr="icontains"
    )

    tag_list = django_filters.BaseInFilter(field_name="tag_list", method="intersect")

    def intersect(self, queryset, name, value):
        if not value:
            raise ValidationError("Must be given a list of tags")

        for tag in value:
            queryset = queryset.filter(tag_list=tag)
        return queryset

    class Meta:
        model = Game
        fields = {
            "price": ["gte", "lte"],
            "release_date": ["exact", "gte", "lte"],
        }


class CataloguePaginator(PageNumberPagination):
    page_size = 9


class GameModelViewSet(viewsets.ModelViewSet):
    """
    Classe che definisce tutti i metodi GET, POST, PATHC, PUT, DELETE del modello Game
    """

    queryset = Game.objects.all()

    def get_permissions(self):
        if self.action in ["list", "retrieve", "tag_list", "recent"]:
            permission_classes = [AllowAny]
        elif self.action == "create":
            permission_classes = [IsAuthenticated, IsInPublisherGroup]
        else:
            permission_classes = [IsAuthenticated, IsInPublisherGroup, IsOwnerPublisher]

        return [permission() for permission in permission_classes]

    # filtri utili per le get specifiche, tra cui filtro esatto, di ordinamento
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_class = GameFilters

    search_fields = ["title"]
    ordering_fields = ["price", "release_date", "title"]
    ordering = ["-release_date"]

    # il retireve non usa la pk, ma usa il titolo (è unique)
    lookup_field = "title"
    lookup_url_kwarg = "title"

    parser_classes = (MultiPartParser, FormParser)
    pagination_class = CataloguePaginator

    @action(detail=False, methods=["GET"])
    def recent(self, request):
        tag = request.GET.get("tag_list", None)
        end = datetime.date.today()
        start = end - datetime.timedelta(30)

        if tag:
            games = self.get_queryset().filter(
                tag_list=tag, release_date__gte=start, release_date__lte=end
            )[:12]
        else:
            games = self.get_queryset().filter(
                release_date__gte=start, release_date__lte=end
            )[:12]

        serializer = self.get_serializer(games, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    # definisce il serializer in base all'utente che accede all'endpoint
    def get_serializer_class(self):
        if self.action in ["create", "partial_update", "update"]:
            return GameRegisterSerializer
        return GameSerializer

    @action(detail=False, methods=["GET"])
    def tag_list(self, request):
        tags = Tag.objects.all()
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
