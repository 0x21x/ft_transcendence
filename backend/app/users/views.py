from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.shortcuts import redirect
from requests_oauthlib import OAuth2Session
from .models import Users
from .serializers import UserSerializer

class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        if Users.objects.filter(username=request.data["username"]).exists():
            return Response({"error": "Le nom d'utilisateur existe déjà"}, status=status.HTTP_409_CONFLICT)
        
        user_serializer = UserSerializer(data=request.data)
        if not user_serializer.is_valid():
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user_serializer.save()
        return Response(user_serializer.data, status=status.HTTP_201_CREATED)

class VerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "Vous êtes authentifié"}, status=status.HTTP_200_OK)

class Auth42View(APIView):
    permission_classes = []

    def get(self, request):
        api42 = OAuth2Session(settings.API42_UID, redirect_uri=settings.API42_REDIRECT_URI)
        authorization_url, state = api42.authorization_url(f"{settings.API42_BASE_URL}/oauth/authorize")
        request.session['oauth_state'] = state
        return redirect(authorization_url)

class Callback42View(APIView):
    permission_classes = []

    def get(self, request):
        if 'oauth_state' not in request.session:
            return Response({"error": "État OAuth manquant dans la session"}, status=status.HTTP_400_BAD_REQUEST)

        api42 = OAuth2Session(settings.API42_UID, state=request.session['oauth_state'], redirect_uri=settings.API42_REDIRECT_URI)
        try:
            token = api42.fetch_token(
                f"{settings.API42_BASE_URL}/oauth/token",
                client_secret=settings.API42_SECRET,
                authorization_response=request.get_full_path()
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        request.session['oauth_token'] = token
        return Response({"message": "Vous êtes authentifié", "token": token}, status=status.HTTP_200_OK)
