from typing import Any
from random import choice

GAME_STATES = ['waiting', 'in_progress', 'finished']
GAME_SIZE = [400, 250]
PADDLE_SIZE = [10, 50]
BALL_SIZE = 10
MAX_SCORE = 3
MAX_PLAYERS = 2
FPS_SERVER = 60
FPS_SERVER_MILLISECONDS = (1000 / FPS_SERVER / 1000) if FPS_SERVER > 0 else 0.1
BOT_FPS = 1

from .bot import ask_next_moves

class Pong:
    def __init__(self: Any) -> None:
        self.ball = {
            'x': GAME_SIZE[0] / 2,
            'y': GAME_SIZE[1] / 2,
            'dx': choice([-1, 1]),
            'dy': choice([-1, 1])
        }
        self.players = {}
        self.ago_bot = False
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

    def reset_game(self: Any) -> None:
        if self.player1['score'] == MAX_SCORE or self.player2['score'] == MAX_SCORE:
            self.game_state = GAME_STATES[2]
            return
        self.ball = {
            'x': GAME_SIZE[0] / 2,
            'y': GAME_SIZE[1] / 2,
            'dx': choice([-1, 1]),
            'dy': choice([-1, 1])
        }
        self.ago_bot = self.ago_bot
        self.player1 = {
            'x': 0,
            'y': GAME_SIZE[1] / 2,
            'score': self.player1['score']
        }
        self.player2 = {
            'x': GAME_SIZE[0] - PADDLE_SIZE[0],
            'y': GAME_SIZE[1] / 2,
            'score': self.player2['score']
        }

    def play_game(self: Any) -> None:
        self.move_ball()
        if self.ago_bot:
            try:
                self.move_paddle(self.players['bot'], next(self.bot_moves))
            except StopIteration:
                self.bot_moves = ask_next_moves(self.ball, int(FPS_SERVER / BOT_FPS), self.player2['y'])

    def start_game(self: Any) -> None:
        if 'bot' in self.players:
            self.bot_moves = ask_next_moves(self.ball, int(FPS_SERVER / BOT_FPS), self.player2['y'])
            self.ago_bot = True

    def add_bot(self: Any) -> None:
        if len(self.players) == MAX_PLAYERS:
            return
        self.players['bot'] = 'player%d' % (len(self.players) + 1)

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

    def __dict__(self: Any) -> dict:
        dict = {}
        dict['ball'] = self.ball
        for i, player in enumerate([self.player1, self.player2], start=1):
            dict['player%d' % i] = player
        dict['game_state'] = self.game_state
        return dict

    def __getitem__(self: Any, item: str) -> Any:  # noqa: ANN401
        return getattr(self, item)

