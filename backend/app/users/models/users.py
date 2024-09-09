from typing import Any
from django.db import models
from django.core.files import File
from django.contrib.auth.models import AbstractBaseUser
from users.managers import UserManager

class Users(AbstractBaseUser):
    username = models.CharField(max_length=16, unique=True)
    is_active = models.BooleanField(default=True)
    is_online = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to='avatars', default=File(open('media/default_avatar.jpg', 'rb'), name='default_avatar.jpg'))
    otp_enabled = models.BooleanField(default=False)
    otp_secret = models.CharField(null=True, blank=True)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["password"]

    objects = UserManager()

    def __str__(self: Any) -> str:
        return str(self.username)
