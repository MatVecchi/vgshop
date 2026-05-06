from django.db import models
from account.models import User

class Family(models.Model):
    code = models.CharField(max_length=10, unique=True)
    manager = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="family_manager",
    )

    class Meta:
        verbose_name_plural = "Families"