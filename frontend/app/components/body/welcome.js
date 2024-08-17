import { data as enData } from '../../languages/en/welcome.js';
import { data as frData } from '../../languages/fr/welcome.js';
import { login } from './auth/login.js';
import { register } from './auth/register.js';

export const welcome = async (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const data = language === 'en' ? enData : frData;

    render(div, `
        <style>
            .container-fluid {
                width: 80vw;
                margin-top: 20vh;
            }
            .row ,  .col-md-6{
                padding-top: 1vh;
            }
            h1 {
                text-align: center;
            }
            .btn-toggle {
                color : white;
            }
            
        </style>
        <div class="container-fluid">
            
            <div class="row">
                <div class="col-md-6 text-center">
                    <h1>${data.welcome}</h1>
                </div>
                <div class="col-md-6 auth">
                    <div class="row">
                        <div class="btn-group btn-toggle loginRegisterButtonGroup">
                            <button class="btn button-primary" id="loginButton">${data.login}</button>
                            <button class="btn button" id="registerButton">${data.register}</button>
                        </div>
                        <div class="loginRegister"></div>
                    </div>
                </div>
            </div>
        </div>
    `);
    const loginRegister = document.querySelector('.loginRegister');
    await login(render, loginRegister);
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');
    loginButton.addEventListener('click', async () => {
        registerButton.classList.remove('button-primary');
        registerButton.classList.add('button');
        loginButton.classList.remove('button');
        loginButton.classList.add('button-primary');
        await login(render, loginRegister);
    });
    registerButton.addEventListener('click', async () => {
        loginButton.classList.remove('button-primary');
        loginButton.classList.add('button');
        registerButton.classList.remove('button');
        registerButton.classList.add('button-primary');
        await register(render, loginRegister);
    });
};