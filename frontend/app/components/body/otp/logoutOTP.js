import { getLanguageDict } from '../../../engine/language.js';
import { registerOTP } from './registerOTP.js';

const logoutOTPRequest = async (password) => {
    if (!password)
        return false;
    const response = await fetch('/api/otp/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({password: password}),
    });
    return response.status === 200;
};

export const logoutOTP = (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const data = getLanguageDict(language, 'otp');

    render(div, `
        <style>
            .button-red {
                color: var(--btn-font-color);
                background-color: #ff0000;
            }
    
            .button-red:hover {
                background-color: #a70000;
                transition: background-color 0.2s;
            }
        </style>
        <input type="password" id="passwordField" class="form-control" placeholder="${data.password}" required>
        <button class="btn button-red w-100" id="logoutOTPButton">${data.removeOTP}</button>
        <div id="secret_code"></div>
    `);

    const logoutOTPButton = document.getElementById('logoutOTPButton');
    logoutOTPButton.addEventListener('click', async () => {
        const password = document.getElementById('passwordField').value;
        if (!await logoutOTPRequest(password))
            return ;
        return await registerOTP(render, div);
    });
};