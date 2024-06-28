from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.shortcuts import redirect, render
from requests_oauthlib import OAuth2Session
from django.contrib import messages
from django.urls import reverse
from .models import Users
from .serializers import UserSerializer

class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        if Users.objects.filter(username=request.data["username"]).exists():
            return Response({"error": "Le nom d'utilisateur existe déjà"}, status=status.HTTP_409_CONFLICT)
        
        user = UserSerializer(data=request.data)
        if not user.is_valid():
            return Response(user.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user.save()
        return Response(user.data, status=status.HTTP_201_CREATED)

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
        return redirect('profile')

def profile_view(request):
    if 'oauth_token' not in request.session:
        messages.error(request, "Vous devez vous connecter pour voir votre profil.")
        return redirect('connexion_api42')

    try:
        api42 = OAuth2Session(settings.API42_UID, token=request.session['oauth_token'])
        donnees_profil = api42.get(f"{settings.API42_BASE_URL}/v2/me").json()
        return render(request, 'profile.html', {'profil': donnees_profil})
    except Exception as e:
        messages.error(request, f"Erreur lors de la récupération des données de profil: {e}")
        return redirect('index')
