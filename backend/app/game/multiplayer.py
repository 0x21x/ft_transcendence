from typing import Any
from channels.db import database_sync_to_async
from users.models import Users # noqa: F401
from .pong import Pong, GAME_STATES, MAX_PLAYERS
from .models import Game

ROOM_NAME = 'game'

PLAYER1_KEY = {
    'left': 'up',
    'right': 'down'
}

PLAYER2_KEY = {
    'left': 'down',
    'right': 'up'
}

class MultiplayerPong:
    def __init__(self: Any) -> None:
        self.players = {}
        self.pong = None

    def add_player(self: Any, player_name: str) -> None:
        if len(self.players) == MAX_PLAYERS or player_name in self.players:
            return
        self.players[player_name] = f'player{len(self.players) + 1}'

    def move_paddle(self: Any, player_name: str, direction: str) -> None:
        if not player_name in self.players:
            return
        direction = PLAYER1_KEY[direction] if self.players[player_name] == 'player1' else PLAYER2_KEY[direction]
        self.pong.move_paddle(self.players[player_name], direction)

    def remove_player(self: Any, player_name: str) -> None:
        if not player_name in self.players:
            return
        del self.players[player_name]
        for i, player in enumerate(self.players):
            self.players[player] = f'player{i + 1}'

    def init_game(self: Any) -> None:
        self.pong = Pong()

    def start_game(self: Any) -> None:
        if len(self.players) < MAX_PLAYERS:
            return
        if self.pong.game_state == GAME_STATES[2]:
            self.init_game()
        self.pong.game_state = GAME_STATES[1]

    @database_sync_to_async
    def save_scores(self: Any) -> None:
        names = self.get_names()
        game = Game.objects.create()
        for player in names:
            game.scores.create(score=self.pong.__dict__()[self.players[player]]['score'], player=Users.objects.get(username=player))

    def get_names(self: Any) -> list:
        return list(self.players.keys())

    def get_players(self: Any) -> dict:
        return self.players

    def get_game_state(self: Any) -> dict:
        return self.pong.__dict__