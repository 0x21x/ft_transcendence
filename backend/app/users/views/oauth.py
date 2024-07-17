from rest_framework.response import Response
from rest_framework.views import APIView
from .auth import LoginView, RegisterView

### Ajouter les fonctions pour recuperer les prenoms, noms, emails (enlever le commenteaire une fois fait)

class OAuthRegisterView(RegisterView):
    def post(self: APIView, request: any) -> Response:
        """
            :param request: Any
            :return A Response with the user.data

            Register a user:
            Authenticate the user with credentials got from 42api, if user is valid login it
            and get JWT tokens for it and set them in the cookies.
        """
        pass

class OAuthLoginView(LoginView):
    def post(self: APIView, request: any) -> Response:
        """
            :param request: Any
            :return A Response with the user.data with cookies put inside

            Login a user:
            Check if there is already a user with the same username in database,
            if not create a user (Database object), check if the serialized user is valid and then save it.
        """
        pass