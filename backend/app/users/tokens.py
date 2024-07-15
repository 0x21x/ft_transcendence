from rest_framework_simplejwt.views import (TokenViewBase,
                                            InvalidToken,
                                            Response,
                                            api_settings,
                                            status)

class MyTokenViewBase(TokenViewBase):
    def post(self: TokenViewBase, request: any) -> Response:
        refresh = request.COOKIES.get('refresh')
        if refresh is None:
            raise InvalidToken('No refresh token found in request')

        serializer = self.get_serializer(data={'refresh': refresh})

        if not serializer.is_valid():
            response = Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
            response.delete_cookie('refresh')
            response.delete_cookie('access')
            return response

        response = Response(serializer.validated_data, status=status.HTTP_200_OK)
        if api_settings.ACCESS_TOKEN_LIFETIME is not None:
            response.set_cookie('access',
                                serializer.validated_data['access'],
                                max_age=api_settings.ACCESS_TOKEN_LIFETIME.total_seconds(),
                                httponly=True)
        else:
            response.set_cookie('access',
                            serializer.validated_data['access'],
                            httponly=True)
        return response