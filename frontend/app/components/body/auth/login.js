import { data as enData } from '../../../languages/en/auth.js';
import { data as frData } from '../../../languages/fr/auth.js';
import { loginOTP } from '../otp/loginOTP.js';


export const loginRequest = async (username, password, render, div) => {
    if (!username || !password) {
        return;
    }
    const response = await fetch('http://localhost:5002/api/auth/login/', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({username, password}),
    });
    if (response.status === 423)
        return await loginOTP(render, div, username, password);
    if (response.status !== 200)
        return ;
    window.location.href = '/';
};

export const login = (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const data = language === 'en' ? enData : frData;

    render(div, `
    <style>
        .loginForm {
            margin-top: 5vh;
        }
    </style>
        <div class="row loginForm">
            <div class="mb-3">
                <label for="username" class="form-label">${data.username}</label>
                <input type="text" class="form-control" id="usernameValue">
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">${data.password}</label>
                <input type="password" class="form-control" id="passwordValue">
            </div>
            <div class="col text-center">
                <button type="button" class="btn button w-100" id="toLoginButton">${data.login}</button>
            </div>
            <br>
            <div class="col text-center">
                <button type="button" class="btn button w-100" id="toOAuthLoginButton">${data.Ologin}</button>
            </div>
        </div>
    `);

    const toLoginButton = document.getElementById('toLoginButton');
    const toOAuthLoginButton = document.getElementById('toOAuthLoginButton');
    toLoginButton.addEventListener('click', async () => {
        const username = document.getElementById('usernameValue').value;
        const password = document.getElementById('passwordValue').value;
        await loginRequest(username, password, render, div);
    });
    toOAuthLoginButton.addEventListener('click', async () => {
        // do AOuth login behavior
    });
};