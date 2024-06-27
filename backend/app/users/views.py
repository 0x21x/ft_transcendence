from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.shortcuts import redirect
from requests_oauthlib import OAuth2Session
from .models import Users
from .serlializers import UserSerializer

class RegisterView(APIView):
    permission_classes = []

    def post(self: APIView, request: any) -> Response:
        if Users.objects.filter(username=request.data["username"]).exists():
            return Response({"Username already exists"}, status=status.HTTP_409_CONFLICT)
        user = UserSerializer(data=request.data)
        if not user.is_valid():
            return Response(status=status.HTTP_400_BAD_REQUEST)
        user.save()
        return Response(user.data, status=status.HTTP_201_CREATED)

class VerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self: APIView, request: any) -> Response:
        return Response({"message": "You are authenticated"}, status=status.HTTP_200_OK)

class Auth42View(APIView):
    permission_classes = []
    def get(self: APIView, request: any):
        api42 = OAuth2Session(settings.API42_UID, redirect_uri=settings.API42_REDIRECT_URI)
        url_autorisation, state = api42.authorization_url(f"{settings.API42_BASE_URL}/oauth/authorize")
        request.session['oauth_state'] = state
        return redirect(url_autorisation)

class Callback42View(APIView):
    permission_classes = []
    def get(self: APIView, request: any):
        if 'oauth_state' not in request.session:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        api42 = OAuth2Session(settings.API42_UID, state=request.session['oauth_state'], redirect_uri=settings.API42_REDIRECT_URI)
        token = api42.fetch_token(
            f"{settings.API42_BASE_URL}/oauth/token",
            client_secret=settings.API42_SECRET,
            authorization_response=request.get_full_path()
        )
        request.session['oauth_token'] = token
        return Response({"message": "You are authenticated", "token": token}, status=status.HTTP_200_OK)
    