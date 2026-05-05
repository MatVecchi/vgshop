from django.db.models import constraints
from random import choices
from email.policy import default
from django.db import models
from account.models import User


class Friend(models.Model):
    class Status(models.TextChoices):
        PENDING = ("P",)
        ACCEPTED = ("A",)
        DECLINED = "D"

    first_friend = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="friends_sent"
    )
    second_friend = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="friends_received"
    )
    date = models.DateField(auto_now_add=True)
    status = models.CharField(default=Status.PENDING, choices=Status)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["first_friend", "second_friend", "date"],
                name="unique_friendship",
            )
        ]
        verbose_name_plural = "Friends"

class Message(models.Model):
    class Status(models.TextChoices):
        SENT = "S"
        READ = "R"

    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sender")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="receiver")
    message = models.TextField(
        verbose_name="description",
        null=False,
        blank=False,
    )
    date = models.DateTimeField(auto_now_add=True, null=False,blank=False)
    status = models.CharField(default=Status.SENT, choices=Status, null=False, blank=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["sender", "receiver", "date"], 
                name="unique_message"
            )
        ]
        verbose_name_plural = "Messages"