from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(blank=True, null=True)
    display_name = models.CharField(max_length=100, unique=True)

    REQUIRED_FIELDS = []

    def __str__(self):
        return self.display_name or self.username