import { registerOTP } from './otp/registerOTP.mjs';
import { logoutOTP } from './otp/logoutOTP.mjs';
import { getUserInfo } from './user.mjs';
import { data as enData } from '../../languages/en/profile.js'
import { data as frData } from '../../languages/fr/profile.js'


const uploadAvatar = async (avatar) => {
    if (!avatar)
        return false;
    let formData = new FormData();
    formData.append('avatar', avatar);
    const response = await fetch('http://localhost:5002/api/avatars/', {
        method: 'PUT',
        credentials: 'include',
        body: formData,
    });
    return response.status === 200;
};

const setUsername = async (username) => {
    await fetch('http://localhost:5002/api/usernames/', {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({username: username}),
    });
};

const setPassword = async (oldPass, newPass) => {
    await fetch('http://localhost:5002/api/passwords/', {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({old_password: oldPass, new_password: newPass}),
    });
}

const getUsername = async () => {
    let username = await fetch('http://localhost:5002/api/usernames/', {
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
    const response = await fetch('http://localhost:5002/api/auth/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (response.status !== 200)
        return ;
    window.location.href = '/';
}

export const profile = async (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const data = language === 'en' ? enData : frData;
    const userInfo = await getUserInfo([await getUsername()]);
    const avatar_url = 'http://localhost:5002/api' + userInfo.avatar;

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
        await setUsername(username);
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