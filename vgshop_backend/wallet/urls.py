from rest_framework import routers
from .views import WalletModelViewset, CreditCardModelViewSet
from django.urls import path, include


router = routers.SimpleRouter()
router.register("credit_cards", CreditCardModelViewSet, basename="credit_cards")
router.register("transactions", WalletModelViewset, basename="wallet")


urlpatterns = [
    path("", include(router.urls)),
]
