from rest_framework import serializers
from .models import Users

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data: dict) -> Users:   # noqa: ANN101
        user = Users.objects.create(username=validated_data['username'])
        user.set_password(validated_data['password'])
        user.save()
        return user