from rest_framework import routers
from .views import OrderModelViewSet, CartModelViewSet, LibraryModelViewSet
from django.urls import path, include


router = routers.SimpleRouter()
router.register("library", LibraryModelViewSet, basename="library")
router.register("payments", OrderModelViewSet, basename="payments")
router.register("shopping_cart", CartModelViewSet, basename="shopping_cart")

urlpatterns = [
    path("", include(router.urls)),
    path("library/<str:game_title>/", LibraryModelViewSet.as_view({'get':'retrieve'}), name="library-detail"),
]
