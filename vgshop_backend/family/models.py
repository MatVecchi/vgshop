from django.db import models
from django.conf import settings

class Family(models.Model):
    code = models.CharField(max_length=10, unique=True)
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="family_manager",
    )

    class Meta:
        verbose_name_plural = "Families"