from django.db import models
from .score import Score

class Game(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=255)
    scores = models.ManyToManyField(Score, related_name='games')

    def __str__(self: models.Model) -> models.CharField:
        return self.name