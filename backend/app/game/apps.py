from django.apps import AppConfig

def ready() -> None:
    try:
        from .consumers.game import GameConsumer
        from .models import Game
        active_games = Game.objects.all().filter(status='waiting')
        for game in active_games:
            GameConsumer.add_room_to_groups('game_%s' % game.name)
    except:
        return

class GameConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'game'