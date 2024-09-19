from rest_framework import serializers
from ..models import Game


class GameSerializer(serializers.ModelSerializer):
    winner = serializers.ReadOnlyField(source='winner.username')

    class Meta:
        model = Game
        fields = ['name', 'created_at', 'status', 'scores', 'winner']