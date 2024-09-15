from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from users.models.users import Users

# Create your tests here.
class TournamentApiViewTest(TestCase):
    def setUp(self: TestCase) -> None:
        # Create a test user
        self.client = APIClient()
        self.user = Users.objects.create_user(username='testuser', password='password')
        self.client.force_authenticate(user=self.user)

    def test_tournament_api(self: TestCase) -> None:
        # Get tournaments list without any tournaments
        self.assertEqual(self.client.get(reverse('tournaments')).status_code, 404)

        # Create a tournament
        ## Create a tournament with 2 players
        self.assertEqual(self.client.post(reverse('tournaments'), {'nb_of_players': 2}, format='json').status_code, 200)
        ## Create a tournament with 4 players
        self.assertEqual(self.client.post(reverse('tournaments'), {'nb_of_players': 4}, format='json').status_code, 200)
        ## Create a tournament with 8 players
        self.assertEqual(self.client.post(reverse('tournaments'), {'nb_of_players': 8}, format='json').status_code, 200)
        ## Create a tournament with 16 players
        self.assertEqual(self.client.post(reverse('tournaments'), {'nb_of_players': 16}, format='json').status_code, 200)
        ## Create a tournament with 7 player
        self.assertEqual(self.client.post(reverse('tournaments'), {'nb_of_players': 7}, format='json').status_code, 400)
        ## Create a tournament without data
        self.assertEqual(self.client.post(reverse('tournaments')).status_code, 400)

        # Get tournaments list with tournaments
        self.assertEqual(self.client.get(reverse('tournaments')).status_code, 200)

