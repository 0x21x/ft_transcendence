from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import Token, AuthUser


class NewJWTAuthentication(JWTAuthentication):
    """
    An authentication plugin that authenticates requests through a JSON web
    token provided in a request header.
    """

    def authenticate(self: JWTAuthentication, request: any) -> tuple[AuthUser, Token]: # noqa: F821

        cookie = request.COOKIES.get('access')
        if cookie is None:
            return None

        validated_token = self.get_validated_token(cookie)

        return self.get_user(validated_token), validated_token