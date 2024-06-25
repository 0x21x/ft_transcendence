export const login = async (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const url = `languages/${language}/auth.json`;
    const response = await fetch(url);
    const data = await response.json();

    render(div, `
    <style>
        .formTournamentCreation {
            margin-top: 5vh;
        }
    </style>
        <div class="row formTournamentCreation">
            <div class="mb-3">
                <label for="username" class="form-label">${data.username}</label>
                <input type="text" class="form-control" id="username">
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">${data.password}</label>
                <input type="password" class="form-control" id="password">
            </div>
            <div class="col text-center">
                <button type="button" class="btn button w-100" id="toLoginButton">${data.login}</button>
            </div>
        </div>
    `);

    const toLoginButton = document.getElementById('toLoginButton');
    toLoginButton.addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const response = await fetch('http://localhost:5002/api/auth/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username, password}),
        });
        if (response.status === 200) {
            const data = await response.json();
            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);
            console.log('Logged in');
        }
    });
}