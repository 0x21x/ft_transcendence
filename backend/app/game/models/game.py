from django.db import models
from .score import Score
from users.models.users import Users

class Game(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=255)
    players = models.ManyToManyField(Users, related_name='games', blank=True)
    scores = models.ManyToManyField(Score, related_name='games')
    in_tournament = models.BooleanField(default=False)

    def __str__(self: models.Model) -> models.CharField:
        return self.name