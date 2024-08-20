import uuid
from typing import Any
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import GameSerializer
from .consumers.game import GameConsumer
from .models import Game, Score


class GamesHandlerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self: APIView, request: Any) -> Response:  # noqa: ANN401
        waiting_games = Game.objects.filter(status='waiting')
        json_data = GameSerializer(waiting_games, many=True).data
        return Response({'waiting_games': json_data}, status=status.HTTP_200_OK)

    def post(self: APIView, request: Any) -> Response:  # noqa: ANN401
        name = str(uuid.uuid4())[0:18]
        Game.objects.create(name=name, status='waiting')
        GameConsumer.add_room_to_groups('game_%s' % name)
        return Response({'message': 'Game created.'}, status=status.HTTP_201_CREATED)


class GamesHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self: APIView, request: Any) -> Response:  # noqa: ANN401
        finished_games = Game.objects.filter(status='finished').order_by('-created_at')
        games_history = []
        for i, game in enumerate(finished_games, start=0):
            if i == 15:
                break
            scores = Score.objects.filter(games=game)
            game_json = {}
            for j, score in enumerate(scores, start=1):
                game_json['player%d' % j] = score.player.username
                game_json['score%d' % j] = score.score
            games_history.append(game_json)
        return Response(games_history, status=status.HTTP_200_OK)

class GamesHistoryForUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self: APIView, request: Any, username: str) -> Response: # noqa: ANN401
        finished_games = Game.objects.filter(status='finished').order_by('-created_at')
        games_history = []
        i = 0
        for game in finished_games:
            if i == 5:
                break
            if not game.scores.filter(player__username=username).exists():
                continue
            scores = Score.objects.filter(games=game)
            game_json = {}
            for j, score in enumerate(scores, start=1):
                game_json['player%d' % j] = score.player.username
                game_json['score%d' % j] = score.score
            i += 1
            games_history.append(game_json)
        return Response(games_history, status=status.HTTP_200_OK)
