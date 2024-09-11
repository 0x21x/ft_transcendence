from django.db import models
from .users import Users

class Sessions(models.Model):
    user = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='sessions')
    token = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'token')