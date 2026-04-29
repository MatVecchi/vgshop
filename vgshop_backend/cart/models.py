from django.db import models
from account.models import User
from games.models import Game
from django.utils.translation import gettext_lazy as _
from django.db.models import UniqueConstraint


class CartItem(models.Model):
    """
    Singola riga del carrello.
    Quando completata diventa un OrderItems
    """

    user = models.ForeignKey(
        User,
        verbose_name=_("User"),
        on_delete=models.CASCADE,
        related_name="cart_items",
        null=False,
        blank=False,
    )

    game = models.ForeignKey(
        Game,
        verbose_name=_("Game"),
        on_delete=models.CASCADE,
        related_name="in_carts",
        null=False,
        blank=False,
    )

    class Meta:
        verbose_name = _("CartItem")
        verbose_name_plural = _("CartItems")
        constraints = [
            UniqueConstraint(fields=["user", "game"], name="unique_user_game")
        ]


class Order(models.Model):
    """
    Modello di un ordine completato.
    Un utente può fare più ordini, che corrispondono a carrelli a seguito dell'acquisto e sono
    salvati come storico
    """

    class PaymentMethods(models.TextChoices):
        CARD = "C"
        WALLET = "W"

    user = models.ForeignKey(
        User,
        verbose_name=_("user"),
        on_delete=models.CASCADE,
        null=False,
        blank=False,
        related_name="orders",
    )

    date = models.DateField(
        verbose_name=_("order_date"),
        auto_now=False,
        auto_now_add=True,
        null=False,
        blank=False,
    )

    payment_method = models.CharField(
        verbose_name=_("Payment Method"),
        null=False,
        blank=False,
        default=PaymentMethods.CARD,
        choices=PaymentMethods,
    )

    class Meta:
        verbose_name = _("Order")
        verbose_name_plural = _("Orders")


class OrderItem(models.Model):
    """
    Singola riga di un ordine storico.
    Attiva la presenza di un gioco nella Library dell'utente customer
    """

    order = models.ForeignKey(
        Order,
        verbose_name=_("order"),
        on_delete=models.CASCADE,
        related_name="order_items",
        null=False,
        blank=False,
    )

    game = models.ForeignKey(
        Game,
        verbose_name=_("game"),
        on_delete=models.CASCADE,
        null=False,
        blank=False,
        related_name="in_orders",
    )

    class Meta:
        verbose_name = _("OrderItem")
        verbose_name_plural = _("OrderItems")
        constraints = [
            UniqueConstraint(fields=["order", "game"], name="unique_order_game")
        ]


class Library(models.Model):
    """
    Libreria di un utente customer, che definisce tutti i giochi che ha comprato.
    E' aggiornata tramite l'acquisto di un carrello (e seguente trasformazione in un ordine).
    Nonostante la ridondanza, è stata creata per velocizzare le query di ricerca tra utente customer e gioco da lui
    in possesso.
    """

    user = models.ForeignKey(
        User,
        verbose_name=_("user"),
        on_delete=models.CASCADE,
        related_name="library",
        null=False,
        blank=False,
    )

    game = models.ForeignKey(
        Game,
        verbose_name=_("game"),
        on_delete=models.CASCADE,
        related_name="in_library",
        null=False,
        blank=False,
    )

    class Meta:
        verbose_name = _("Library")
        verbose_name_plural = _("Librarys")
        constraints = [
            UniqueConstraint(fields=["user", "game"], name="unique_in_library_game")
        ]
