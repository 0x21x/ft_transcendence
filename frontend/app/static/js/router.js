import { a, routes } from './routes.mjs';
import { renderBody, renderHeader } from './render.mjs';
import { languageHandler } from './language.mjs';
import { loggedIn } from './tokens.js';
import { themeHandler } from './theme.mjs';
import { updateIcon } from './navbar.js';

const body = document.getElementById('app');
const theme = document.querySelector('input[name=themeSwitcher]');
const language = document.getElementById('languageSwitcher');

const router = async () => {
    const potentialMatches = routes.map(route => ({
            isMatch: location.pathname === route.path,
            route: route,
        }));

    let isMatch = (potentialMatch) => potentialMatch.isMatch;
    if (potentialMatches.find(isMatch) === undefined) {
        isMatch = (potentialMatch) => potentialMatch.route.path === '/error/404';
    }
    if (!loggedIn() && potentialMatches.find(isMatch).route.authorization === a.Logged) {
        isMatch = (potentialMatch) => potentialMatch.route.path === '/welcome';
        history.replaceState({urlPath: '/welcome'}, '', '/welcome');
    }
    let match = potentialMatches.find(isMatch);
    if (match.route.authorization === a.Unlogged && loggedIn()) {
        match = potentialMatches.find(potentialMatch => potentialMatch.route.path === '/');
        history.replaceState({urlPath: '/'}, '', '/');
    }
    await renderHeader();
    await renderBody(body, match);
};


window.addEventListener('popstate', router);

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', e => {
        if (e.target.matches('[data-link]')) {
            e.preventDefault();
            if (e.target.href === location.href)
                return;
            history.pushState({urlPath: e.target.href}, '', e.target.href);
            router();
        }
    });
    if (theme) {
        theme.addEventListener('change', function () {
            themeHandler(document.body, this);
            updateIcon();
            router();
        });
    } if (language) {
        language.addEventListener('change', function() {
            languageHandler(this);
            router();

        });
    }
    router();
});

themeHandler(document.body, theme, true);
languageHandler(language, true);