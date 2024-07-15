from django.urls import path
from .views import RegisterView, VerifyView, LoginView, LogoutView, MyTokenRefreshView
from .views import UsernameView, AvatarView, GetAvatarView


urlpatterns = [
    path('auth/register/', RegisterView.as_view()),
    path('auth/verify/', VerifyView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('auth/login/refresh/', MyTokenRefreshView.as_view()),
    path('auth/logout/', LogoutView.as_view()),
    path('usernames/', UsernameView.as_view()),
    path('avatars/<str:username>/', GetAvatarView.as_view()),
    path('avatars/', AvatarView.as_view()),
]