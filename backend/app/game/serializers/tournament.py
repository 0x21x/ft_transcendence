from rest_framework import serializers
from ..models import Tournament, TournamentRow


class TournamentRowSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentRow
        fields = ['name', 'status', 'level']

class TournamentSerializer(serializers.ModelSerializer):
    # players = serializers.ListField()
    # rows = serializers.ListField()

    class Meta:
        model = Tournament
        fields = ['name', 'status', 'nb_of_players', 'nb_of_rows']