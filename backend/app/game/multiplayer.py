from typing import Any, Optional
from channels.db import database_sync_to_async
from users.models.users import Users # noqa: F401
from .pong import Pong, GAME_STATES, MAX_PLAYERS
from .models import Game, Tournament
from .views.tournament_handler import check_tournament

ROOM_NAME = 'game'

PLAYER1_KEY = {
    'left': 'up',
    'right': 'down'
}

PLAYER2_KEY = {
    'left': 'down',
    'right': 'up'
}

class GameNotFoundException(Exception):
    pass

class GameFullException(Exception):
    pass

class MultiplayerPong:
    games = {}

    def __init__(self: Any) -> None:
        pass

    @database_sync_to_async
    def create_game(self: Any, game_name: str) -> None:
        tournament = Tournament.objects.filter(name=game_name).first()
        if tournament:
            self.games[game_name] = Pong(tournament.name)
        else:
            self.games[game_name] = Pong()

    async def add_player(self: Any, game_name: str, player_name: str) -> None:
        if not game_name in self.games:
            await self.create_game(game_name)
        if len(self.games[game_name].players) == MAX_PLAYERS or player_name in self.games[game_name].players:
            raise GameFullException()
        self.games[game_name].players[player_name] = 'player%d' % (len(self.games[game_name].players) + 1)

    def move_paddle(self: Any, game_name: str, player_name: str, direction: str) -> None:
        try:
            if not player_name in self.games[game_name].players:
                return
            direction = PLAYER1_KEY[direction] if self.games[game_name].players[player_name] == 'player1' else PLAYER2_KEY[direction]
            self.games[game_name].move_paddle(self.games[game_name].players[player_name], direction)
        except KeyError:
            return

    def remove_player(self: Any, game_name: str, player_name: str) -> None:
        if not player_name in self.games[game_name].players:
            return
        del self.games[game_name].players[player_name]
        for i, player in enumerate(self.games[game_name].players):
            self.games[game_name].players[player] = 'player%d' % (i + 1)

    def start_game(self: Any, game_name: str) -> None:
        if len(self.games[game_name].players) < MAX_PLAYERS:
            return
        if self.games[game_name].game_state == GAME_STATES[2]:
            self.games[game_name].reset_game()
        self.update_game_status(game_name, GAME_STATES[1])
        self.games[game_name].game_state = GAME_STATES[1]

    def play_game(self: Any, game_name: str) -> None:
        self.games[game_name].play_game()

    @database_sync_to_async
    def update_game_status(self: Any, game_name: str, status: str) -> None:
        Game.objects.filter(name=game_name).update(status=GAME_STATES[1])

    @database_sync_to_async
    def save_scores(self: Any, game_name: str, delete_after_save: bool = False, loser: Optional[str] = None) -> None:
        if self.games[game_name].game_state != GAME_STATES[2]:
            return
        names = self.get_names(game_name)
        game = Game.objects.get(name=game_name)
        if not game:
            return
        game.status = 'finished'
        for player in names:
            game.scores.create(score=self.games[game_name].__dict__()[self.games[game_name].players[player]]['score'], player=Users.objects.get(username=player))
        if not loser:
            game.winner = game.scores.order_by('-score').first().player
        else:
            loser_user = Users.objects.get(username=loser)
            game.winner = game.scores.exclude(player=loser_user).order_by('-score').first().player
        game.save()
        if delete_after_save:
            del self.games[game_name]
        if game.tournament_name:
            check_tournament(game.tournament_name)

    @database_sync_to_async
    def get_infos(self: Any) -> list:
        games = []

        for game in Game.objects.all().filter(status='waiting', tournament_name__isnull=True):
            if not game.name in self.games:
                games.append({'name': game.name, 'players': [], 'status': 'waiting'})
            else:
                games.append({
                        'name': game.name,
                        'players': self.games[game.name].players,
                        'status': self.games[game.name].game_state,
                    })
        return games

    def game_full(self: Any, game_name: str) -> bool:
        if not game_name in self.games:
            raise GameNotFoundException()
        return len(self.games[game_name].players) == MAX_PLAYERS

    def get_names(self: Any, game_name: str) -> list:
        if not game_name in self.games:
            raise GameNotFoundException()
        return list(self.games[game_name].players.keys())

    def get_players(self: Any, game_name: str) -> dict:
        if not game_name in self.games:
            raise GameNotFoundException()
        return self.games[game_name].players

    def get_game_status(self: Any, game_name: str) -> str:
        if not game_name in self.games:
            raise GameNotFoundException()
        return self.games[game_name].game_state

    def all_game_status(self: Any) -> dict:
        return {game: self.games[game].game_state for game in self.games}

    def get_game_state(self: Any, game_name: str) -> dict:
        if not game_name in self.games:
            raise GameNotFoundException()
        return self.games[game_name].__dict__()

    def set_game_status(self: Any, game_name: str, status: str) -> None:
        if not game_name in self.games:
            raise GameNotFoundException()
        self.games[game_name].game_state = status

    @classmethod
    def get_players_by_status(cls: type, status: str) -> list:
        return [cls.games[game].players for game in cls.games if cls.games[game].game_state == status]