from django.db import models
from account.models import User
from django.utils.translation import gettext_lazy as _


class Cart(models.Model):
    user = models.ForeignKey(
        User, verbose_name=_("user"), on_delete=models.CASCADE, related_name="cart"
    )
    date = models.DateField(
        verbose_name=_("creation_date"), auto_now=False, auto_now_add=False
    )

    class Meta:
        verbose_name = _("Cart")
        verbose_name_plural = _("Carts")

    def __str__(self):
        return self.name
