import uuid
from typing import Any
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Game, Score
from .consumers import ROOM_NAME


class GamesHandlerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self: APIView, request: Any) -> Response:  # noqa: ANN401
        raise NotImplementedError

    def post(self: APIView, request: Any) -> Response:  # noqa: ANN401
        room_name = str(uuid.uuid4())
        ROOM_NAME.append(room_name)
        return Response({"room_name": room_name}, status=status.HTTP_201_CREATED)


class GamesHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self: APIView, request: Any) -> Response:  # noqa: ANN401
        games = Game.objects.all().order_by('-created_at')
        games_history = []
        for i, game in enumerate(games, start=0):
            if i == 15:
                break
            scores = Score.objects.filter(games=game)
            game_json = {}
            for j, score in enumerate(scores, start=1):
                game_json[f'player{j}'] = score.player.username
                game_json[f'score{j}'] = score.score
            games_history.append(game_json)
        return Response(games_history, status=status.HTTP_200_OK)

class GamesHistoryForUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self: APIView, request: Any, username: str) -> Response: # noqa: ANN401
        games = Game.objects.all().order_by('-created_at')
        games_history = []
        i = 0
        for game in games:
            if i == 5:
                break
            if not game.scores.filter(player__username=username).exists():
                continue
            scores = Score.objects.filter(games=game)
            game_json = {}
            for j, score in enumerate(scores, start=1):
                game_json[f'player{j}'] = score.player.username
                game_json[f'score{j}'] = score.score
            i += 1
            games_history.append(game_json)
        return Response(games_history, status=status.HTTP_200_OK)
