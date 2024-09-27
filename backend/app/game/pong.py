import math
from typing import Any, Optional
from random import uniform, choice

GAME_STATES = ['waiting', 'in_progress', 'finished']
GAME_SIZE = [400, 250]
PADDLE_SIZE = [10, 50]
BALL_SIZE = 10
INIT_RADIANS = [[245 * math.pi / 180, 290 * math.pi / 180], [65 * math.pi / 180, 115 * math.pi / 180]]
MAX_SCORE = 20
MAX_PLAYERS = 2
FPS_SERVER = 160
FPS_SERVER = (1000 / FPS_SERVER / 1000) if FPS_SERVER > 0 else 0.1

class Pong:
    def __init__(self: Any, tournament_name: Optional[str] = None) -> None:
        random_radians = choice(INIT_RADIANS)
        self.ball = {
            'x': GAME_SIZE[0] / 2,
            'y': GAME_SIZE[1] / 2,
            'speed': 1,
            'angle': uniform(random_radians[0], random_radians[1]) - math.pi / 2
        }
        self.players = {}
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
        print('radian:',self.ball['angle'], random_radians)
        self.game_state = GAME_STATES[0]
        self.tournament_name = tournament_name

    def reset_game(self: Any) -> None:
        if self.player1['score'] == MAX_SCORE or self.player2['score'] == MAX_SCORE:
            self.game_state = GAME_STATES[2]
            return
        random_radians = choice(INIT_RADIANS)
        self.ball = {
            'x': GAME_SIZE[0] / 2,
            'y': GAME_SIZE[1] / 2,
            'speed': 1,
            'angle': uniform(random_radians[0], random_radians[1]) - math.pi / 2
        }
        print('radian:',self.ball['angle'], random_radians)
        self.player1['y'] = GAME_SIZE[1] / 2
        self.player2['y'] = GAME_SIZE[1] / 2
        self.tournament_name = self.tournament_name if self.tournament_name else None

    def move_paddle(self: Any, player: str, direction: str) -> None:
        if direction == 'up':
            if self[player]['y'] > 0:
                self[player]['y'] -= 10
        elif direction == 'down':
            if self[player]['y'] < GAME_SIZE[1] - PADDLE_SIZE[1]:
                self[player]['y'] += 10

    def move_ball(self: Any) -> None:
        # Move the ball based on the angle and speed
        self.ball['x'] += self.ball['speed'] * math.cos(self.ball['angle'])
        self.ball['y'] += self.ball['speed'] * math.sin(self.ball['angle'])

        # Handle top and bottom boundary collision
        if self.ball['y'] <= 0 or self.ball['y'] + BALL_SIZE >= GAME_SIZE[1]:
            # Reflect angle vertically (flip dy)
            self.ball['angle'] = -self.ball['angle']

        # Handle ball out of bounds (left or right)
        if self.ball['x'] <= 0:
            self.player2['score'] += 1
            self.reset_game()
        elif self.ball['x'] >= GAME_SIZE[0] - BALL_SIZE:
            self.player1['score'] += 1
            self.reset_game()

        # Handle paddle collision
        if self.ball['x'] <= PADDLE_SIZE[0]:
            if self.player1['y'] <= self.ball['y'] <= self.player1['y'] + PADDLE_SIZE[1]:
                self.reflect_ball(self.player1)
        elif self.ball['x'] >= GAME_SIZE[0] - PADDLE_SIZE[0] - BALL_SIZE:
            if self.player2['y'] <= self.ball['y'] <= self.player2['y'] + PADDLE_SIZE[1]:
                self.reflect_ball(self.player2)

    def reflect_ball(self: Any, player: dict) -> None:
        self.ball['angle'] = math.pi - self.ball['angle']

        paddle_center = player['y'] + PADDLE_SIZE[1] / 2
        hit_pos = ((self.ball['y'] + BALL_SIZE / 2) - paddle_center) / (PADDLE_SIZE[1] / 2)
        self.ball['angle'] += hit_pos * (math.pi / 8)

        # self.ball['angle'] %= 2 * math.pi

    def play_game(self: Any) -> None:
        if self.game_state == GAME_STATES[1]:
            self.move_ball()

    def __dict__(self: Any) -> dict:
        dict = {}
        dict['ball'] = self.ball
        for i, player in enumerate([self.player1, self.player2], start=1):
            dict['player%d' % i] = player
        dict['game_state'] = self.game_state
        if self.tournament_name:
            dict['tournament_name'] = self.tournament_name
        return dict

    def __getitem__(self: Any, item: str) -> Any:  # noqa: ANN401
        return getattr(self, item)

