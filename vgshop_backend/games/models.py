from django.db import models
from embed_video.fields import EmbedVideoField
from account.models import User
from django.utils.translation import gettext_lazy as _


class Tag(models.Model):
    name = models.CharField(
        verbose_name=_("tag_name"),
        primary_key=True,
        null=False,
        blank=False,
        max_length=50,
    )

    class Meta:
        verbose_name_plural = _("Tags")


class GameImage(models.Model):
    image = models.ImageField(
        verbose_name=_("game_image"),
        upload_to="game_images/content",
        null=False,
        blank=False,
    )

    game = models.ForeignKey(
        "Game",
        verbose_name=_("game"),
        on_delete=models.CASCADE,
        null=False,
        blank=False,
        related_name="images",
    )

    class Meta:
        verbose_name_plural = _("GameImages")


class Game(models.Model):
    title = models.CharField(
        verbose_name=_("title"), max_length=50, null=False, blank=False, unique=True
    )
    release_date = models.DateField(
        verbose_name=_("release_date"),
        auto_now=False,
        auto_now_add=False,
        null=False,
        blank=False,
    )

    description = models.TextField(
        verbose_name=_("description"),
        null=False,
        blank=False,
    )

    video = EmbedVideoField(verbose_name=_("video"), null=False, blank=False)

    cover = models.ImageField(
        verbose_name=_("cover"),
        upload_to="game_images/covers",
        null=False,
        blank=False,
        default="game_images/covers/default.png",
    )

    price = models.FloatField(verbose_name=_("price"), null=False, blank=False)

    tag_list = models.ManyToManyField(Tag)

    publisher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="publisher",
        blank=False,
        null=False,
    )

    class Meta:
        verbose_name_plural = _("Games")
