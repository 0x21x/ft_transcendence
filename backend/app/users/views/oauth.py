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

User = get_user_model()

class OAuthCallbackView(APIView):
    permission_classes = []
    
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
        
        user_info = api42.get(f"{settings.API42_BASE_URL}/v2/me").json()
        print(f"Informations utilisateur récupérées : {user_info}")
        
        prenom = user_info.get('first_name')
        nom = user_info.get('last_name')
        email = user_info.get('email')
        username = user_info.get('login')
        print(f"Prénom : {prenom}, Nom : {nom}, Email : {email}, Nom d'utilisateur : {username}")
        
        if User.objects.filter(username=username).exists():
            print(f"Nom d'utilisateur {username} déjà existant")
            return Response({"message": "Nom d'utilisateur déjà existant"}, status=status.HTTP_409_CONFLICT)
        
        print(f"Création de l'utilisateur avec le nom d'utilisateur {username}")
        user_data = {'username': username, 'password': User.objects.make_random_password()}
        user_serializer = UserSerializer(data=user_data)
        if not user_serializer.is_valid():
            print(f"Erreurs de validation lors de la création de l'utilisateur : {user_serializer.errors}")
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_serializer.save()
        print(f"Utilisateur {username} créé avec succès")
        
        user = User.objects.get(username=username)
        refresh = RefreshToken.for_user(user)
        
        print(f"Tokens JWT générés pour l'utilisateur {username} : refresh={str(refresh)}, access={str(refresh.access_token)}")

        return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        
        
