from django.db import models
from account.models import User


class Friend(models.Model):
    first_friend = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="friends_sent"
    )
    second_friend = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="friends_received"
    )
    date = models.DateField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["first_friend", "second_friend"], name="unique_friendship"
            )
        ]
        verbose_name_plural = "Friends"
