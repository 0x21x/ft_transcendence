import { createTournament } from '../components/body/createTournament.js';
import { error } from '../components/body/error.js';
import { friends } from '../components/body/friends.js';
import { game } from '../components/body/game.js';
import { gameHandler } from '../components/body/gameHandler.js';
import { history } from '../components/body/history.js';
import { home } from '../components/body/home.js';
import { login } from '../components/body/auth/login.js';
import { profile } from '../components/body/profile.js';
import { register } from '../components/body/auth/register.js';
import { render } from './render.js';
import { tournament } from '../components/body/tournament.js';
import { tournamentView } from '../components/body/tournamentView.js';
import { user } from '../components/body/user.js';
import { welcome } from '../components/body/welcome.js';

export const a = Object.freeze({
    'Everyone': 1,
    'Logged': 2,
    'Unlogged': 3,
    'Admin': 4
});


export const address = `wss://${window.location.host}/ws`;

export const routes = [
    { path: '/', view: (app, args) => home(render, app, args), authorization: a.Logged, name: 'home'},
    { path: '/games/', view: (app, args) => gameHandler(render, app, args), authorization: a.Logged, name: 'games' },
    { path: '/games/*/', view: (app, args) => game(render, app, args), authorization: a.Logged, name: 'game' },
    { path: '/history/', view: (app, args) => history(render, app, args), authorization: a.Logged, name: 'history' },
    { path: '/tournament/', view: (app, args) => tournament(render, app, args), authorization: a.Logged, name: 'tournament' },
    { path: '/tournament/*/', view: (app, args) => tournamentView(render, app, args), authorization: a.Logged, name: 'tournamentView' },
    { path: '/create_tournament/', view: (app, args) => createTournament(render, app, args), authorization: a.Logged, name: 'create_tournament' },
    { path: '/register/', view: (app, args) => register(render, app, args), authorization: a.Unlogged, name: 'register' },
    { path: '/login/', view: (app, args) => login(render, app, args), authorization: a.Unlogged, name: 'login' },
    { path: '/profile/', view: (app, args) => profile(render, app, args), authorization: a.Logged, name: 'profile' },
    { path: '/friends/', view: (app, args) => friends(render, app, args), authorization: a.Logged, name: 'friends' },
    { path: '/user/*/', view: (app, args) => user(render, app, args), authorization: a.Logged, name: 'user' },
    { path: '/welcome/', view: (app, args) => welcome(render, app, args), authorization: a.Unlogged, name: 'welcome'},
    { path: '/error/404/', view: (app) => error(render, app, '404'), authorization: a.Everyone, name: 'error'}
    ];

export const wsRoutes = [
    { path: '*', wsPath: address + '/status/', pageOnly: false, name: 'status' },
    { path: '/games/', wsPath: address + '/games/', pageOnly: true, name: 'games' },
    { path: '/games/*', wsPath: address + '/games/*/', pageOnly: true, name: 'game' }
    ];