from django.apps import AppConfig


def ready() -> None:
    try:
        from .models.users import Users
        online_users = Users.objects.all().filter(is_online=True)
        for user in online_users:
            user.is_online = False
            user.save()
    except:
        pass

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

