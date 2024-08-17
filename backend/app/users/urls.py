from django.urls import path
from .views.user import UsernameView, PasswordView, AvatarView, GetAvatarView, GetUserInfoView
from .views.auth import RegisterView, LoginView, LogoutView, MyTokenRefreshView, VerifyView
from .views.otp import RegisterOTPView, LogoutOTPView
from .views.oauth import OAuthLoginView, OAuthRegisterView
from game.views import GamesHistoryView, GamesHistoryForUserView, GamesHandlerView # noqa: F401

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

    path('games/', GamesHandlerView.as_view()),
]