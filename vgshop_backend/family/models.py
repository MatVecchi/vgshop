from enum import unique
from django.db.models import constraints
from django.db import models
from account.models import User
from django.utils.crypto import get_random_string

def generate_family_code():
    while True:
        code = get_random_string(length=8).upper()
        if not Family.objects.filter(code=code).exists():
            return code

class Family(models.Model):
    code = models.CharField(max_length=8, unique=True, default=generate_family_code)
    manager = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="family_manager",
    )

    class Meta:
        verbose_name_plural = "Families"