export const loggedNavbar = (render, div) => {
    const theme = localStorage.getItem('theme') || 'light';
    const icon = theme === 'light' ? 'light_mode' : 'dark_mode';

    render(div, `
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
                    <buttun class="btn button" id="logoutButton">Logout</buttun>
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

    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', async () => {
        const response = await fetch('http://localhost:5002/api/auth/logout/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.status !== 200) {
            return ;
        }
        window.location.href = '/';
    });

};