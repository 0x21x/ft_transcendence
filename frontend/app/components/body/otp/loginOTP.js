import { data as enData } from '../../../languages/en/otp.js';
import { data as frData } from '../../../languages/fr/otp.js';

const loginOTPRequest = async (otp, username, password) => {
    if (!otp)
        return false;
    const response = await fetch('/api/auth/login/', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({otp, username, password}),
    });
    return response.status === 200;
};

export const loginOTP = (render, div, username, password) => {
    const language = localStorage.getItem('language') || 'en';
    const data = language === 'en' ? enData : frData;

    render(div, `
        <style>
            .loginOTPForm {
                margin-top: 5vh;
            }
        </style>
        <div class="row loginOTPForm">
            <div class="mb-3">
                <label for="otp" class="form-label">${data.enterOTP}</label>
                <input type="text" class="form-control" id="otpValue">
            </div>
            <div class="col text-center">
                <button type="button" class="btn button w-100" id="toOAuthLoginButton">${data.login}</button>
            </div>
        </div>
    `);

    const toOAuthLoginButton = document.getElementById('toOAuthLoginButton');
    toOAuthLoginButton.addEventListener('click', async () => {
        const otp = document.getElementById('otpValue').value;
        if (!await loginOTPRequest(otp, username, password, render, div))
            return await loginOTP(render, div, username, password);
        window.location.href = '/';
    });
};