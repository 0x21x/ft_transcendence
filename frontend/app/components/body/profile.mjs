const uploadAvatar = async (avatar) => {
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

const getAvatarUrl = async () => {
    let avatar = await fetch('http://localhost:5002/api/avatars/', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    avatar = await avatar.json();
    return 'http://localhost:5002/api/' + avatar.avatar_url;
};

const logout = async () => {
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
}

export const profile = async (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const url = `languages/${language}/profile.json`;
    const response = await fetch(url);
    const data = await response.json();
    const avatar_url = await getAvatarUrl();

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
            <h2 id="username"></h2>
            <div class="row row-cols-2">
                <div class="col">
                    <input type="text" id="usernameValue" placeholder="${data.username}">
                    <button class="btn button" id="setNewUsernameButton">${data.change_username}</button>
                </div>
                <div class="col">
                    <input type="file" id="newAvatarField" accept="image/jpg">
                    <button class="btn button" id="setNewAvatarButton">${data.change_avatar}</button>
                </div>
                <div class="col">
                    <input type="text" id="oldPassValue" placeholder="${data.old_password}">
                    <input type="text" id="newPassValue" placeholder="${data.new_password}">
                    <button class="btn button" id="setNewPassButton">${data.change_password}</button>
                </div>
            </div>
            <button class="btn button-primary" id="logoutButton">${data.logout}</button>
        </div>
    `);

    const setNewAvatarButton = document.getElementById('newAvatarField');
    setNewAvatarButton.addEventListener('change', async () => {
        const avatar = document.getElementById('newAvatarField').files[0];
        if (!avatar) {
            return ;
        }
        if (await uploadAvatar(avatar)) {
            window.location.reload();
        }
    });

    const usernameProfile = document.getElementById('username');
    usernameProfile.innerText = await getUsername();

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