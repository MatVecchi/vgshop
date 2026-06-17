from rest_framework import routers
from .views import OrderModelViewSet, CartModelViewSet, LibraryModelViewSet
from django.urls import path, include


router = routers.SimpleRouter()
router.register("library", LibraryModelViewSet, basename="library")
router.register("payments", OrderModelViewSet, basename="payments")
router.register("shopping_cart", CartModelViewSet, basename="shopping_cart")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "library/<str:game_title>/",
        LibraryModelViewSet.as_view({"get": "retrieve", "patch": "partial_update"}),
        name="library-detail",
    ),
    path(
        "friend/<int:friend_id>/list_titles",
        LibraryModelViewSet.as_view({"get": "list_friend_titles"}),
        name="library-friend-titles",
    ),
    path(
        "friend/<int:friend_id>/<str:game_title>/",
        LibraryModelViewSet.as_view({"get": "get_friend_library"}),
        name="library-friend-game-detail",
    ),
    path(
        "friend/<int:friend_id>/",
        LibraryModelViewSet.as_view({"get": "get_friend_library"}),
        name="library-friend-base",
    ),
]
