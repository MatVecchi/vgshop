from rest_framework import routers
from .views import GameModelViewSet, PublisherDashboard
from django.urls import path, include


router = routers.SimpleRouter()
router.register("catalogue", GameModelViewSet, basename="catalogue")
router.register(
    "publisher_dashboard", PublisherDashboard, basename="publisher-dashboard"
)

urlpatterns = [
    path("", include(router.urls)),
]
