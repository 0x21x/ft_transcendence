from rest_framework_simplejwt.views import (TokenViewBase,
                                            InvalidToken,
                                            TokenError,
                                            Response,
                                            api_settings,
                                            status)

class MyTokenViewBase(TokenViewBase):
    def post(self: TokenViewBase, request: any) -> Response:
        refresh = request.COOKIES.get('refresh')
        if refresh is None:
            raise InvalidToken('No refresh token found in request')
        serializer = self.get_serializer(data={'refresh': refresh})

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

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

