from typing import Any, Dict
from django.contrib.auth import get_user_model
from rest_framework import exceptions
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.state import token_backend
from .models import Users


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['id', 'username', 'password', 'avatar', 'otp_enabled']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data: dict) -> Users:   # noqa: ANN101
        user = Users.objects.create(username=validated_data['username'])
        user.set_password(validated_data['password'])
        user.save()
        return user

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    """
    Inherit from `TokenRefreshSerializer` and touch the database
    before re-issuing a new access token and ensure that the user
    exists and is active.
    """

    error_msg = 'No active account found with the given credentials'

    def validate(self: TokenRefreshSerializer, attrs: Dict[str, Any]) -> Dict[str, str]:
        token_payload = token_backend.decode(attrs['refresh'])
        try:
            get_user_model().objects.get(pk=token_payload['user_id'])
        except get_user_model().DoesNotExist:
            raise exceptions.AuthenticationFailed(
                self.error_msg, 'no_active_account'
            )

        return super().validate(attrs)