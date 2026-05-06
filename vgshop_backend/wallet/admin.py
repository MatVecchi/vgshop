from django.contrib import admin
from .models import Wallet, CreditCard, Transaction, WalletCard

admin.site.register(Wallet)
admin.site.register(CreditCard)
admin.site.register(Transaction)
admin.site.register(WalletCard)

