from django.conf import settings
from django.contrib.auth import login
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import api_settings
import requests
from ..models.users import Users
from .otp import check_otp
from .auth import get_tokens_for_user
from ..sessions import login_session

token_url = "https://api.intra.42.fr/v2/oauth/token"
user_info_url = "https://api.intra.42.fr/v2/me"

class OAuthCallbackView(APIView):
    permission_classes = []
    def post(self: APIView, request: any) -> Response:
        authorization_code = request.data.get('code')
        if not authorization_code:
            return Response(status=status.HTTP_400_BAD_REQUEST)
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
                return Response(status=status.HTTP_400_BAD_REQUEST)
        except requests.RequestException:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        response_me = requests.get(user_info_url, headers={'Authorization': f'Bearer {access_token}'})
        response_me = response_me.json()
        username = response_me.get('login')
        # avatar = response_me['image']['link']
        try:
            user = Users.objects.get(username=username)
        except Users.DoesNotExist:
            user_data = {'username': username, 'password': Users.objects.make_random_password()}
            user = Users(**user_data)
            user.save()
        try:
            otp = request.data["otp"]
        except:
            otp = None
        if user.otp_enabled == True and not otp:
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