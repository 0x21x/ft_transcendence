import { data as enData } from '../../../languages/en/auth.js';
import { data as frData } from '../../../languages/fr/auth.js';
import { loginRequest } from './login.js';

const registerRequest = async (username, password, render, div) => {
    if (!username || !password) {
        return;
    }
    const user = {
        username: username,
        password: password
    };
    const response = await fetch('/api/auth/register/', {
        method: 'POST',
        body: JSON.stringify(user),
        headers: {'Content-Type': 'application/json',}
    });
    if (response.status === 200) {
        return await loginRequest(username, password, render, div);
    }
};

export const register = (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const data = language === 'en' ? enData : frData;


    render(div, `
        <style>
            .registerForm {
                margin-top: 5vh;
            }
            h1 {
              text-align: center;  
            }
        </style>
            <div class="row registerForm">
                <form>
                    <div class="mb-3">
                        <label for="usernameValue" class="form-label">${data.username}</label>
                        <input type="text" class="form-control" id="usernameValue">
                    </div>
                    <div class="mb-3">
                        <label for="passwordValue" class="form-label">${data.password}</label>
                        <input type="password" class="form-control" id="passwordValue">
                    </div>
                </form>
                <div class="col text-center">
                    <button type="button" class="btn button w-100" id="toRegisterButton">${data.register}</button>
                </div>
                <br>
                <div class="col text-center">
                    <button type="button" class="btn button w-100" id="toOAuthRegisterButton">${data.Oregister}</button>
                </div>
            </div>
    `);

    const toRegisterButton = document.getElementById('toRegisterButton');
    const toOAuthRegisterButton = document.getElementById('toOAuthRegisterButton');
    toRegisterButton.addEventListener('click', async () => {
        const username = document.getElementById('usernameValue').value;
        const password = document.getElementById('passwordValue').value;
        await registerRequest(username, password, render, div);
    });
    toOAuthRegisterButton.addEventListener('click', async () => {
        // do AOuth register behavior
    });
};