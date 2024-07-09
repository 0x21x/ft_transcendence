from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, AuthUser, api_settings
from .models import Users
from .serlializers import UserSerializer
from .tokens import MyTokenViewBase


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
        print(request.data)
        username = request.data["username"]
        password = request.data["password"]
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({"message": "Invalid username"}, status=status.HTTP_404_NOT_FOUND)
        if not user.check_password(password):
            return Response({"message": "Invalid password"}, status=status.HTTP_401_UNAUTHORIZED)
        login(request, user)
        response = Response(status=status.HTTP_200_OK)
        tokens = get_tokens_for_user(user)
        response.headers['Access-Control-Allow-Credentials'] = 'true'

        response.set_cookie('access',
                            tokens['access'],
                            max_age=api_settings.ACCESS_TOKEN_LIFETIME.total_seconds() if api_settings.ACCESS_TOKEN_LIFETIME else None,
                            # secure=False, // Uncomment this line if you are not using HTTPS
                            httponly=True)
        response.set_cookie('refresh',
                            tokens['refresh'],
                            max_age=api_settings.REFRESH_TOKEN_LIFETIME.total_seconds() if api_settings.REFRESH_TOKEN_LIFETIME else None,
                            # secure=False, // Uncomment this line if you are not using HTTPS
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
        # user = request.user
        # serializer = UserSerializer(user, many=False)
        # return Response(serializer.data)
        return Response({"message": "You are authenticated"}, status=status.HTTP_200_OK)

class MyTokenRefreshView(MyTokenViewBase):
    """
    Takes a refresh type JSON web token and returns an access type JSON web
    token if the refresh token is valid.
    """

    _serializer_class = api_settings.TOKEN_REFRESH_SERIALIZER