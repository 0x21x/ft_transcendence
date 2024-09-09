from pathlib import Path
from django.http import FileResponse
from django.contrib.auth import login
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.settings import api_settings
from .auth import get_tokens_for_user
from users.models.users import Users
from ..serializers import UserSerializer, GetUserInfoSerializer


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
        login(request, instance)
        message = {'username': user.validated_data['username']}
        response = Response(message, status=status.HTTP_200_OK)
        token = get_tokens_for_user(instance)
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.set_cookie('access',
                            token['access'],
                            max_age=api_settings.ACCESS_TOKEN_LIFETIME.total_seconds() if api_settings.ACCESS_TOKEN_LIFETIME else None,
                            samesite='Lax',
                            secure=True,
                            httponly=True)
        response.set_cookie('refresh',
                            token['refresh'],
                            max_age=api_settings.REFRESH_TOKEN_LIFETIME.total_seconds() if api_settings.REFRESH_TOKEN_LIFETIME else None,
                            samesite='Lax',
                            secure=True,
                            httponly=True)
        return response

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

    def get(self:APIView, request: any, username: str) -> FileResponse | Response:
        path = Path(__file__).resolve().parent.parent.parent / 'avatars' / username
        try:
            img = open(path, 'rb')
            response = FileResponse(img, status=status.HTTP_200_OK)
            return response
        except IOError:
            return Response(status=status.HTTP_404_NOT_FOUND)

class GetUserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self:APIView, request: any, username: str) -> Response:
        try:
            instance = Users.objects.get(username=username)
        except Users.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        user = GetUserInfoSerializer(instance, context={'request': request})
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