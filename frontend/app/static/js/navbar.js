import { loggedIn } from './tokens.js';
import { render } from './render.mjs';

export const updateIcon = () => {
    const icon = document.getElementById('themeIcon');
    const theme = localStorage.getItem('theme') || 'light';

    icon.textContent = theme === 'light' ? 'light_mode' : 'dark_mode';
};

const loggedNavbarRender = () => {
    const navbar = document.getElementById('navbar');
    const theme = localStorage.getItem('theme') || 'light';

    const icon = theme === 'light' ? 'light_mode' : 'dark_mode';

    render(navbar, `
        <style>
            .navbar {
                background-color: var(--bg-color);
            }
            .checkbox input{
                display: none;
            }
            .material-symbols-outlined {
                color: var(--font-color);
                font-variation-settings:
                'FILL' 0,
                'wght' 500,
                'GRAD' 0,
                'opsz' 40
            }   
            .button-primary {
                color: var(--font-color);
                background-color: var(--btn-bg-hover-color);
            }
            .button-primary:hover {
                background-color: var(--btn-bg-color);
                transition: background-color 0.2s;
            }
            .checkbox , .languageSwitcher {
                margin-left: 5px;
            }
            select[id="languageSwitcher"] {
                background-color: var(--bg-color);
                border: none;
                color: var(--bg-color);
                font-size: 1.5rem;
            }
            .logoAsText {
                font-size: 1.5rem;
            }
            
        </style>
        <nav class="navbar navbar-expand-lg px-0 py-3">
            <div class="container-xl">
                <a class="nav-link nav-item active logoAsText" href="/" data-link>
                    ft_transcendence
                </a
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarCollapse">
                    <div class="navbar-nav mx-lg-auto">
                        <a class="nav-link nav-item active" href="/" id="home" data-link></a>
                        <a class="nav-link nav-item" href="/game" id="game" data-link></a>
                        <a class="nav-link nav-item" href="/history" id="history" data-link></a>
                        <a class="nav-link nav-item" href="/tournament" id="tournament" data-link></a>
                    </div>
                    <span class="nav-link nav-item" id="username">User</span>                     
                    <div class="checkbox">
                        <input type="checkbox" name="themeSwitcher" id="themeSwitcher"/>
                        <label for="themeSwitcher">
                            <span class="material-symbols-outlined" id="themeIcon">${icon}</span>
                        </label>
                    </div>
                    <div class="languageSwitcher">
                        <select data-width="fit" id="languageSwitcher">
                            <option id="en">🇬🇧</option>
                            <option id="fr">🇫🇷</option>
                        </select>
                    </div>
                </div>
            </div>
        </nav>
    `);

    // const username = document.getElementById('username');

};

const notLoggedNavbarRender = () => {
    const navbar = document.getElementById('navbar');
    const theme = localStorage.getItem('theme') || 'light';

    const icon = theme === 'light' ? 'light_mode' : 'dark_mode';

    render(navbar, `
        <style>
            .navbar {
                background-color: var(--bg-color);
            }
            .checkbox input{
                display: none;
            }    
            .material-symbols-outlined {
                color: var(--font-color);
                font-variation-settings:
                'FILL' 0,
                'wght' 500,
                'GRAD' 0,
                'opsz' 40
            }   
            .button-primary {
                color: var(--font-color);
                background-color: var(--btn-bg-hover-color);
            }
            .button-primary:hover {
                background-color: var(--btn-bg-color);
                transition: background-color 0.2s;
            }
            .checkbox , .languageSwitcher {
                margin-left: 5px;
            }
            select[id="languageSwitcher"] {
                background-color: var(--bg-color);
                border: none;
                color: var(--bg-color);
                font-size: 1.5rem;
            }
            .logoAsText {
                font-size: 1.5rem;
            }
        </style>
        <nav class="navbar navbar-expand-lg px-0 py-3">
            <div class="container-xl">
                <a class="nav-link nav-item active logoAsText" href="/" data-link>
                    ft_transcendence
                </a
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarCollapse">
                    <div class="navbar-nav mx-lg-auto"></div>
                    <div class="navbar-nav ms-lg-4">
                     <a class="nav-link" href="/login" id="login" data-link></a>
                    </div>
                    <div class="d-flex align-items-lg-center mt-3 mt-lg-0">
                        <a class="btn button-primary btn-sm" href="/register" id="register" data-link></a>
                    </div>
                    <div class="checkbox">
                        <input type="checkbox" name="themeSwitcher" id="themeSwitcher"/>
                        <label for="themeSwitcher">
                            <span class="material-symbols-outlined" id="themeIcon">${icon}</span>
                        </label>
                    </div>
                    <div class="languageSwitcher">
                        <select data-width="fit" id="languageSwitcher">
                            <option id="en">🇬🇧</option>
                            <option id="fr">🇫🇷</option>
                        </select>
                    </div>
                </div>
            </div>
        </nav>
    `);
};

const navbarRender = () => {
    const logged = loggedIn();

    if (logged) { loggedNavbarRender(); }
    else { notLoggedNavbarRender(); }
};

navbarRender();
