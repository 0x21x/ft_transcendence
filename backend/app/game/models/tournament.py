from django.db import models
from .game import Game

class TournamentRow(models.Model):
    level = models.IntegerField()
    games = models.ManyToManyField(Game, related_name='tournament_games')
    is_finished = models.BooleanField(default=False)

    def __str__(self: models.Model) -> models.CharField:
        return self.level

class Tournament(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    rows = models.ManyToManyField(TournamentRow, related_name='tournaments', blank=True, default=None)
    status = models.CharField(choices=[('waiting', 'waiting'), ('in_progress', 'in_progress'), ('finished', 'finished')], default='waiting', max_length=255)
    nb_of_players = models.IntegerField(blank=True, null=True)
    nb_of_rows = models.IntegerField(blank=True, null=True)

    def __str__(self: models.Model) -> models.CharField:
        return self.name