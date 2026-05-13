from rest_framework import routers
from wallet.views import WalletModelViewset, CreditCardModelViewSet, DepositView
from django.urls import path, include


router = routers.SimpleRouter()
router.register("credit_cards", CreditCardModelViewSet, basename="credit_cards")
router.register("transactions", WalletModelViewset, basename="wallet")

urlpatterns = [
    path("", include(router.urls)),
    path("transactions/deposit", DepositView.as_view(), name="deposit"),
]
