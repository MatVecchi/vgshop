from rest_framework import routers
from wallet.views import WalletModelViewset, CreditCardModelViewSet
from django.urls import path, include


router = routers.SimpleRouter()
router.register("credit_cards", CreditCardModelViewSet, basename="credit_cards")


urlpatterns = [
    path("", include(router.urls)),
    path(
        "transactions/deposit/", 
        WalletModelViewset.as_view({"post": "create"}), 
        name="wallet-deposit"
    ),
    path(
        "transactions/",
        WalletModelViewset.as_view({"get": "list"}),
        name="wallet-list",
    ),
    path(
        "transactions/wallet/credit/",
        WalletModelViewset.as_view({"get": "get_credit"}),
        name="wallet-credit",
    ),
    path(
        "transactions/wallet/cash_back/",
        WalletModelViewset.as_view({"get": "get_cash_back"}),
        name="wallet-cash_back",
    ),
]
