from django.urls import path
from .views import RegisterView, VerifyView, LoginView, LogoutView, MyTokenRefreshView
from .views import UsernameView, PasswordView, AvatarView, GetAvatarView, GetUserInfoView
from .oauth import OAuthLoginView, OAuthRegisterView

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


    path('users/<str:username>/', GetUserInfoView.as_view()),
    path('usernames/', UsernameView.as_view()),
    path('passwords/', PasswordView.as_view()),
    path('avatars/<str:username>/', GetAvatarView.as_view()),
    path('avatars/', AvatarView.as_view()),
]