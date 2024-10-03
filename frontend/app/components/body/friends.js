import { error } from '../../engine/error.js';
import { getLanguageDict } from '../../engine/language.js';
import { getUserInfo } from './user.js';
import { getUsername } from './profile.js';
import { reload } from '../../engine/utils.js';

export const getAllFriendRequests = async (status=null) => {
    let response;
    if (status) {
        response = await fetch(`/api/friendships/${status}/`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    else {
        response = await fetch('/api/friendships/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    if (response.status !== 200)
        return null;
    return await response.json();
};

const refreshFriendIcons = async () => {
    const friends = await getAllFriendRequests('waiting');
    const friendsButton = document.getElementById('friendsButton');
    if (friendsButton && friends === null) {
        friendsButton.innerHTML = 'group';
    } else if (friendsButton) {
        friendsButton.innerHTML = 'notifications_unread';
    }
};

const addFriend = async (username) => {
    const response = await fetch('/api/friendships/', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({username: username}),
    });
    if (response.status !== 200) {
        switch (response.status) {
            case 400:
                error('Invalid request', 'warning');
                break;
            case 404:
                error('Invalid username', 'warning');
                break;
            case 409:
                error('You\'re already friends', 'warning');
                break;
            default:
                error('Unknown error', 'danger');
                break;
        }
        return false;
    }
    return true;
};

const patchFriendship = async (username, action) => {
    await fetch('/api/friendships/', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({username: username, action: action}),
    });
};

const renderPendingFriendships = async (div, data) => {
    if (!div)
        return null;

    const requests = await getAllFriendRequests('pending');
    if (requests === null) {
        div.innerHTML = `<p>${data.noPendingFriendsYet}</p>`;
        return null;
    }

    const tmp_div = document.createElement('div');
    for (let i = 0; i < requests.length; i++) {

        const friendInfo = await getUserInfo([requests[i].user_username]);
        const avatarUrl = friendInfo.avatar;

        const friendCard = document.createElement('div');
        friendCard.classList.add('col-md-3', 'friendCard', 'row');

        const col = document.createElement('div');
        col.classList.add('col', 'w-50');
        col.innerHTML = `<img src="${avatarUrl}" alt="Avatar" class="rounded-circle" width="60px" height="60px">`;
        friendCard.appendChild(col);

        const col2 = document.createElement('div');
        col2.classList.add('col', 'w-50');
        col2.innerHTML = `<a href="/user/${friendInfo.username}" id="pendingFriendName" data-link>${friendInfo.username}</a>`;
        friendCard.appendChild(col2);

        const col3 = document.createElement('div');
        col3.classList.add('col', 'w-50');
        col3.innerHTML = `<button type="button" class="btn button accept" id="acceptFriendButton" data-friend-username="${friendInfo.username}">
            <span class="material-symbols-outlined">check_circle</span>
        </button>`;
        friendCard.appendChild(col3);

        const col4 = document.createElement('div');
        col4.classList.add('col', 'w-50');
        col4.innerHTML = `<button type="button" class="btn button decline" id="rejectFriendButton" data-friend-username="${friendInfo.username}">
            <span class="material-symbols-outlined">cancel</span>
        </button>`;
        friendCard.appendChild(col4);
        tmp_div.appendChild(friendCard);
    }
    div.innerHTML = tmp_div.innerHTML;
};

const renderRequestedFriendships = async (div, data) => {
    if (!div)
        return null;

    const requests = await getAllFriendRequests('requested');
    if (requests === null) {
        div.innerHTML = `<p>${data.noRequestedFriendsYet}</p>`;
        return null;
    }

    const tmp_div = document.createElement('div');
    for (let i = 0; i < requests.length; i++) {

        const friendInfo = await getUserInfo([requests[i].friend_username]);
        const avatarUrl = friendInfo.avatar;

        const friendCard = document.createElement('div');
        friendCard.classList.add('col-md-3', 'friendCard', 'row');

        const col = document.createElement('div');
        col.classList.add('col', 'w-50');
        col.innerHTML = `<img src="${avatarUrl}" alt="Avatar" class="rounded-circle" width="60px" height="60px">`;
        friendCard.appendChild(col);

        const col2 = document.createElement('div');
        col2.classList.add('col', 'w-50');
        col2.innerHTML = `<a href="/user/${friendInfo.username}" id="pendingFriendName" data-link>${friendInfo.username}</a>`;
        friendCard.appendChild(col2);

        const col4 = document.createElement('div');
        col4.classList.add('col', 'w-100');
        col4.innerHTML = `<button type="button" class="btn button decline" id="rejectFriendButton" data-friend-username="${friendInfo.username}">
            <span>Cancel</span>
        </button>`;
        friendCard.appendChild(col4);
        tmp_div.appendChild(friendCard);
    }
    div.innerHTML = tmp_div.innerHTML;
};

const renderAcceptedFriendships = async (div, data) => {
    if (!div)
        return null;

    const requests = await getAllFriendRequests('accepted');
    if (requests === null) {
        div.innerHTML = `<p>${data.noAcceptedFriendsYet}</p>`;
        return null;
    }

    const user_username = await getUsername();
    const tmp_div = document.createElement('div');
    for (let i = 0; i < requests.length; i++) {
        const friend_username = requests[i].user_username === user_username ? requests[i].friend_username
            : requests[i].user_username;
        const friendInfo = await getUserInfo([friend_username]);
        const avatarUrl = friendInfo.avatar;


        const friendCard = document.createElement('div');
        friendCard.classList.add('col-md-3', 'friendCard', 'row');

        const col = document.createElement('div');
        col.classList.add('col', 'w-50');
        col.innerHTML = `<img src="${avatarUrl}" alt="Avatar" class="rounded-circle" width="60px" height="60px">`;
        friendCard.appendChild(col);

        const col2 = document.createElement('div');
        col2.classList.add('col', 'w-50');
        col2.innerHTML = `<a href="/user/${friendInfo.username}" id="pendingFriendName" data-link>${friendInfo.username}</a>`;
        friendCard.appendChild(col2);

        const col3 = document.createElement('div');
        col3.classList.add('col', 'w-50');
        col3.innerHTML = `<button type="button" class="btn button decline" id="acceptFriendButton" data-friend-username="${friendInfo.username}">
            <span class="material-symbols-outlined">person_remove</span>
        </button>`;
        friendCard.appendChild(col3);

        tmp_div.appendChild(friendCard);
    }
    div.innerHTML = tmp_div.innerHTML;
};

export const friends = async (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const data = getLanguageDict(language, 'profile');


    render(div, `
        <style>
            .container-fluid {
                width: 70vw;
                height: 90vh;
                margin-top: 10vh;
            }
            .friendshipTitle {
                text-align: left;
                margin-top: 5vh;
            }
            .row ,  .col-md-6{
                padding-top: 1vh;
            }
            .addFriend {
                display: flex;
                justify-content: center;
            }
            .friendCard {
                background-color: var(--btn-bg-color);
                align-items: center;
                border-radius: 10px;
                margin: 1vw;
            }
            .col {
                margin-top: 20px;
                margin-bottom: 20px;
            }
            .accept {
                background-color: green;
                width: 100%;
            } 
            .decline {
                background-color: red;
                width: 100%;
            }
        </style>
        <div class="container-fluid">
            <div class="addFriend">
                <input type="text" id="friendValue" class="form-control" placeholder="${data.enterUsername}"/>
                <button type="button" class="btn button" id="toAddFriendButton">
                    <span class="material-symbols-outlined">person_add</span>
                </button>
            </div>
            <div id="friendshipContainer">
                <div class="friendshipTitle">
                    <h3>${data.pendingFriends}</h3>
                    <div class="row" id="pendingFriendsRow"></div>
                </div>
                <div class="friendshipTitle">
                    <h3>${data.requestedFriends}</h3>
                    <div class="row" id="requestedFriendsRow"></div>
                </div>
                <div class="friendshipTitle">
                    <h3>${data.acceptedFriends}</h3>
                    <div class="row" id="friendsRow"></div>
                </div>
            </div>
        <div>
    `);

    await renderPendingFriendships(document.getElementById('pendingFriendsRow'), data);
    await renderRequestedFriendships(document.getElementById('requestedFriendsRow'), data);
    await renderAcceptedFriendships(document.getElementById('friendsRow'), data);

    const buttonSelection = Object.values(document.getElementsByClassName('button'));
    buttonSelection.forEach((button) => {
        button.addEventListener('click', async () => {
            if (button.classList.contains('accept') || button.classList.contains('decline')) {
                const friendUsername = button.getAttribute('data-friend-username');
                await patchFriendship(friendUsername, button.classList.contains('accept') ? 'accept' : 'decline');
                await reload();
                await refreshFriendIcons();
            }
        });
    });

    document.getElementById('toAddFriendButton').addEventListener('click', async () => {
        const friendUsername = document.getElementById('friendValue').value;
        if (!friendUsername || !await addFriend(friendUsername)) return;
        return await reload();
    });
};