from math import pow
from uuid import uuid4
from random import sample
from typing import Optional
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.views.friendships import get_attribute
from users.models.users import Users
from ..models import Tournament, TournamentRow
from ..serializers import TournamentSerializer

nb_of_players_available = [
    2, 4, 8, 16
]

class NoUserToLeaveException(Exception):
    pass

class AlreadyFullException(Exception):
    pass

class TournamentHasBeenDeletedException(Exception):
    pass

def join_or_leave_row(tournament: Tournament, row: TournamentRow, action: str, user: Users) -> None:
    if action == 'join' and (row.players.count() >= row.nb_players or user in row.players.all()):
        raise AlreadyFullException
    if action == 'leave' and user not in row.players.all():
        raise NoUserToLeaveException
    if action == 'join':
        row.players.add(user)
        if row.players.count() == row.nb_players:
            row.status = 'in_progress'
            tournament.status = 'in_progress'
            create_row_games(row)
            tournament.save()
    elif action == 'leave':
        row.players.remove(user)
        if row.players.count() == 0:
            row.delete()
            if not tournament.rows.count():
                tournament.delete()
                raise TournamentHasBeenDeletedException

def create_row_games(row: TournamentRow) -> None:
    if row.players.count() != row.nb_players:
        return
    players = list(row.players.all())
    for _ in range(row.nb_players // 2):
        game = row.games.create(name=str(uuid4()), status='waiting', in_tournament=True)
        players_to_add = sample(players, 2)
        game.players.set(players_to_add)
        game.save()
        players.remove(players_to_add[0])
        players.remove(players_to_add[1])

def create_row(tournament: Tournament, level: int, initial_nb_players: int) -> None:
    if tournament.rows.all().filter(level=level).exists():
        return
    row_nb_players = initial_nb_players // pow(2, level - 1) if level > 1 else initial_nb_players
    row = TournamentRow.objects.create(level=level, nb_players=row_nb_players, status='waiting')
    tournament.rows.add(row)

class TournamentHandlerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self: APIView, request: Optional[str]) -> Response:
        """
        Returns all active tournaments.

        Returns:
            Response: A list of all tournaments.
        """
        tournaments = Tournament.objects.all()
        if not tournaments:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serialized_tournaments = TournamentSerializer(tournaments, many=True)
        return Response(serialized_tournaments.data, status=status.HTTP_200_OK)

    def post(self: APIView, request: Optional[str]) -> Response:
        """
        Create a new tournament.

        Returns:
            Response: Created tournament.
        """
        nb_of_players = get_attribute(request.data, 'nb_of_players')
        if not nb_of_players or nb_of_players not in nb_of_players_available:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        nb_of_rows = nb_of_players // 2
        tournament = Tournament.objects.create(
            name=str(uuid4())[:18],
            nb_of_players=nb_of_players,
            nb_of_rows=nb_of_rows
        )
        create_row(tournament, 1, nb_of_players)
        try:
            join_or_leave_row(tournament, tournament.rows.first(), 'join', request.user)
        except AlreadyFullException:
            return Response(status=status.HTTP_409_CONFLICT)
        serialized_tournament = TournamentSerializer(tournament)
        return Response(serialized_tournament.data, status=status.HTTP_200_OK)

    def put(self: APIView, request: Optional[str], tournament_name: Optional[str]) -> Response:
        """
        Join or leave a tournament.

        Returns:
            Response: Edited tournament.
        """
        action = get_attribute(request.data, 'action')
        if not action or action not in ['join', 'leave']:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        tournament = Tournament.objects.filter(name=tournament_name).first()
        if not tournament:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if tournament.status != 'waiting' or not tournament.rows.first():
            return Response(status=status.HTTP_400_BAD_REQUEST)
        row = tournament.rows.first()
        if row.status != 'waiting':
            return Response(status=status.HTTP_400_BAD_REQUEST)
        try:
            join_or_leave_row(tournament, row, action, request.user)
        except AlreadyFullException:
            return Response(status=status.HTTP_409_CONFLICT)
        except NoUserToLeaveException:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except TournamentHasBeenDeletedException:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serialized_tournament = TournamentSerializer(tournament).data
        return Response(serialized_tournament, status=status.HTTP_200_OK)