from rest_framework.response import Response
from rest_framework import viewsets, filters, status, mixins
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import (
    GameRegisterSerializer,
    GameSerializer,
    TagSerializer,
    GamePieChartSerializer,
    GameChartSerializer,
)
from .models import Game, Tag
from account.permissions import IsInPublisherGroup
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.exceptions import ValidationError
from cart.models import OrderItem
from .permissions import IsOwnerPublisher
from django.db.models import Count
from django.db.models.functions import TruncMonth, TruncYear
import django_filters
import datetime


class GameFilters(django_filters.FilterSet):
    publisher_name = django_filters.CharFilter(
        field_name="publisher__username", lookup_expr="icontains"
    )

    tag_list = django_filters.BaseInFilter(field_name="tag_list", lookup_expr="in")

    class Meta:
        model = Game
        fields = {
            "price": ["gte", "lte"],
            "release_date": ["exact", "gte", "lte"],
        }


class CataloguePaginator(PageNumberPagination):
    page_size = 12


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


class PublisherDashboard(viewsets.GenericViewSet, mixins.ListModelMixin):
    permission_classes = [IsAuthenticated, IsInPublisherGroup]

    lookup_field = "game__title"
    lookup_url_kwarg = "game_title"

    def list(self, request, *args, **kwargs):
        games = Game.objects.filter(publisher=self.request.user) 
        return Response([game.title for game in games], status=status.HTTP_200_OK)

    def get_queryset(self):
        publisher_games = Game.objects.filter(publisher=self.request.user)
        return OrderItem.objects.filter(game__in=publisher_games).select_related("game")

    def get_serializer_class(self):
        if self.action in ["game_cake_overview"]:
            return GamePieChartSerializer
        return GameChartSerializer

    def _game_bar_overview(self, request, game_title=None):
        year = self.request.query_params.get("year", datetime.datetime.today().year)
        try:
            first_day = datetime.date(int(year), 1, 1)
            last_day = datetime.date(int(year), 12, 31)
        except (TypeError, ValueError):
            first_day = datetime.date(datetime.datetime.today().year, 1, 1)
            last_day = datetime.date(datetime.datetime.today().year, 12, 31)

        

        stats = self.get_queryset().filter(order__date__gte=first_day, order__date__lte=last_day)
        if game_title:
            stats = stats.filter(game__title=game_title)

        stats = stats.values("game__title", month=TruncMonth("order__date")).annotate(
            count=Count("id")
        )

        month_names = [
            "Gennaio",
            "Febbraio",
            "Marzo",
            "Aprile",
            "Maggio",
            "Giugno",
            "Luglio",
            "Agosto",
            "Settembre",
            "Ottobre",
            "Novembre",
            "Dicembre",
        ]

        json_stats = {month: {"month": month} for month in month_names}
        for item in stats:
            month = item["month"].month
            key = month_names[month - 1]
            json_stats[key][item["game__title"]] = item["count"]

        json_stats = list(json_stats.values())
        serializer = self.get_serializer(json_stats, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["GET"], url_path="bar")
    def game_bar_list(self, request):
        return self._game_bar_overview(request=request)

    @action(detail=True, methods=["GET"], url_name="detail")
    def game_bar_detail(self, request, game_title):
        return self._game_bar_overview(request=request, game_title=game_title)

    @action(detail=False, methods=["GET"], url_path="cake")
    def game_cake_overview(self, request):
        num_filter = self.request.query_params.get("num", None)
        orders = self.get_queryset()

        try:
            order_groups = (
                orders.values("game__title", "game__price")
                .annotate(count=Count("id"))
                .order_by("-count")
            )

            if num_filter:
                order_groups = order_groups[: int(num_filter)]

            serializer = self.get_serializer(order_groups, many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)

        except TypeError:
            return Response(
                {"message": "Filtro non valido"}, status=status.HTTP_400_BAD_REQUEST
            )

        except Exception:
            return Response(
                {"message": "Errore nel caricamento dei dati"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
