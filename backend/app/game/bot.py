# from .pong import GAME_SIZE, PADDLE_SIZE
import time
from typing import Generator, Callable, Optional
GAME_SIZE = [400, 250]
PADDLE_SIZE = [10, 50]

def print_time_elapsed(func: Callable) -> Callable:
    def wrapper(*args: Optional[int], **kwargs: Optional[str]) -> any:
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        print(f'{func.__name__} took {time.perf_counter() - start_time} seconds in file {func.__code__.co_filename[func.__code__.co_filename.rfind("/") + 1:]}')
        return result
    return wrapper

def print_result(func: Callable) -> Callable:
    def wrapper(*args: Optional[int], **kwargs: Optional[str]) -> any:
        steps, result = func(*args, **kwargs)
        print(f'steps: {steps}\tresult: {result}')
        return steps, result
    return wrapper

@print_result
def get_pos_of_impact(ball: dict[str, int]) -> tuple[int, dict[str, int]]:
    steps = 0
    while True:
        if ball['dx'] > 0:
            time_to_wall = (GAME_SIZE[0] - ball['x']) // ball['dx']
        else:
            time_to_wall = ball['x'] // abs(ball['dx'])
        future_y = ball['y'] + ball['dy'] * time_to_wall
        if future_y < 0 or future_y > GAME_SIZE[1]:
            steps += abs(ball['dy'])
            if future_y < 0:
                ball['y'] = -future_y
                ball['dy'] = -ball['dy']
            else:
                ball['y'] = 2 * GAME_SIZE[1] - future_y
                ball['dy'] = -ball['dy']
        else:
            ball['x'] += ball['dx'] * time_to_wall
            ball['y'] = future_y
            ball['dx'] = -ball['dx']
            return steps + time_to_wall, ball

@print_time_elapsed
def ask_next_moves(ball: dict[str, int], number_of_frames: int, bot_y: int, handicap: float = 0) -> Generator[str, None, None]:
    total_steps, ball = get_pos_of_impact(ball)
    target_y = ball['y']
    gap = target_y - bot_y

    for _ in range(number_of_frames):
        if gap > 0:
            gap -= 1
            yield 'down'
        elif gap < 0:
            gap += 1
            yield 'up'
        else:
            yield 'None'

def count_up_and_down(g: Generator[str, None, None]) -> tuple[int, int]:
    up = 0
    down = 0
    for move in g:
        if move == 'up':
            up += 1
        elif move == 'down':
            down += 1
    return up, down

if __name__ == '__main__':
    ball = {'x': 370, 'y': 220, 'dx': 1, 'dy': -1}
    it = ask_next_moves(ball, 60, 200)
    print(count_up_and_down(it))