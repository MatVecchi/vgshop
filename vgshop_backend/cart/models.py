from django.db import models
from account.models import User
from games.models import Game
from django.utils.translation import gettext_lazy as _
from django.db.models import UniqueConstraint


class Cart(models.Model):
    """
    Modello del carrello. Contiene le singole rige (games) del carrello.
    Una volta completato diventa un Order.
    Un utente può avere solamente un carrello attivo per volta
    """

    user = models.OneToOneField(
        User,
        verbose_name=_("user"),
        on_delete=models.CASCADE,
        related_name="cart",
        null=False,
        blank=False,
    )

    date = models.DateField(
        verbose_name=_("creation_date"),
        auto_now=False,
        auto_now_add=True,
        null=False,
        blank=False,
    )

    class Meta:
        verbose_name = _("Cart")
        verbose_name_plural = _("Carts")


class CartItem(models.Model):
    """
    Singola riga del carrello.
    Quando completata diventa un OrderItems
    """

    cart = models.ForeignKey(
        Cart,
        verbose_name=_("Cart"),
        on_delete=models.CASCADE,
        related_name="items",
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
            UniqueConstraint(fields=["cart", "game"], name="unique_cart_game")
        ]


class Order(models.Model):
    """
    Modello di un ordine completato.
    Un utente può fare più ordini, che corrispondono a carrelli a seguito dell'acquisto e sono
    salvati come storico
    """

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
