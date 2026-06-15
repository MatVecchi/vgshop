from rest_framework import routers
from .views import GameModelViewSet, PublisherDashboard
from django.urls import path, include
from recomendation_system.service import get_recomendation_service


router = routers.SimpleRouter()
router.register("catalogue", GameModelViewSet, basename="catalogue")
router.register(
    "publisher_dashboard", PublisherDashboard, basename="publisher-dashboard"
)

urlpatterns = [
    path("", include(router.urls)),
]

get_recomendation_service()
