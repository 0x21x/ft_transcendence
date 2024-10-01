import math
from typing import Any, Optional
from random import uniform, choice

GAME_STATES = ['waiting', 'in_progress', 'finished']
GAME_SIZE = [400, 250]
PADDLE_SIZE = [10, 50]
BALL_SIZE = 10
INIT_RADIANS = [[235 * math.pi / 180, 300 * math.pi / 180], [55 * math.pi / 180, 125 * math.pi / 180]]
MAX_SCORE = 20
MAX_PLAYERS = 2
FPS = 40
FPS_SERVER = (1000 / FPS / 1000) if FPS > 0 else 0.1
SPEED = 1 * (60 / FPS)

def ball_touching_paddle(player: dict, ball: dict) -> bool:
    return (player['y'] <= ball['y'] <= player['y'] + PADDLE_SIZE[1]
            or player['y'] <= ball['y'] + BALL_SIZE <= player['y'] + PADDLE_SIZE[1])

class Pong:
    def __init__(self: Any, tournament_name: Optional[str] = None) -> None:
        random_radians = choice(INIT_RADIANS)
        self.ball = {
            'x': GAME_SIZE[0] / 2 - BALL_SIZE / 2,
            'y': GAME_SIZE[1] / 2 - BALL_SIZE / 2,
            'speed': SPEED,
            'angle': uniform(random_radians[0], random_radians[1]) - math.pi / 2
        }
        self.players = {}
        self.player1 = {
            'x': 0,
            'y': GAME_SIZE[1] / 2 - PADDLE_SIZE[1] / 2,
            'score': 0
        }
        self.player2 = {
            'x': GAME_SIZE[0] - PADDLE_SIZE[0],
            'y': GAME_SIZE[1] / 2 - PADDLE_SIZE[1] / 2,
            'score': 0
        }
        self.game_state = GAME_STATES[0]
        self.tournament_name = tournament_name

    def reset_game(self: Any) -> None:
        if self.player1['score'] == MAX_SCORE or self.player2['score'] == MAX_SCORE:
            self.game_state = GAME_STATES[2]
            return
        random_radians = choice(INIT_RADIANS)
        self.ball = {
            'x': GAME_SIZE[0] / 2 - BALL_SIZE / 2,
            'y': GAME_SIZE[1] / 2 - BALL_SIZE / 2,
            'speed': SPEED,
            'angle': uniform(random_radians[0], random_radians[1]) - math.pi / 2
        }
        self.player1['y'] = GAME_SIZE[1] / 2 - PADDLE_SIZE[1] / 2
        self.player2['y'] = GAME_SIZE[1] / 2 - PADDLE_SIZE[1] / 2
        self.tournament_name = self.tournament_name if self.tournament_name else None

    def move_paddle(self: Any, player: str, direction: str) -> None:
        if direction == 'up':
            if self[player]['y'] > 0:
                self[player]['y'] -= 1
        elif direction == 'down':
            if self[player]['y'] < GAME_SIZE[1] - PADDLE_SIZE[1]:
                self[player]['y'] += 1

    def move_ball(self: Any) -> None:
        self.ball['x'] += self.ball['speed'] * math.cos(self.ball['angle'])
        self.ball['y'] += self.ball['speed'] * math.sin(self.ball['angle'])

        # Handle top and bottom boundary collision
        if self.ball['y'] <= 0 or self.ball['y'] + BALL_SIZE >= GAME_SIZE[1]:
            self.ball['angle'] = -self.ball['angle']
            self.ball['speed'] = self.ball['speed'] * 1.05

        # Handle paddle collision
        if self.ball['x'] <= PADDLE_SIZE[0]:
            if ball_touching_paddle(self.player1, self.ball) and math.cos(self.ball['angle']) < 0:
                self.reflect_ball(self.player1)
                return
            if self.ball['x'] <= 0:
                self.player2['score'] += 1
                self.reset_game()
        elif self.ball['x'] >= GAME_SIZE[0] - PADDLE_SIZE[0] - BALL_SIZE:
            if ball_touching_paddle(self.player2, self.ball) and math.cos(self.ball['angle']) > 0:
                self.reflect_ball(self.player2)
                return
            if self.ball['x'] >= GAME_SIZE[0] - BALL_SIZE:
                self.player1['score'] += 1
                self.reset_game()


    def reflect_ball(self: Any, player: dict) -> None:
        self.ball['angle'] = math.pi - self.ball['angle']

        paddle_center = player['y'] + PADDLE_SIZE[1] / 2
        hit_pos = ((self.ball['y'] + BALL_SIZE / 2) - paddle_center) / (PADDLE_SIZE[1] / 2)
        self.ball['angle'] += hit_pos * (math.pi / 8)

        self.ball['angle'] %= 2 * math.pi
        self.ball['speed'] *= math.pow(1.01, hit_pos)

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
