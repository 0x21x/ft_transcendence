import uuid
from typing import Any
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ..serializers import GameSerializer
from ..consumers.game import GameConsumer
from ..models import Game


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
