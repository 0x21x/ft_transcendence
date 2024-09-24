from django.urls import path
from .views.user import UsernameView, PasswordView, AvatarView, GetAvatarView, GetUserInfoView
from .views.auth import RegisterView, LoginView, LogoutView, MyTokenRefreshView, VerifyView
from .views.otp import RegisterOTPView, LogoutOTPView
from .views.oauth import OAuthLoginView, OAuthRegisterView
from .views.friendships import FriendshipsView
from game.views import (
    GamesHistoryView,
    GamesHistoryForUserView,
    GamesHandlerView,
    TournamentHandlerView,
    TournamentsHandlerView
)

urlpatterns = [
    path('auth/verify/', VerifyView.as_view()),

    # Classic Auth
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('auth/login/refresh/', MyTokenRefreshView.as_view()),
    path('auth/logout/', LogoutView.as_view()),

    # Oauth (inherit from classic auth)
    path('oauth/login/', OAuthLoginView.as_view()),
    path('oauth/register/', OAuthRegisterView.as_view()),

    # OTP
    path('otp/register/', RegisterOTPView.as_view()),
    path('otp/logout/', LogoutOTPView.as_view()),

    path('users/<str:username>/', GetUserInfoView.as_view()),
    path('usernames/', UsernameView.as_view()),
    path('passwords/', PasswordView.as_view()),
    path('avatars/<str:username>/', GetAvatarView.as_view()),
    path('avatars/', AvatarView.as_view()),

    # Games history
    path('games/history/', GamesHistoryView.as_view()),
    path('games/history/<str:username>', GamesHistoryForUserView.as_view()),

    # Games
    path('games/', GamesHandlerView.as_view()),

    # Tournaments
    path('tournaments/', TournamentsHandlerView.as_view(), name='tournaments'),
    path('tournaments/<str:tournaments_status>/', TournamentsHandlerView.as_view(), name='tournaments'),
    path('tournament/<str:tournament_name>/', TournamentHandlerView.as_view(), name='tournament'),

    # Friendships
    path('friendships/<str:status_of_friendship>/', FriendshipsView.as_view(), name='friendships_with_status'),
    path('friendships/', FriendshipsView.as_view(), name='friendships'),
]