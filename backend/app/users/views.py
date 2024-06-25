from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
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
        return Response(user.data, status=status.HTTP_200_OK)

class VerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self: APIView, request: any) -> Response:
        # user = request.user
        # serializer = UserSerializer(user, many=False)
        # return Response(serializer.data)
        return Response({"message": "You are authenticated"}, status=status.HTTP_200_OK)