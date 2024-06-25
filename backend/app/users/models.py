from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from .managers import UserManager

class Users(AbstractBaseUser):
    username = models.CharField(max_length=16, unique=True)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["password"]

    objects = UserManager()

    def __str__(self) -> str:   # noqa: ANN101
        return str(self.username)