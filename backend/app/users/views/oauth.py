# oauth.py
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model, authenticate, login, logout
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.tokens import RefreshToken, AuthUser, api_settings
from requests_oauthlib import OAuth2Session
from ..models import Users
from ..serializers import UserSerializer, CustomTokenRefreshSerializer
from ..tokens import MyTokenViewBase
from .otp import check_otp
from .auth import LoginView, RegisterView

### Ajouter les fonctions pour recuperer les prenoms, noms, emails (enlever le commenteaire une fois fait)

User = get_user_model()

class OAuthCallbackView(APIView):
    def get(self, request) -> Response:
        
        state = request.data.get('code')
        
        api42 = OAuth2Session(settings.API42_UID, state=state, redirect_uri=settings.API42_REDIRECT_URI)
        print("API42: {api42}")
        
        try:
            token = api42.fetch_token(
                f"{settings.API42_BASE_URL}/oauth/token",
                client_secret=settings.API42_SECRET,
                authorization_response=request.build_absolute_uri()
                )
            print(f"Token récupéré avec succès : {token}")

        except Exception as e:
                print(f"Erreur lors de la récupération du token : {str(e)}")
                return Response({"message": f"Erreur lors de la récupération du token: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        
        
         
        return Response({"token": token}, status=status.HTTP_200_OK)
