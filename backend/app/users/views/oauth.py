from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.settings import api_settings
from requests_oauthlib import OAuth2Session
from ..models import Users
from ..serlializers import UserSerializer, CustomTokenRefreshSerializer
from ..tokens import MyTokenViewBase
from .otp import check_otp

class OAuthRegisterView(APIView):
    permission_classes = []
    
    def get(self: APIView, request) -> Response:
        print(f"API42_UID: {settings.API42_UID}")
        print(f"API42_REDIRECT_URI: {settings.API42_REDIRECT_URI}")
        print(f"API42_BASE_URL: {settings.API42_BASE_URL}")
        
        api42 = OAuth2Session(settings.API42_UID, redirect_uri=settings.API42_REDIRECT_URI)
        url_authorization, state = api42.authorization_url(f"{settings.API42_BASE_URL}/oauth/authorize")
        
        request.session['oauth_state'] = state
        print(f"URL d'autorisation: {url_authorization}, état: {state}")
        
        state = request.session.get('oauth_state')
        print(f"state: {state}")
        if not state:
            return Response({"message": "État OAuth manquant. Réessayez la connexion."}, status=status.HTTP_400_BAD_REQUEST)
        
        api42 = OAuth2Session(settings.API42_UID, state=state, redirect_uri=settings.API42_REDIRECT_URI)
        print(f"api42: {api42}")
        print(f"settings.API42_UID: {settings.API42_UID}")
        print(f"state: {state}")
        print(f"settings.API42_REDIRECT_URI: {settings.API42_REDIRECT_URI}")
        print("before token")
        
        try:
            token = api42.fetch_token(
				f"{settings.API42_BASE_URL}/oauth/token",
				client_secret=settings.API42_SECRET,
				authorization_response=request.get_full_path()
			)
            print(f"Token: {token}")
        except Exception as e:
            print(f"Erreur lors de la récupération du token: {e}")
            return Response({"message": "Erreur lors de la récupération du token"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_info = api42.get(f"{settings.API42_BASE_URL}/v2/me").json()
        except Exception as e:
            print(f"Erreur lors de la récupération des informations utilisateur: {e}")
            return Response({"message": "Erreur lors de la récupération des informations utilisateur"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        prenom = user_info.get('first_name')
        nom = user_info.get('last_name')
        email = user_info.get('email')
        username = user_info.get('login')
        print(f"Prénom: {prenom}, Nom: {nom}, Email: {email}, Nom d'utilisateur: {username}")
        
        if Users.objects.filter(username=request.data["username"]).exists():
            return Response({"Username already exists"}, status=status.HTTP_409_CONFLICT)
        
        rdata = {'username': username, 'password': '1234'}
        user = UserSerializer(data=rdata)
        if not user.is_valid():
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        user.save()
        
        user = User.objects.get(username=username)
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


# class OAuthRegisterView(APIView):
#     def post(self: APIView, request: any) -> Response:
        """
            :param request: Any
            :return A Response with the user.data

            Register a user:
            Authenticate the user with credentials got from 42api, if user is valid login it
            and get JWT tokens for it and set them in the cookies.
        """
        pass

class OAuthLoginView(APIView):
    def post(self: APIView, request: any) -> Response:
        """
            :param request: Any
            :return A Response with the user.data with cookies put inside

            Login a user:
            Check if there is already a user with the same username in database,
            if not create a user (Database object), check if the serialized user is valid and then save it.
        """
        pass
