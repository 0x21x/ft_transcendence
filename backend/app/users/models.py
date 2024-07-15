from django.db import models
from django.core.files import File
from django.contrib.auth.models import AbstractBaseUser
from .managers import UserManager

class Users(AbstractBaseUser):
    username = models.CharField(max_length=16, unique=True)
    is_active = models.BooleanField(default=True)
    avatar = models.ImageField(upload_to='avatars', default=File(open('media/default_avatar.jpg', 'rb'), name='default_avatar.jpg'))

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["password"]

    objects = UserManager()

    def __str__(self) -> str:   # noqa: ANN101
        return str(self.username)