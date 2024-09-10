from typing import Optional
from django.db.models import Q
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.models.friendships import Friends
from users.models.users import Users
from users.serializers import FriendshipsSerializer

def get_attribute(data: Optional[dict], attribute: str) -> Optional[str]:
    try:
        return data[attribute]
    except KeyError:
        return None

def get_friendship(user: Users, friend: Users) -> Optional[Friends]:
    """
    Return the friendship between `user` and `friend` if it exists.

    If no friendship exists, returns `None`.
    """
    return Friends.objects.select_related('user', 'friend').filter((Q(user=user) & Q(friend=friend)) | (Q(user=friend) & Q(friend=user))).first()

def get_all_friends(username: str, status_of_friendship: Optional[str] = None) -> Optional[Friends]:
    """
    Return all friendships for a given user.

    If `status_of_friendship` is provided, only return friendships with the given status.
    """
    if status_of_friendship is None:
        return Friends.objects.select_related('user', 'friend').filter(Q(user__username=username) | Q(friend__username=username))
    if status_of_friendship not in ['requested', 'pending', 'accepted', 'notifications']:
        return None
    if status_of_friendship == 'notifications':
        return Friends.objects.select_related('user', 'friend').filter(friend__username=username, seen_by_friend=False, status='pending')
    elif status_of_friendship == 'pending':
        friendships = Friends.objects.select_related('user', 'friend').filter(friend__username=username, status='pending')
        if not friendships:
            return None
        friendships.filter(seen_by_friend=False).update(seen_by_friend=True)
        return friendships
    elif status_of_friendship == 'requested':
        return Friends.objects.select_related('user', 'friend').filter(user__username=username, status='pending')
    return Friends.objects.select_related('user', 'friend').filter((Q(user__username=username) | Q(friend__username=username)) & Q(status='accepted'))

class FriendshipsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self: APIView, request: any, status_of_friendship: Optional[str] = None) -> Response:
        """
        Return all friendships for the given user.

        If `status_of_friendship` is provided, only return friendships with the given status.
        """

        if status_of_friendship and status_of_friendship not in ['pending', 'accepted', 'requested', 'notifications']:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        friends = get_all_friends(request.user.username, status_of_friendship)
        if not friends:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = FriendshipsSerializer(friends, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self: APIView, request: any) -> Response:
        """
        Create a new friendship between the current user and another user.

        If the user is trying to create a friendship with him[;[;[;[;[;self, return a
        400 error. If the friendship already exists, return a 409 error.
        Otherwise, create the friendship and return a 200 response.
        """
        if not get_attribute(request.data, 'username') or request.data['username'] == request.user.username:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        user = Users.objects.filter(username=request.user.username).first()
        friend = Users.objects.filter(username=request.data['username']).first()
        if not user or not friend:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if get_friendship(user, friend):
            return Response(status=status.HTTP_409_CONFLICT)
        Friends.objects.create(user=user, friend=friend)
        return Response(status=status.HTTP_200_OK)

    def patch(self: APIView, request: any) -> Response:
        """
        Accept or decline a friendship.

        If the user is trying to accept or decline a friendship with himself, return a
        400 error. If the friendship does not exist, return a 404 error.
        Otherwise, accept or decline the friendship and return a 200 response.
        """
        action = get_attribute(request.data, 'action')
        other_username = get_attribute(request.data, 'username')
        if not other_username or request.user.username == other_username or action not in ['accept', 'decline']:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        user = Users.objects.filter(username=request.user.username).first()
        friend = Users.objects.filter(username=other_username).first()
        action = request.data['action']
        if not user or not friend:
            return Response(status=status.HTTP_404_NOT_FOUND)
        friendship = get_friendship(user, friend)
        if not friendship:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if action == 'accept' and friendship.status == 'pending' and friend.username != request.user.username:
            if not friendship.seen_by_friend:
                friendship.seen_by_friend = True
            friendship.status = 'accepted'
            friendship.save()
        elif action == 'decline':
            friendship.delete()
        return Response(status=status.HTTP_200_OK)
