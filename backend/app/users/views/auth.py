# auth.py
from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, AuthUser, api_settings

from users.models.users import Users
from ..serializers import UserSerializer, CustomTokenRefreshSerializer
from ..tokens import MyTokenViewBase
from ..sessions import login_session
from .otp import check_otp

def get_tokens_for_user(user: AuthUser) -> dict:
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class RegisterView(APIView):
    permission_classes = []

    def post(self: APIView, request: any) -> Response:
        if Users.objects.filter(username=request.data["username"]).exists():
            return Response({"Username already exists"}, status=status.HTTP_409_CONFLICT)
        user = UserSerializer(data=request.data)
        if not user.is_valid():
            return Response(status=status.HTTP_400_BAD_REQUEST)
        user.save()
        return Response(user.data, status=status.HTTP_200_OK)

class LoginView(APIView):
    permission_classes = []

    def post(self: APIView, request: any) -> Response:
        username = request.data["username"]
        password = request.data["password"]
        try:
            otp = request.data["otp"]
        except:
            otp = None
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

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self: APIView, request: any) -> Response:
        logout(request)
        response = Response(status=status.HTTP_200_OK)
        response.delete_cookie('access')
        response.delete_cookie('refresh')
        return response

class VerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self: APIView, request: any) -> Response:
        return Response(status=status.HTTP_200_OK)

class MyTokenRefreshView(MyTokenViewBase):
    """
    Takes a refresh type JSON web token and returns an access type JSON web
    token if the refresh token is valid.
    """

    serializer_class = CustomTokenRefreshSerializer