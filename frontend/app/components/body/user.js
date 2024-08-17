import { data as enData } from '../../languages/en/profile.js';
import { error } from './error.js';
import { data as frData } from '../../languages/fr/profile.js';
import { getHistory } from './history.js';

export const getUserInfo = async (args) => {
    if (args.length !== 1)
        throw new Error('Invalid number of arguments');
    const response = await fetch(`http://localhost:5002/api/users/${args[0]}/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (response.status !== 200)
        return null;
    return await response.json();
};

export const user = async (render, div, args) => {
    const language = localStorage.getItem('language') || 'en';
    const data = language === 'en' ? enData : frData;
    const userInfo = await getUserInfo(args);
    if (userInfo === null)
        return error(render, div, 'User not found');
    const avatar_url = 'http://localhost:5002/api' + userInfo.avatar;

    render(div, `
        <style>
            .table-responsive {
                text-align: center;
                margin-top: 20px;
                margin-left: 30vw;
                width: 40vw;
            }    
            td, th {
              text-align: center;
            }
            .profileContainer {
                margin-top: 20px;
                width: 300px;
            }
            .avatar {
                margin-left: 100px;
            }
            .col {
                margin-top: 10px;
                margin-bottom: 10px;
            }
        </style>
        <div class="container profileContainer">
            <img src="${avatar_url}" alt="Avatar" class="avatar rounded-circle" style="width: 100px; height: 100px;">
            <h1>${userInfo.username}</h1>
            <div class="row">
                <div class="col">
                    <h4 id="status"></h4>
                </div>
            </div>
        </div>
        <div class="table-responsive">
            <h2>${data.lastGames}</h2>
            <table class="table table-bordered mb-0 bg-table">
                 <thead>
                      <tr>
                          <th scope="col">${data.firstPlayer}</th>
                          <th scope="col">${data.score}</th>
                          <th scope="col">${data.secondPlayer}</th>
                          <th scope="col">${data.score}</th>
                      </tr>
                 </thead>
                 <tbody id="table"></tbody>
            </table>
        </div>
    `);
    const status = document.getElementById('status');
    if (userInfo.is_online === true) {
        status.innerText = `🟢 ${data.online}`;
    } else {
        status.innerText = `🔴 ${data.offline}`;
    }
    const table = document.getElementById('table');
    await getHistory(table, userInfo.username);
};