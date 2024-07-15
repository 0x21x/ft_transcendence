import { a, routes } from './routes.mjs';
import { navbarRender, updateIcon } from './navbar.js';
import { renderBody, renderHeader } from './render.mjs';
import { languageHandler } from './language.mjs';
import { loggedIn } from './tokens.js';
import { themeHandler } from './theme.mjs';

let logged = await loggedIn();
const body = document.getElementById('app');

const getAllFolders = (path) => {
    const folders = path.split('/');
    return folders.filter(folder => folder !== '');
};

const getPathArgs = (actualPath, routePath) => {
    const routeFolders = getAllFolders(routePath);
    if (routeFolders.length === routeFolders.filter(folder => folder !== '*').length)
        return [];

    const args = [];
    const actualFolders = getAllFolders(actualPath);
    for (let i = 0; routeFolders[i]; i++) {
        if (routeFolders[i] === '*')
            args.push(actualFolders[i]);
    }
    return args;
};

const isAMatch = (actualPath, routePath) => {
    const routeFolders = getAllFolders(routePath);
    if (routeFolders.length === routeFolders.filter(folder => folder !== '*').length)
        return actualPath === routePath;

    const actualFolders = getAllFolders(actualPath);

    for (let i = 0; routeFolders[i] && actualFolders[i]; i++) {
        if (routeFolders[i] !== '*' && actualFolders[i] !== routeFolders[i])
            return false;
    }
    return routeFolders.length === actualFolders.length;
};

export const router = async (logged) => {
    const potentialMatches = routes.map(route => ({
            isMatch: isAMatch(location.pathname, route.path),
            args: getPathArgs(location.pathname, route.path),
            route: route,
        }));

    let isMatch = (potentialMatch) => potentialMatch.isMatch;
    if (potentialMatches.find(isMatch) === undefined) {
        isMatch = (potentialMatch) => potentialMatch.route.path === '/error/404';
    }
    if (!logged && potentialMatches.find(isMatch).route.authorization === a.Logged) {
        isMatch = (potentialMatch) => potentialMatch.route.path === '/welcome';
        history.replaceState({urlPath: '/welcome'}, '', '/welcome');
    }
    let match = potentialMatches.find(isMatch);
    if (match.route.authorization === a.Unlogged && logged) {
        match = potentialMatches.find(potentialMatch => potentialMatch.route.path === '/');
        history.replaceState({urlPath: '/'}, '', '/');
    }
    await renderHeader();
    await renderBody(body, match);
};


window.addEventListener('popstate', async () => {
    logged = await loggedIn();
    await router(logged);
    await navbarRender(logged);
});

document.addEventListener('click', async e => {
    if (e.target.matches('[data-link]')) {
        e.preventDefault();
        if (await loggedIn() !== logged) {
            logged = !logged;
            await navbarRender(logged);
        }
        if (e.target.href === location.href)
            return;
        history.pushState({urlPath: e.target.href}, '', e.target.href);
        await router(logged);
    }
});

if (document.getElementById('navbar').innerHTML === '') {
    await navbarRender(logged);
} if (body.innerHTML === '') {
    await router(logged);
}

const theme = document.querySelector('input[name=themeSwitcher]');
const language = document.getElementById('languageSwitcher');

if (theme) {
    theme.addEventListener('change', () =>{
        themeHandler(document.body, theme);
        updateIcon();
    });
} if (language) {
    language.addEventListener('change', async () =>{
        languageHandler(language);
        await router(logged);
    });
}

themeHandler(document.body, theme, true);
languageHandler(language, true);