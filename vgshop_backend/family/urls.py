from rest_framework import routers
from django.urls import path, include
from family.views import FamilyModelViewSet, FamilyMemberModelViewSet

router = routers.SimpleRouter()
router.register("dashboard", FamilyModelViewSet, basename="family")
router.register("members", FamilyMemberModelViewSet, basename="family-members")

urlpatterns = [
    path("family/", include(router.urls)),
]