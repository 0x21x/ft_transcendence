# oauth.py
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model, authenticate, login, logout
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, AuthUser, api_settings
import requests
from ..models.users import Users
from ..serializers import UserSerializer, CustomTokenRefreshSerializer
from ..tokens import MyTokenViewBase
from .otp import check_otp
from .auth import LoginView, RegisterView, get_tokens_for_user
from ..sessions import login_session

User = get_user_model()

token_url = "https://api.intra.42.fr/v2/oauth/token"
user_info_url = "https://api.intra.42.fr/v2/me"
                                                      

class OAuthCallbackView(APIView):
    permission_classes = []
    
    def post(self, request) -> Response:
        authorization_code = request.data.get('code')
        if not authorization_code:
            return Response({"message": "Code d'autorisation manquant."}, status=status.HTTP_400_BAD_REQUEST)
        print(f"code: {authorization_code}")
        
        data = {
            'grant_type': 'authorization_code',
            'client_id': settings.CLIENT_ID,
            'client_secret': settings.CLIENT_SECRET,
            'code': authorization_code,
            'redirect_uri': settings.REDIRECT_URI,
        }

        try:
            token_response = requests.post(token_url, data=data)
            token_response = token_response.json()
            
            try:
                access_token = token_response['access_token']
            except KeyError:
                return Response({"message": "Erreur lors de la récupération du token"}, status=status.HTTP_400_BAD_REQUEST)

        except requests.RequestException as e:
            return Response({"message": f"Erreur lors de la récupération du token : {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        print(f"access_token: {access_token}")
        
        # return Response("access_token: {access_token}", status=status.HTTP_200_OK)
        
        response_me = requests.get(user_info_url, headers={'Authorization': f'Bearer {access_token}'})
        response_me = response_me.json()
        
        username = response_me.get('login')
        avatar = response_me['image']['link']
        print(f"username: {username}, avatar: {avatar}")
        
        # return Response({"username": username, "avatar": avatar}, status=status.HTTP_200_OK)
        
        user_data = {'username': username, 'password': User.objects.make_random_password()}
        
        try:
            user = Users.objects.get(username=username)
            print(f"Utilisateur {username} déjà existant")
        except Users.DoesNotExist:
            user_data = {'username': username, 'password': User.objects.make_random_password()}
            user = Users(**user_data)
            print(f"Création de l'utilisateur avec le nom d'utilisateur {username}")
            user.save()
            
            # return Response(user_data, status=status.HTTP_200_OK)

        # user_data = {'username': username, 'password': User.objects.make_random_password()}
        

        try:
            otp = request.data["otp"]
        except:
            otp = None
        user = authenticate(request, login=login)
        if user is None:
            return Response({"message": "Invalid username"}, status=status.HTTP_404_NOT_FOUND)
        if not user.check_password('password'):
            return Response({"message": "Invalid password"}, status=status.HTTP_401_UNAUTHORIZED)
        if user.otp_enabled == True is not None and not otp:
            return Response(status=status.HTTP_423_LOCKED)
        if otp and not check_otp(otp, user):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        login(request, user)
        response = Response(status=status.HTTP_200_OK)
        tokens = get_tokens_for_user(user)
        session = login_session(user)
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.set_cookie('access',
                            tokens['access'],
                            max_age=api_settings.ACCESS_TOKEN_LIFETIME.total_seconds() if api_settings.ACCESS_TOKEN_LIFETIME else None,
                            samesite='Lax',
                            secure=True,
                            httponly=True)
        response.set_cookie('refresh',
                            tokens['refresh'],
                            max_age=api_settings.REFRESH_TOKEN_LIFETIME.total_seconds() if api_settings.REFRESH_TOKEN_LIFETIME else None,
                            samesite='Lax',
                            secure=True,
                            httponly=True)
        response.set_cookie('session',
                            session.token,
                            max_age=api_settings.REFRESH_TOKEN_LIFETIME.total_seconds() if api_settings.REFRESH_TOKEN_LIFETIME else None,
                            samesite='Lax',
                            secure=True,
                            httponly=True)
        return response
        

        
        # if User.objects.filter(username=username).exists():
        #     user = User.objects.get(username=username)
        #     refresh = RefreshToken.for_user(user)
        #     return Response({
        #         'refresh': str(refresh),
        #         'access': str(refresh.access_token),
        #     }, status=status.HTTP_200_OK)
            
              
        
        
        # print(f"Création de l'utilisateur avec le nom d'utilisateur {username}")
        # user_data = {'username': username, 'password': User.objects.make_random_password()}
        # user_serializer = UserSerializer(data=user_data)
        # if not user_serializer.is_valid():
        #     print(f"Erreurs de validation lors de la création de l'utilisateur : {user_serializer.errors}")
        #     return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # user_serializer.save()
        # print(f"Utilisateur {username} créé avec succès")
        
        # user = User.objects.get(username=username)
        # refresh = RefreshToken.for_user(user)
        
        # print(f"Tokens JWT générés pour l'utilisateur {username} : refresh={str(refresh)}, access={str(refresh.access_token)}")

        # return Response({
        #         'refresh': str(refresh),
        #         'access': str(refresh.access_token),
        #     }, status=status.HTTP_200_OK)
        