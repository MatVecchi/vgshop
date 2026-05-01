from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    profile_image = models.ImageField(
        verbose_name=_("Immagine Profilo"), upload_to="profiles/", null=True, blank=True
    )

    # Publisher only

    piva_validator = RegexValidator(
        regex=r"^\d{11}$", message="La partita iva deve avere 11 cifre"
    )

    piva = models.CharField(
        verbose_name=_("Partita Iva"),
        validators=[piva_validator],
        max_length=11,
        unique=True,
        blank=True,
        null=True,
        help_text="Codice di 11 cifre numeriche identificativo dell'azienda o della persona",
    )

    website = models.URLField(
        verbose_name=_("website"), max_length=200, blank=True, null=True
    )

    class Meta:
        verbose_name_plural = _("Users")
