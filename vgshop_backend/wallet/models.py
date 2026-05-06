from django.db import models
from django.utils.translation import gettext_lazy as _
from account.models import User
from django.core.validators import RegexValidator
from django.db.models import UniqueConstraint
from encrypted_fields.fields import EncryptedCharField
import hashlib


class Wallet(models.Model):
    """
    Modello che implementa il wallet, con il valore di deposito e lo user ad esso collegato.
    """

    user = models.OneToOneField(
        User,
        verbose_name=_("user"),
        on_delete=models.CASCADE,
        related_name="wallet",
        null=False,
        blank=False,
    )
    credit = models.DecimalField(
        _("credit"),
        max_digits=10,
        decimal_places=2,
        null=False,
        blank=False,
        default=0.0,
    )

    class Meta:
        verbose_name = _("Wallet")
        verbose_name_plural = _("Wallets")


class Transaction(models.Model):
    """
    Modello che implementa le transazioni eseguite solo ed unicamente relative al deposito wallet
    """

    wallet = models.ForeignKey(
        Wallet,
        verbose_name=_("wallet"),
        on_delete=models.CASCADE,
        related_name="transactions",
    )

    movement = models.DecimalField(
        _("movement"),
        max_digits=10,
        decimal_places=2,
        null=False,
        blank=False,
        default=0.0,
    )

    date = models.DateField(
        _("date"), auto_now=False, auto_now_add=True, blank=False, null=False
    )

    class Meta:
        verbose_name = _("Transaction")
        verbose_name_plural = _("Transactions")


class CreditCard(models.Model):
    """
    Modello che implementa la carta di credito con tutti i relativi dati.
    Una volta registrata si collega automaticamente al wallet dell'utente registrato e che ha compiuto la registrazione.
    """

    credit_number_validator = RegexValidator(
        regex=r"^\d{16}$", message="Il numero della carta deve avere 16 cifre"
    )

    number = EncryptedCharField(
        _("number"),
        max_length=16,
        null=False,
        blank=False,
        validators=[credit_number_validator],
    )
    
    name = EncryptedCharField(_("name"), max_length=50, null=False, blank=False)

    # campo che ha il numero della carta cifrato in hash per verificare se esiste già
    number_hash = models.CharField(max_length=64, unique=True, null=True)

    expiration_date = models.DateField(
        _("expiration_date"),
        auto_now=False,
        auto_now_add=False,
        null=False,
        blank=False,
    )

    def save(self, *args, **kwargs):
        if self.number:
            self.number_hash = hashlib.sha256(self.number.encode()).hexdigest()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = _("CreditCard")
        verbose_name_plural = _("CreditCards")


class WalletCard(models.Model):
    """
    Modello intermedio che realizza le associazioni Wallet-Carta di credito salvata
    """

    credit_card = models.ForeignKey(
        CreditCard,
        verbose_name=_("credit_card"),
        on_delete=models.CASCADE,
        related_name="wallets",
        null=False,
        blank=False,
    )

    wallet = models.ForeignKey(
        Wallet,
        verbose_name=_("wallet"),
        on_delete=models.CASCADE,
        related_name="credit_cards",
        blank=False,
        null=False,
    )

    class Meta:
        verbose_name = _("WalletCard")
        verbose_name_plural = _("WalletCards")
        constraints = [
            UniqueConstraint(
                fields=["credit_card", "wallet"], name="unique_card_wallet"
            )
        ]
