"""
URL configuration for app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.game, name='game')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='game')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import include, path
from django.shortcuts import HttpResponse
from game.apps import ready as game_ready
from users.apps import ready as users_ready

def health_check(request: any) -> HttpResponse:
    return HttpResponse(200)

urlpatterns = [
    path('health/', health_check),
    path('api/', include('users.urls')),
]

# DO ONE TIME STARTUP METHOD CALLS HERE
game_ready()
users_ready()
