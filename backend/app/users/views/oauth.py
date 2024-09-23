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

def get_tokens_for_user(user: AuthUser) -> dict:
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class OAuthRegisterView(RegisterView):
    permission_classes = []
    
    def get(self, request) -> Response:
        state = request.session.get('oauth_state')

        if not state:
            print("Première étape : Initialisation de l'authentification OAuth")
            api42 = OAuth2Session(settings.API42_UID, redirect_uri=settings.API42_REDIRECT_URI)
            url_authorization, state = api42.authorization_url(f"{settings.API42_BASE_URL}/oauth/authorize")

            request.session['oauth_state'] = state
            print(f"URL d'autorisation générée : {url_authorization}")
            print(f"État stocké dans la session : {state}")

            return Response({"authorization_url": url_authorization})
        else:
            print("Deuxième étape : Callback après l'autorisation")
            api42 = OAuth2Session(settings.API42_UID, state=state, redirect_uri=settings.API42_REDIRECT_URI)

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

            try:
                user_info = api42.get(f"{settings.API42_BASE_URL}/v2/me").json()
                print(f"Informations utilisateur récupérées : {user_info}")
            except Exception as e:
                print(f"Erreur lors de la récupération des informations utilisateur : {str(e)}")
                return Response({"message": "Erreur lors de la récupération des informations utilisateur"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

    
    # def post(self: APIView, request: any) -> Response:
    #     """
    #         :param request: Any
    #         :return A Response with the user.data

    #         Register a user:
    #         Authenticate the user with credentials got from 42api, if user is valid login it
    #         and get JWT tokens for it and set them in the cookies.
    #     """
    #     pass

class OAuthLoginView(LoginView):
    permission_classes = []
    
    def post(self: APIView, request: any) -> Response:
        username = request.data("username")
        password = request.data("password")
        otp = request.data.get("otp")

        user = authenticate(request, username=username, password=password)
        
        if user is None:
            return Response({"message": "Invalid username"}, status=status.HTTP_404_NOT_FOUND)
        if not user.check_password(password):
            return Response({"message": "Invalid password"}, status=status.HTTP_401_UNAUTHORIZED)
        if user.otp_enabled == True is not None and not otp:
            return Response(status=status.HTTP_423_LOCKED)
        if otp and not check_otp(otp, user):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        login(request, user)
        response = Response(status=status.HTTP_200_OK)
        tokens = get_tokens_for_user(user)
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.set_cookie('access',
                            tokens['access'],
                            max_age=api_settings.ACCESS_TOKEN_LIFETIME.total_seconds() if api_settings.ACCESS_TOKEN_LIFETIME else None,
                            # secure=False, // Have to uncomment this line when using HTTPS
                            httponly=True)
        response.set_cookie('refresh',
                            tokens['refresh'],
                            max_age=api_settings.REFRESH_TOKEN_LIFETIME.total_seconds() if api_settings.REFRESH_TOKEN_LIFETIME else None,
                            # secure=False, // Have to uncomment this line when using HTTPS
                            httponly=True)
        return response    
    
    # def post(self: APIView, request: any) -> Response:
    #     """
    #         :param request: Any
    #         :return A Response with the user.data with cookies put inside

    #         Login a user:
    #         Check if there is already a user with the same username in database,
    #         if not create a user (Database object), check if the serialized user is valid and then save it.
    #     """
    #     pass
