import { loggedNavbar }  from '../components/header/logged.js';
import { notLoggedNavbar } from '../components/header/notLogged.js';
import { render } from './render.mjs';

export const updateIcon = () => {
    const icon = document.getElementById('themeIcon');
    const theme = localStorage.getItem('theme') || 'light';

    icon.textContent = theme === 'light' ? 'light_mode' : 'dark_mode';
};

export const navbarRender = async (logged) => {
    const navbar = document.getElementById('navbar');
    if (logged) { await loggedNavbar(render, navbar); }
    else { notLoggedNavbar(render, navbar); }
};