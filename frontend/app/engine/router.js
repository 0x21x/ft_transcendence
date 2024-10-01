import { a, routes } from './routes.js';
import { getPathArgs, isAMatch } from './utils.js';
import { navbarRender, updateIcon } from './navbar.js';
import { renderBody, renderHeader } from './render.js';
import { WebSocketHandler} from './websockets.js';
import { languageHandler } from './language.js';
import { loaded } from './loader.js';
import { loggedIn } from './tokens.js';
import { themeHandler } from './theme.js';

const body = document.getElementById('app');
export const websocketsHandler = new WebSocketHandler();
let logged = await loggedIn();
let theme;
let language;

export const router = async (logged) => {
    const potentialMatches = routes.map(route => ({
            isMatch: isAMatch(location.pathname, route.path),
            args: getPathArgs(location.pathname, route.path),
            route: route,
        }));

    let isMatch = (potentialMatch) => potentialMatch.isMatch;
    if (potentialMatches.find(isMatch) === undefined) {
        isMatch = (potentialMatch) => potentialMatch.route.path === '/error/404/';
    }
    if (!logged && potentialMatches.find(isMatch).route.authorization === a.Logged) {
        isMatch = (potentialMatch) => potentialMatch.route.path === '/welcome/';
        history.replaceState({urlPath: '/welcome/'}, '', '/welcome/');
    }
    let match = potentialMatches.find(isMatch);
    if (match.route.authorization === a.Unlogged && logged) {
        match = potentialMatches.find(potentialMatch => potentialMatch.route.path === '/');
        history.replaceState({urlPath: '/'}, '', '/');
    }
    websocketsHandler.check(match);
    await renderHeader();
    await renderBody(body, match);
    theme = document.querySelector('input[name=themeSwitcher]');
    language = document.getElementById('languageSwitcher');

    if (theme) {
        theme.addEventListener('change', () =>{
            themeHandler(document.body, theme);
            updateIcon();
        });
    } if (language) {
        language.addEventListener('change', async () =>{
            languageHandler(language);
            return await router(logged);
        });
    }
};

window.addEventListener('popstate', async () => {
    logged = await loggedIn();
    await navbarRender(logged);
    await router(logged);
});

document.addEventListener('click', async e => {
    if (e.target.matches('[data-link]')) {
        if (e.target.tagName === 'IMG') {
            e.target.href = e.target.parentElement.getAttribute('href');
        }
        e.preventDefault();
        if (await loggedIn() !== logged) {
            logged = !logged;
            websocketsHandler.openWs('status', true);
            await navbarRender(logged);
        }
        if (e.target.href === location.href)
            return;
        history.pushState({urlPath: e.target.href}, '', e.target.href);
        return await router(logged);
    }
});

if (document.getElementById('navbar').innerHTML === '') {
    await navbarRender(logged);
    loaded();
} if (body.innerHTML === '') {
    await router(logged);
    loaded();
}

themeHandler(document.body, theme, true);
languageHandler(language, true);