from rest_framework import routers
from django.urls import path, include
from .views import FamilyModelViewSet

router = routers.SimpleRouter()
router.register("family", FamilyModelViewSet)

urlpatterns = [
    path("", include(router.urls)),
]