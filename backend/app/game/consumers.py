import asyncio

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from typing import Any
from random import choice

GAME_STATES = ['waiting', 'in_progress', 'finished']
GAME_SIZE = [400, 250]
PADDLE_SIZE = [10, 50]
BALL_SIZE = 10
MAX_SCORE = 3
MAX_PLAYERS = 2
FPS_SERVER = 160
FPS_SERVER = (1000 / FPS_SERVER / 1000) if FPS_SERVER > 0 else 0.1
ROOM_NAME = 'game'

PLAYER1_KEY = {
    'left': 'up',
    'right': 'down'
}

PLAYER2_KEY = {
    'left': 'down',
    'right': 'up'
}

class Pong:
    def __init__(self: Any) -> None:
        self.ball = {
            'x': GAME_SIZE[0] / 2,
            'y': GAME_SIZE[1] / 2,
            'dx': choice([-1, 1]),
            'dy': choice([-1, 1])
        }
        self.player1 = {
            'x': 0,
            'y': GAME_SIZE[1] / 2,
            'score': 0
        }
        self.player2 = {
            'x': GAME_SIZE[0] - PADDLE_SIZE[0],
            'y': GAME_SIZE[1] / 2,
            'score': 0
        }
        self.game_state = GAME_STATES[0]

    def reset_game(self: Any, done: bool = False) -> None:
        if self.player1['score'] == MAX_SCORE or self.player2['score'] == MAX_SCORE:
            done = True
        self.ball = {
            'x': GAME_SIZE[0] / 2,
            'y': GAME_SIZE[1] / 2,
            'dx': choice([-1, 1]),
            'dy': choice([-1, 1])
        }
        self.player1 = {
            'x': 0,
            'y': GAME_SIZE[1] / 2,
            'score': 0 if done else self.player1['score']
        }
        self.player2 = {
            'x': GAME_SIZE[0] - PADDLE_SIZE[0],
            'y': GAME_SIZE[1] / 2,
            'score': 0 if done else self.player2['score']
        }
        if done:
            self.game_state = GAME_STATES[2]

    def move_paddle(self: Any, player: str, direction: str) -> None:
        if direction == 'up':
            if self[player]['y'] > 0:
                self[player]['y'] -= 10
        elif direction == 'down':
            if self[player]['y'] < GAME_SIZE[1] - PADDLE_SIZE[1]:
                self[player]['y'] += 10

    def move_ball(self: Any) -> None:
        self.ball['x'] += self.ball['dx']
        self.ball['y'] += self.ball['dy']
        if self.ball['y'] <= 0 or self.ball['y'] >= GAME_SIZE[1] - BALL_SIZE:
            self.ball['dy'] *= -1
        if self.ball['x'] <= 0:
            self.player2['score'] += 1
            self.reset_game()
        if self.ball['x'] >= GAME_SIZE[0] - BALL_SIZE:
            self.player1['score'] += 1
            self.reset_game()
        if self.ball['x'] <= PADDLE_SIZE[0] and self.player1['y'] <= self.ball['y'] <= self.player1['y'] + PADDLE_SIZE[1]:
            self.ball['dx'] *= -1
        if self.ball['x'] >= GAME_SIZE[0] - PADDLE_SIZE[0] and self.player2['y'] <= self.ball['y'] <= self.player2['y'] + PADDLE_SIZE[1]:
            self.ball['dx'] *= -1

    def play_game(self: Any) -> None:
        if self.game_state == GAME_STATES[1]:
            self.move_ball()

    def __dict__(self: Any) -> dict:
        return {
            'ball': self.ball,
            'player1': self.player1,
            'player2': self.player2,
            'game_state': self.game_state
        }

    def __getitem__(self: Any, item: str) -> Any:  # noqa: ANN401
        return getattr(self, item)


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
            self.pong.reset_game(True)
        self.pong.game_state = GAME_STATES[1]

    def get_players(self: Any) -> dict:
        return self.players

    def get_game_state(self: Any) -> dict:
        return self.pong.__dict__


class GameConsumer(AsyncJsonWebsocketConsumer):
    multiplayer_pong = MultiplayerPong()
    groups = [ROOM_NAME]

    async def connect(self: AsyncJsonWebsocketConsumer) -> None:
        if not self.scope['user'].is_authenticated:
            await self.close()
        if not self.multiplayer_pong.pong:
            self.multiplayer_pong.init_game()
        self.channel_layer.group_add(ROOM_NAME, self.channel_name)
        await self.accept()
        self.multiplayer_pong.add_player(self.scope['user'].username)
        print('After connect:', self.multiplayer_pong.get_players())

    async def receive_json(self: AsyncJsonWebsocketConsumer, content: dict) -> None:
        if not self.scope['user'].is_authenticated:
            return await self.close()
        if 'action' in content and content['action'] == 'start' and self.multiplayer_pong.pong.game_state != GAME_STATES[1]:
            self.multiplayer_pong.start_game()
            asyncio.create_task(self.game_loop())
        if 'action' in content and content['action'] == 'reset' and self.multiplayer_pong.pong.game_state == GAME_STATES[2]:
            self.multiplayer_pong.init_game()
        if self.multiplayer_pong.pong.game_state != GAME_STATES[1]:
            return
        if 'direction' in content and (content['direction'] == 'left' or content['direction'] == 'right'):
            self.multiplayer_pong.move_paddle(self.scope['user'].username, content['direction'])

    async def game_loop(self: AsyncJsonWebsocketConsumer) -> None:
        while self.multiplayer_pong.pong.game_state == GAME_STATES[1]:
            await self.channel_layer.group_send(ROOM_NAME, {
                'type': 'game_state',
                'pong': self.multiplayer_pong.pong.__dict__()
            })
            self.multiplayer_pong.pong.play_game()
            await asyncio.sleep(FPS_SERVER)

    async def game_state(self: AsyncJsonWebsocketConsumer, event: dict) -> None:
        await self.send_json(event)

    async def disconnect(self: AsyncJsonWebsocketConsumer, code: None) -> None:
        if not self.scope['user'].is_authenticated:
            return await self.close()
        if self.multiplayer_pong.pong.game_state == GAME_STATES[1]:
            self.multiplayer_pong.pong.game_state = GAME_STATES[2]
            self.channel_layer.group_send(ROOM_NAME, {
                'type': 'game_state',
                'message': 'Game finished before it was completed.'
            })
        self.channel_layer.group_discard(ROOM_NAME, self.channel_name)
        self.multiplayer_pong.remove_player(self.scope['user'].username)
        print('After disconnect:', self.multiplayer_pong.get_players())
        return await super().close()
