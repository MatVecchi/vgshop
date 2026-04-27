from rest_framework import routers
from django.urls import path, include
from .views import FriendsModelViewSet

router = routers.SimpleRouter()
router.register("friends", FriendsModelViewSet)

urlpatterns = [
    path("", include(router.urls)),
]