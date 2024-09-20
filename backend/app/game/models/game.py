from django.db import models
from .score import Score
from users.models.users import Users

class Game(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=255)
    players = models.ManyToManyField(Users, related_name='game_players', blank=True)
    winner = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='wins', blank=True, null=True)
    scores = models.ManyToManyField(Score, related_name='game_scores', blank=True)
    tournament_name = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self: models.Model) -> models.CharField:
        return self.name