from django.db import models
from .users import Users

class Friends(models.Model):
    user = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='user')
    friend = models.ForeignKey(Users, on_delete=models.CASCADE, related_name='friend')
    status = models.CharField(max_length=10, choices=[('pending', 'pending', ), ('accepted', 'accepted')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'friend')