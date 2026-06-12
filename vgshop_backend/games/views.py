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
    GameAreaChartSerializer,
    GameUpdateSerializer,
)
from cart.models import Library
from .models import Game, Tag
from account.permissions import IsInPublisherGroup
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.exceptions import ValidationError
from cart.models import OrderItem
from .permissions import IsOwnerPublisher
from django.db.models import Count
from django.db.models.functions import TruncMonth, TruncYear
from recomendation_system.service import get_recomendation_service
from recomendation_system.content_based import content_based_similarity
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
    page_size = 15


class GameModelViewSet(viewsets.ModelViewSet):
    """
    Classe che definisce tutti i metodi GET, POST, PATCH, PUT, DELETE del modello Game
    """

    queryset = Game.objects.distinct()

    # definisce il serializer in base all'utente che accede all'endpoint
    def get_serializer_class(self):
        if self.action in ["create"]:
            return GameRegisterSerializer
        elif self.action in ["partial_update", "update"]:
            return GameUpdateSerializer
        return GameSerializer

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

    # il retrieve non usa la pk, ma usa il titolo (è unique)
    lookup_field = "title"
    lookup_url_kwarg = "title"

    parser_classes = (MultiPartParser, FormParser)
    pagination_class = CataloguePaginator

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        game = self.get_object()

        similar_games = content_based_similarity(game, request.user)
        if similar_games:
            serializer = self.get_serializer(similar_games, many=True)
            response.data["similar_games"] = serializer.data
        else:
            response.data["similar_games"] = []
        return response

    @action(detail=True, methods=["GET"], url_path="publisher_detail")
    def publisher_detail(self, request, title=None):
        game = self.get_object()
        serializer = GameUpdateSerializer(game, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["GET"])
    def recent(self, request):
        tag = request.GET.get("tag_list", None)
        recent = True

        if request.user.is_authenticated:
            user = request.user
            k = 10
            owned = Library.objects.filter(user=user).values_list("game", flat=True)
            not_owned = Game.objects.distinct()
            if tag:
                not_owned = not_owned.filter(tag_list=tag)
            not_owned = not_owned.exclude(id__in=owned)

            scores = [
                (
                    game,
                    get_recomendation_service().predict_score(
                        user=user.pk,
                        game=game.id,
                        game_tags=game.tag_list.values_list("name", flat=True),
                    ),
                )
                for game in not_owned
            ]

            scores = [score for score in scores if score[1] is not None]
            if scores:
                recent = False
                scores.sort(key=lambda x: x[1], reverse=True)
                games = [score[0] for score in scores][:5]

        if recent:
            games = self.get_queryset().order_by("-release_date")
            if tag:
                games = games.filter(tag_list=tag)
            games = games[:5]

        serializer = self.get_serializer(games, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

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
        if self.action in ["game_area_list", "game_area_detail"]:
            return GameAreaChartSerializer
        return GameChartSerializer

    # grafico a linee
    def _game_area_overview(self, request, game_title=None):
        try:
            is_cumulative = bool(self.request.query_params.get("cumulative", False))
        except TypeError:
            is_cumulative = False

        today = datetime.date.today()
        try:
            time_range_in_days = int(self.request.query_params.get("time_range", 30))
            limit = today - datetime.timedelta(time_range_in_days)
        except TypeError:
            limit = today - datetime.timedelta(30)

        stats = self.get_queryset().filter(
            order__date__gte=limit, order__date__lte=today
        )
        if game_title:
            stats = stats.filter(game__title=game_title)

        stats = stats.values("game__title", "order__date", "game__price").annotate(
            count=Count("id")
        )

        game_titles = set(item["game__title"] for item in stats)

        json_stats = {}
        for i in range(time_range_in_days + 1):
            date_key = (limit + datetime.timedelta(days=i)).strftime("%Y-%m-%d")
            json_stats[date_key] = {"date": date_key}

            for title in game_titles:
                json_stats[date_key][title] = 0

        for item in stats:
            key = item["order__date"].strftime("%Y-%m-%d")
            title = item["game__title"]
            json_stats[key][title] = item["count"] * item["game__price"]

        if is_cumulative:
            for i in range(1, time_range_in_days + 1):
                date_key = (limit + datetime.timedelta(days=i)).strftime("%Y-%m-%d")
                previous_date_key = (limit + datetime.timedelta(days=i - 1)).strftime(
                    "%Y-%m-%d"
                )
                for title in game_titles:
                    json_stats[date_key][title] += json_stats[previous_date_key][title]

        json_stats = list(json_stats.values())
        serializer = self.get_serializer(json_stats, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["GET"], url_path="area")
    def game_area_list(self, request):
        return self._game_area_overview(request=request)

    @action(detail=True, methods=["GET"], url_path="detail")
    def game_area_detail(self, request, game_title):
        return self._game_area_overview(request=request, game_title=game_title)

    # grafico a barre
    def _game_bar_overview(self, request, game_title=None):
        year = self.request.query_params.get("year", datetime.datetime.today().year)
        try:
            first_day = datetime.date(int(year), 1, 1)
            last_day = datetime.date(int(year), 12, 31)
        except (TypeError, ValueError):
            first_day = datetime.date(datetime.datetime.today().year, 1, 1)
            last_day = datetime.date(datetime.datetime.today().year, 12, 31)

        stats = self.get_queryset().filter(
            order__date__gte=first_day, order__date__lte=last_day
        )
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

    # grafici a torta
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
