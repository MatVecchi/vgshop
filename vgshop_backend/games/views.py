from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import GameRegisterSerializer, GameSerializer, TagSerializer
from .models import Game, Tag
from account.permissions import IsInPublisherGroup
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.parsers import MultiPartParser, FormParser


class GameModelViewSet(viewsets.ModelViewSet):
    """
    Classe che definisce tutti i metodi GET, POST, PUT, DELETE del modello Game
    """

    # Definisce il comportamento base delle get dirette
    queryset = Game.objects.all()
    # permission_classes = [IsAuthenticated, IsInPublisherGroup]

    def get_permissions(self):
        if self.action in ["list", "retrieve", "tag_list"]:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated, IsInPublisherGroup]
        return [permission() for permission in permission_classes]

    # filtri utili per le get specifiche, tra cui filtro esatto, di ordinamento
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = {
        "publisher": ["exact"],
        "price": ["gte", "lte"],
        "tag_list": ["exact"],
    }

    search_fields = ["title"]
    ordering_fields = ["price", "release_date", "title"]
    ordering = ["-release_date"]

    parser_classes = (MultiPartParser, FormParser)


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
