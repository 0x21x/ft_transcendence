from uuid import uuid4
from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from users.models.users import Users
from ..models import Tournament

# Create your tests here.
class TournamentApiViewTest(TestCase):
    def setUp(self: TestCase) -> None:
        # Create a test user
        self.client = APIClient()
        self.user = Users.objects.create_user(username='testuser', password='password')
        self.client.force_authenticate(user=self.user)

    def try_join_or_leave_row_api(self: TestCase) -> None:
        # Join / leave a tournament
        tournament = self.client.get(reverse('tournaments')).json()[0]
        ## Re-join a tournament
        self.assertEqual(
            self.client.put(reverse('tournament', kwargs={'tournament_name': tournament['name']}), {'action': 'join'},
                            format='json').status_code, 409)
        ## Leave a tournament
        self.assertEqual(
            self.client.put(reverse('tournament', kwargs={'tournament_name': tournament['name']}), {'action': 'leave'},
                            format='json').status_code, 404)

        players_clients = []
        for user_number in range(3):
            user = Users.objects.create_user(username=f'testuser{user_number}', password='password')
            new_client = APIClient()
            new_client.force_authenticate(user=user)
            players_clients.append(new_client)
        tournament = self.client.get(reverse('tournaments')).json()[0]

        ## Join and leave a tournament
        for player_client in players_clients[:-1]:
            ## Join a tournament
            self.assertEqual(
                player_client.put(reverse('tournament', kwargs={'tournament_name': tournament['name']}),
                                  {'action': 'join'},
                                  format='json').status_code, 200)
        for player_client in players_clients[:-1]:
            ## Leave a tournament
            self.assertEqual(
                player_client.put(reverse('tournament', kwargs={'tournament_name': tournament['name']}),
                                  {'action': 'leave'},
                                  format='json').status_code, 200)

        for player_client in players_clients:
            ## Join a tournament
            self.assertEqual(
                player_client.put(reverse('tournament', kwargs={'tournament_name': tournament['name']}),
                                  {'action': 'join'},
                                  format='json').status_code, 200)

        ## Try to join a tournament in progress (full)
        self.assertEqual(
            players_clients[0].put(reverse('tournament', kwargs={'tournament_name': tournament['name']}),
                                  {'action': 'join'},
                                  format='json').status_code, 400)

        ## Try to leave a tournament in progress (full)
        self.assertEqual(
            players_clients[0].put(reverse('tournament', kwargs={'tournament_name': tournament['name']}),
                                  {'action': 'leave'},
                                  format='json').status_code, 400)

    def try_get_post_tournament_api(self: TestCase) -> None:
        # Get tournaments list without any tournaments
        self.assertEqual(self.client.get(reverse('tournaments')).status_code, 404)

        # Create a tournament
        ## Create a tournament with 2 players
        self.assertEqual(self.client.post(reverse('tournaments'), {'nb_of_players': 2, 'tournament_name': f'test${str(uuid4())[:-4]}'}, format='json').status_code, 200)
        ## Create a tournament with 4 players
        self.assertEqual(self.client.post(reverse('tournaments'), {'nb_of_players': 4, 'tournament_name': f'test${str(uuid4())[:-4]}'}, format='json').status_code, 200)
        ## Create a tournament with 8 players
        self.assertEqual(self.client.post(reverse('tournaments'), {'nb_of_players': 8, 'tournament_name': f'test${str(uuid4())[:-4]}'}, format='json').status_code, 200)
        ## Create a tournament with 16 players
        self.assertEqual(self.client.post(reverse('tournaments'), {'nb_of_players': 16, 'tournament_name': f'test${str(uuid4())[:-4]}'}, format='json').status_code,
                         200)
        ## Create a tournament with 7 player
        self.assertEqual(self.client.post(reverse('tournaments'), {'nb_of_players': 7, 'tournament_name': f'test${str(uuid4())[:-4]}'}, format='json').status_code, 400)
        ## Create a tournament without data
        self.assertEqual(self.client.post(reverse('tournaments')).status_code, 400)

        # Get tournaments list with tournaments
        self.assertEqual(self.client.get(reverse('tournaments')).status_code, 200)

    def try_row_calculation_after_filling(self: TestCase) -> None:
        serialized_tournament = self.client.post(reverse('tournaments'), {'nb_of_players': 8, 'tournament_name': f'test${str(uuid4())[:-4]}'}, format='json').json()
        tournament_name = serialized_tournament['name']
        tournament = Tournament.objects.get(name=tournament_name)
        # Check if the tournament is created
        self.assertEqual(tournament.status, 'waiting')
        # Check if the rows are created with good values
        self.assertEqual(tournament.rows.first().level, 1)
        self.assertEqual(tournament.rows.first().nb_players, 8)
        self.assertEqual(tournament.rows.first().status, 'waiting')
        self.assertEqual(tournament.rows.first().games.count(), 0)
        self.assertEqual(tournament.rows.first().players.count(), 1)

        players_clients = []
        for player_id in range(7):
            user = Users.objects.create_user(username=f'testuser_{player_id}', password='password')
            new_client = APIClient()
            new_client.force_authenticate(user=user)
            players_clients.append(new_client)

        # Join 7 players
        for player_id, player_client in enumerate(players_clients, start=2):
            # Check if the row status is waiting until all players are joined
            self.assertEqual(tournament.rows.first().status, 'waiting')
            # Join a player
            response = player_client.put(reverse('tournament', kwargs={'tournament_name': tournament_name}),
                                         {'action': 'join'}, format='json')
            serialized_tournament = response.json()
            self.assertEqual(response.status_code, 200)
            # Check if the player correctly added to the row
            self.assertEqual(tournament.rows.first().players.count(), player_id)

        # Check once the row is fulled if the status is in_progres
        self.assertEqual(tournament.rows.first().status, 'in_progress')
        self.assertEqual(serialized_tournament['status'], 'in_progress')
        tournament = Tournament.objects.get(name=tournament_name)
        self.assertEqual(tournament.status, 'in_progress')

        # Check if the games are created with the good values
        self.assertEqual(tournament.rows.first().games.count(), tournament.nb_of_players // 2)
        for game in tournament.rows.first().games.all():
            self.assertEqual(game.status, 'waiting')
            self.assertEqual(game.tournament_name, tournament_name)
            self.assertEqual(game.players.count(), 2)

    def test_tournament_api(self: TestCase) -> None:
        self.try_get_post_tournament_api()
        self.try_join_or_leave_row_api()
        self.try_row_calculation_after_filling()
