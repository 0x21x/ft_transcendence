from rest_framework import serializers
from ..models import Tournament


class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['name', 'status', 'nb_of_players', 'nb_of_rows']