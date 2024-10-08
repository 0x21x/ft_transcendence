from users.sessions import check_session
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import Token, AuthUser

class NewJWTAuthentication(JWTAuthentication):
    """
    An authentication plugin that authenticates requests through a JSON web
    token provided in a request header.
    """

    def authenticate(self: JWTAuthentication, request: any) -> tuple[AuthUser, Token]: # noqa: F821
        access_token = request.COOKIES.get('access')
        if access_token is None:
            return None

        validated_token = self.get_validated_token(access_token)

        session_token = request.COOKIES.get('session')
        if session_token and not check_session(self.get_user(validated_token), session_token):
            return None

        return self.get_user(validated_token), validated_token