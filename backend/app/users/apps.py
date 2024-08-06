from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self: object) -> None:
        try:
            users = self.get_model('Users')
            online_users = users.objects.all().filter(is_online=True)
            for user in online_users:
                user.is_online = False
                user.save()
        except:
            return
