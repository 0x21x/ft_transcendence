from rest_framework import serializers
from ..models import Score

class ScoreSerializer(serializers.ModelSerializer):
    player = serializers.ReadOnlyField(source='player.username')

    class Meta:
        model = Score
        fields = ['score', 'created_at', 'updated_at', 'player']