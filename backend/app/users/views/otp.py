import pyotp
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, AuthUser

def get_tokens_for_user(user: AuthUser) -> dict:
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def check_otp(otp: str, user: AuthUser) -> bool:
    totp = pyotp.TOTP(user.otp_secret)
    return totp.verify(otp)

class RegisterOTPView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self:APIView, request: any) -> Response:
        user = authenticate(request, username=request.user.username, password=request.data["password"])
        if user is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if user.otp_secret is not None:
            return Response(status=status.HTTP_409_CONFLICT)
        user.otp_secret = pyotp.random_base32()
        user.otp_enabled = True
        user.save()
        message = {'otp_secret': user.otp_secret}
        return Response(message, status=status.HTTP_201_CREATED)

class LogoutOTPView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self: APIView, request: any) -> Response:
        user = authenticate(request, username=request.user.username, password=request.data["password"])
        if user is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        if not user.otp_enabled:
            return Response(status=status.HTTP_409_CONFLICT)
        user.otp_enabled = False
        user.otp_secret = None
        user.save()
        return Response(status=status.HTTP_200_OK)