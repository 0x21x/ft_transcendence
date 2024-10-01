import { languageHandler } from './language.js';
import { loggedIn } from './tokens.js';
import { navbarRender } from './navbar.js';
import { renderHeader } from './render.js';
import { router } from './router.js';


export const truncate = (text, length) => {
    if (text === undefined)
        return '';
    if (text.length <= length)
        return text;
    return text.slice(0, length - 2) + '..';
};

export const popBack = async () => {
    history.back();
    return router(await loggedIn());
};

export const redirect = async (url) => {
    history.pushState(null, null, url);
    return await router(await loggedIn());
};

export const reload = async (withNavBar=false) => {
    const logged = await loggedIn();
    // if (withNavBar) {
    //     await navbarRender(logged);
    // }
    await router(logged);
};

export const navbarReload = async () => {
    await navbarRender(await loggedIn());
    renderHeader();
};

export const getAllFolders = (path) => {
    if (path.split('/').length - 1 <= 1)
        return [path];
    const folders = path.split('/');
    return folders.filter(folder => folder !== '');
};

export const getPathArgs = (actualPath, routePath) => {
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

const addSlash = (path) => {
    if (path.length < 1)
        return path;
    if (path[path.length - 1] !== '/')
        return path + '/';
    return path;
};

export const isAMatch = (actualPath, routePath) => {
    actualPath = addSlash(actualPath);
    const routeFolders = getAllFolders(routePath);
    if (routeFolders.length === routeFolders.filter(folder => folder === '*').length)
        return true;
    if (routeFolders.length === routeFolders.filter(folder => folder !== '*').length)
        return actualPath === routePath;

    const actualFolders = getAllFolders(actualPath);

    for (let i = 0; routeFolders[i] && actualFolders[i]; i++) {
        if (routeFolders[i] !== '*' && actualFolders[i] !== routeFolders[i])
            return false;
    }
    return routeFolders.length === actualFolders.length;
};

export const replaceWildcard = (path, args) => {
    const routeFolders = getAllFolders(path);
    for (let i = 0; routeFolders[i]; i++) {
        if (routeFolders[i] === '*')
            routeFolders[i] = args.shift();
    }
    return routeFolders.join('/') + '/';
};