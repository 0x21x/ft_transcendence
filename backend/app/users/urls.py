from django.urls import path
from .views import RegisterView, VerifyView, LoginView, LogoutView, MyTokenRefreshView


urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('verify/', VerifyView.as_view()),
    path('login/', LoginView.as_view()),
    path('login/refresh/', MyTokenRefreshView.as_view()),
    path('logout/', LogoutView.as_view()),
]