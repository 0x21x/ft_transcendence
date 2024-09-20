from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from .models.users import Users

class FriendshipApiViewTest(TestCase):
    def setUp(self: TestCase) -> None:
        # Create a test user
        self.client = APIClient()
        self.user = Users.objects.create_user(username='testuser', password='password')
        self.friends = [Users.objects.create_user(username='testuser%d' % i, password='password') for i in range(3)]
        self.client.force_authenticate(user=self.user)

    def get_friendships(self: TestCase, friendships_status: str | None = None) -> int:
        if friendships_status is not None:
            response = self.client.get(reverse('friendships_with_status', kwargs={'status_of_friendship': friendships_status}))
        else:
            response = self.client.get(reverse('friendships'))
        return response.status_code

    def create_friendship(self: TestCase, friend_username: str) -> int:
        # Make a POST request to the FriendshipApiView
        return self.client.post(reverse('friendships'), {'username': friend_username}, format='json').status_code

    def accept_friendship(self: TestCase, user_who_accept: str, user_to_accept: str) -> int:
        # Make a PATCH request to the FriendshipApiView
        tmp_client = APIClient()
        tmp_client.force_authenticate(user=Users.objects.get(username=user_who_accept))
        response = tmp_client.patch(reverse('friendships'), {'username': user_to_accept, 'action': 'accept'}, format='json')
        return response.status_code

    def delete_friendship(self: TestCase, username: str) -> int:
        # Make a PATCH request to the FriendshipApiView
        return self.client.patch(reverse('friendships'), {'username': username, 'action': 'decline'}, format='json').status_code


    def test_friendships(self: TestCase) -> None:
        self.assertEqual(self.get_friendships(), 404) # Get friends list without any friends

        for friend in self.friends: # Create friends
            self.assertEqual(self.create_friendship(friend.username), 200)
            self.assertEqual(self.get_friendships(), 200)

        self.assertEqual(self.get_friendships('accepted'), 404) # Get friends list with friends accepted
        self.assertEqual(self.get_friendships('pending'), 404) # Get friends list with friends pending

        self.assertEqual(self.create_friendship('nonexistent'), 404) # Create nonexistent
        self.assertEqual(self.create_friendship(self.user.username), 400) # Create self

        for friend in self.friends: # Accept friends
            self.assertEqual(self.accept_friendship(friend.username, self.user.username), 200)
            self.assertEqual(self.get_friendships('accepted'), 200)

        self.assertEqual(self.get_friendships('pending'), 404) # Get friends list with friends pending

        for friend in self.friends: # Delete friends
            self.assertEqual(self.delete_friendship(friend.username), 200)

        self.assertEqual(self.get_friendships(), 404) # Get friends list without any friends

        self.assertEqual(self.delete_friendship(self.user.username), 400) # Delete self
        self.assertEqual(self.delete_friendship('nonexistent'), 404) # Delete nonexistent

        for friend in self.friends: # Delete friends already deleted
            self.assertEqual(self.delete_friendship(friend.username), 404)

