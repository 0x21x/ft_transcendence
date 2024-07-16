from pathlib import Path
from django.http import FileResponse
from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, AuthUser, api_settings
from .models import Users
from .serlializers import UserSerializer, CustomTokenRefreshSerializer
from .tokens import MyTokenViewBase


def get_tokens_for_user(user: AuthUser) -> dict:
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class UsernameView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self: APIView, request: any) -> Response:
        message = {'username': request.user.username}
        return Response(message, status=status.HTTP_200_OK)

    def put(self: APIView, request: any) -> Response:
        if Users.objects.filter(username=request.data['username']).exists():
            return Response(status=status.HTTP_409_CONFLICT)
        try:
            instance = Users.objects.get(username=request.user.username)
        except Users.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        user = UserSerializer(instance, data={'username': request.data['username']}, partial=True)
        if not user.is_valid():
            return Response(status=status.HTTP_400_BAD_REQUEST)
        user.save()
        message = {'username': user.validated_data['username']}
        return Response(message, status=status.HTTP_200_OK)

class AvatarView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self:APIView, request: any) -> Response:
        try:
            instance = Users.objects.get(username=request.user.username)
        except Users.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        message = {'avatar_url': instance.avatar.name}
        return Response(message, status=status.HTTP_200_OK)

    def put(self:APIView, request: any) -> Response:
        try:
            instance = Users.objects.get(username=request.user.username)
        except Users.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        instance.avatar = request.data['avatar']
        instance.save()
        message = {'avatar_url': instance.avatar.name}
        return Response(message, status=status.HTTP_200_OK)

class GetAvatarView(APIView):
    permission_classes = []

    def get(self:APIView, request: any, username: str) -> FileResponse:
        path = Path(__file__).resolve().parent.parent / 'avatars' / username
        try:
                img = open(path, 'rb')
                response = FileResponse(img, status=status.HTTP_200_OK)
                return response

        except IOError:
            return Response(status=status.HTTP_404_NOT_FOUND) # type: ignore

class GetUserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self:APIView, request: any, username: str) -> Response:
        try:
            instance = Users.objects.get(username=username)
        except Users.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        user = UserSerializer(instance)
        return Response(user.data, status=status.HTTP_200_OK)

class PasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self:APIView, request: any) -> Response:
        try:
            instance = Users.objects.get(username=request.user.username)
        except Users.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if not instance.check_password(request.data['old_password']):
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        if request.data['old_password'] == request.data['new_password']:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        instance.set_password(request.data['new_password'])
        instance.save()
        return Response(status=status.HTTP_200_OK)

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
                            # secure=False, // Have to uncomment this line when using HTTPS
                            httponly=True)
        response.set_cookie('refresh',
                            tokens['refresh'],
                            max_age=api_settings.REFRESH_TOKEN_LIFETIME.total_seconds() if api_settings.REFRESH_TOKEN_LIFETIME else None,
                            # secure=False, // Have to uncomment this line when using HTTPS
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
        return Response({"message": "You are authenticated"}, status=status.HTTP_200_OK)

class MyTokenRefreshView(MyTokenViewBase):
    """
    Takes a refresh type JSON web token and returns an access type JSON web
    token if the refresh token is valid.
    """

    serializer_class = CustomTokenRefreshSerializer