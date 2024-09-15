from django.db import models
from users.models.users import Users

class Score(models.Model):
    score = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    player = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='scores')

    def __str__(self: models.Model) -> models.CharField:
        return self.score