from rest_framework import routers
from .views import GameModelViewSet
from django.urls import path, include


router = routers.SimpleRouter()
router.register("catalogue", GameModelViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
