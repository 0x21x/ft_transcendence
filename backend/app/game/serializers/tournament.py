from rest_framework import serializers
from ..models import Tournament, TournamentRow
from .game import GameSerializer
from users.serializers import GetUserInfoSerializer

class TournamentRowSerializer(serializers.ModelSerializer):
    players = GetUserInfoSerializer(many=True)
    games = GameSerializer(many=True)

    class Meta:
        model = TournamentRow
        fields = ['level', 'status', 'players', 'nb_players', 'games']

class TournamentSerializer(serializers.ModelSerializer):
    rows = TournamentRowSerializer(many=True)

    class Meta:
        model = Tournament
        fields = ['tournament_name', 'name', 'status', 'nb_of_players', 'nb_of_rows', 'rows']
