from django.db import models
from account.models import User
from games.models import Game
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import UniqueConstraint


class Review(models.Model):
    user = models.ForeignKey(
        User,
        verbose_name=_("user"),
        on_delete=models.CASCADE,
        related_name="reviews",
        null=False,
        blank=False,
    )

    game = models.ForeignKey(
        Game,
        verbose_name=_("game"),
        on_delete=models.CASCADE,
        related_name="reviews",
        null=False,
        blank=False,
    )

    date = models.DateTimeField(_("date"), auto_now=True, null=False, blank=False)

    stars = models.PositiveIntegerField(
        _("stars"),
        null=False,
        blank=False,
        validators=[
            MinValueValidator(1, "La minima valutazione è 1 stella"),
            MaxValueValidator(5, "La massima valutazione è 5 stelle"),
        ],
    )

    comment = models.TextField(_("comment"), max_length=500, null=False, blank=False)

    class Meta:
        verbose_name = _("Review")
        verbose_name_plural = _("Reviews")
        constraints = [
            UniqueConstraint(
                fields=["user", "game", "date"], name="unique_instant_comment"
            )
        ]

    def __str__(self):
        return (
            self.user.username + " - " + self.game.title + " - " + self.date.__str__()
        )
