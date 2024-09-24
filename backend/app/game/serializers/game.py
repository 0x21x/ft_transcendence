from rest_framework import serializers
from ..models import Game
from users.serializers import UserSerializer
from ..serializers.score import ScoreSerializer


class GameSerializer(serializers.ModelSerializer):
    winner = serializers.ReadOnlyField(source='winner.username')
    players = UserSerializer(many=True)
    scores = ScoreSerializer(many=True)

    class Meta:
        model = Game
        fields = ['name', 'created_at', 'status', 'scores', 'winner', 'players']