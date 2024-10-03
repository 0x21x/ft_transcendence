import { error } from '../../engine/error.js';
import { getLanguageDict } from '../../engine/language.js';
import { getUserInfo } from './user.js';
import { logoutOTP } from './otp/logoutOTP.js';
import { registerOTP } from './otp/registerOTP.js';

const uploadAvatar = async (avatar) => {
    if (!avatar)
        return false;
    const formData = new FormData();
    formData.append('avatar', avatar);
    const response = await fetch('/api/avatars/', {
        method: 'PUT',
        credentials: 'include',
        body: formData,
    });
    if (response.status !== 200) {
        switch (response.status) {
            case 404:
                error('Invalid user', 'warning');
                break;
            case 400:
                error('Invalid avatar', 'warning');
                break;
            case 413:
                error('Avatar too big', 'warning');
                break;
            default:
                error('Unknown error', 'danger');
                break;
        }
        return false;
    }
    return true;
};

const setUsername = async (username) => {
    const response = await fetch('/api/usernames/', {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({username: username}),
    });
    if (response.status !== 200) {
        switch (response.status) {
            case 400:
                error('Invalid username', 'warning');
                break;
            case 404:
                error('Invalid user', 'warning');
                break;
            case 409:
                error('Username already exists', 'warning');
                break;
            default:
                error('Unknown error', 'danger');
                break;
        }
        return false;
    }
    return true;
};

const setPassword = async (oldPass, newPass) => {
    const response = await fetch('/api/passwords/', {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({old_password: oldPass, new_password: newPass}),
    });
    if (response.status !== 200) {
        switch (response.status) {
            case 404:
                error('Invalid user', 'warning');
                break;
            case 401:
                error('Invalid password old password', 'warning');
                break;
            case 400:
                error('Invalid password new password', 'warning');
                break;
            default:
                error('Unknown error', 'danger');
                break;
        }
        return ;
    }
    return true;
};

export const getUsername = async () => {
    let username = await fetch('/api/usernames/', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    username = await username.json();
    return username.username;
};

const logout = async () => {
    const response = await fetch('/api/auth/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (response.status !== 200)
        return ;
    window.location.href = '/';
};

export const profile = async (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const data = getLanguageDict(language, 'profile');
    const userInfo = await getUserInfo([await getUsername()]);
    const avatar_url = userInfo.avatar;

    render(div, `
        <style>
            .profileContainer {
                margin-top: 20px;
                width: 50vw;
            }
            .col {
                margin-top: 10px;
                margin-bottom: 10px;
            }
        </style>
        <div class="container profileContainer">
            <img src="${avatar_url}" alt="img" class="avatar rounded-circle" width="50px" height="50px">
            <h2 id="username">${userInfo.username}</h2>
            <div class="row row-cols-2">
                <div class="col">
                    <input class="w-100 form-control" type="text" id="usernameValue" placeholder="${data.username}">
                    <button class="btn button w-100" id="setNewUsernameButton">${data.change_username}</button>
                </div>
                <div class="col">
                    <input class="w-100 form-control" type="file" id="newAvatarField" accept="image/jpg">
                    <button class="btn button w-100" id="setNewAvatarButton">${data.change_avatar}</button>
                </div>
                <div class="col">
                    <input class="w-100 form-control" type="password" id="oldPassValue" placeholder="${data.old_password}">
                    <input class="w-100 form-control" type="password" id="newPassValue" placeholder="${data.new_password}">
                    <button class="btn button w-100" id="setNewPassButton">${data.change_password}</button>
                </div>
                <div class="col otp"></div>
            </div>
            <button class="btn button-primary" id="logoutButton">${data.logout}</button>
        </div>
    `);

    const otpDiv = document.querySelector('.otp');
    if (!userInfo.otp_enabled)
        await registerOTP(render, otpDiv);
    else
        await logoutOTP(render, otpDiv);

    const setNewAvatarButton = document.getElementById('newAvatarField');
    setNewAvatarButton.addEventListener('change', async () => {
        if (await uploadAvatar(setNewAvatarButton.files[0]))
            window.location.reload();
    });

    const setNewUsernameButton = document.getElementById('setNewUsernameButton');
    setNewUsernameButton.addEventListener('click', async () => {
        const username = document.getElementById('usernameValue').value;
        if (await setUsername(username))
            window.location.reload();
    });

    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', await logout);

    const setNewPassButton = document.getElementById('setNewPassButton');
    setNewPassButton.addEventListener('click', async () => {
        const oldPass = document.getElementById('oldPassValue').value;
        const newPass = document.getElementById('newPassValue').value;
        await setPassword(oldPass, newPass);
    });
};