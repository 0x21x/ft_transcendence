from typing import Any
from django.db import models
from users.models import Users

class Score(models.Model):
    score = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    player = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='scores')

    def __str__(self: Any) -> models.CharField:
        return self.score

class Game(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=255)
    scores = models.ManyToManyField(Score, related_name='games')

    def __str__(self: Any) -> models.CharField:
        return self.name