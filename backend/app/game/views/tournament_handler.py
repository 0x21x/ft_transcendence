from typing import Optional
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.views.friendships import get_attribute
from ..models import Tournament
from ..serializers import TournamentSerializer

nb_of_players_available = [
    2, 4, 8, 16
]

class TournamentHandlerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self: APIView, request: Optional[str]) -> Response:
        tournaments = Tournament.objects.all()
        if not tournaments:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serialized_tournaments = TournamentSerializer(tournaments, many=True)
        return Response(serialized_tournaments.data, status=status.HTTP_200_OK)

    def post(self: APIView, request: Optional[str]) -> Response:
        nb_of_players = get_attribute(request.data, 'nb_of_players')
        if not nb_of_players or nb_of_players not in nb_of_players_available:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        nb_of_rows = nb_of_players // 2
        tournament = Tournament.objects.create(
            name='Tournament',
            nb_of_players=nb_of_players,
            nb_of_rows=nb_of_rows
        )

        return Response(TournamentSerializer(tournament).data, status=status.HTTP_200_OK)
