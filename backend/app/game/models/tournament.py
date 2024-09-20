from django.db import models
from .game import Game
from users.models.users import Users

class TournamentRow(models.Model):
    level = models.IntegerField()
    players = models.ManyToManyField(Users, related_name='tournament_rows_players')
    nb_players = models.IntegerField()
    games = models.ManyToManyField(Game, related_name='tournament_rows_games')
    status = models.CharField(choices=[('waiting', 'waiting'), ('in_progress', 'in_progress'), ('finished', 'finished')], default='waiting', max_length=255)

    def __str__(self: models.Model) -> models.CharField:
        return self.level

class Tournament(models.Model):
    tournament_name = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    rows = models.ManyToManyField(TournamentRow, related_name='tournament_rows', blank=True, default=None)
    status = models.CharField(choices=[('waiting', 'waiting'), ('in_progress', 'in_progress'), ('finished', 'finished')], default='waiting', max_length=255)
    nb_of_players = models.IntegerField(blank=True, null=True)
    nb_of_rows = models.IntegerField(blank=True, null=True)

    def __str__(self: models.Model) -> models.CharField:
        return self.name