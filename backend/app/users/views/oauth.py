# oauth.py
from django.conf import settings
from django.contrib.auth import get_user_model, authenticate, login, logout
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, AuthUser, api_settings
from requests_oauthlib import OAuth2Session
from ..models import users
from ..serializers import UserSerializer, CustomTokenRefreshSerializer
from ..tokens import MyTokenViewBase
from .otp import check_otp
from .auth import LoginView, RegisterView

User = get_user_model()

class OAuthCallbackView(RegisterView):
    permission_classes = []
    
    def get(self, request) -> Response:
        state = request.data.code.get()
        
    token = fetch()