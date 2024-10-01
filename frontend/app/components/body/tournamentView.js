import { reload, truncate } from '../../engine/utils.js';
import { getLanguageDict } from '../../engine/language.js';
import { getUsername } from './profile.js';

const joinTournament = async (tournament_name) => {
    const response = await fetch(`/api/tournament/${tournament_name}/`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({'action': 'join'})
    });
    if (response.status !== 200) {
        return null;
    }
    return await reload();
};

const renderNotFullRow = (div, data) => {
    const container = document.createElement('div');
    container.classList.add('container', 'w-100', 'h-100');
    container.innerHTML = `<div class="row"><div class="col text-center" style="font-size: x-large">${data.notFull}</div></div>`;
    div.innerHTML = container.innerHTML;
};

const renderRow = (tournament, rowId, div, data, username) => {
    const row = document.createElement('div');
    row.classList.add('row');
    for (const game of tournament.rows[rowId - 1].games) {
        const gameCard = document.createElement('div');
        gameCard.classList.add('col', 'tournamentCard');
        gameCard.style = 'padding: 15px; margin-top: 15px;';
        const players = document.createElement('div');
        players.classList.add('row', 'w-100', 'text-center', 'justify-content-center', 'd-flex', 'align-items-center');
        players.style = 'padding: 5px;';
        for (const friendInfo of game.players) {
            const avatarUrl = friendInfo.avatar;
            const col = document.createElement('div');
            col.classList.add('col-md-5');
            col.style = 'padding: 5px;';
            col.innerHTML = `
                <a href="/user/${friendInfo.username}/" id="pendingFriendName" data-link>
                    <img href="/user/${friendInfo.username}/" src="${avatarUrl}" class="rounded-circle" alt="${friendInfo.username}" width="40px" height="40px" data-link>
                </a>
                <a href="/user/${friendInfo.username}/" id="pendingFriendName" data-link>
                    ${truncate(friendInfo.username, 6)}
                </a>
            `;
            players.appendChild(col);
        }
        if (players.children.length === 2) {
                const col = document.createElement('div');
                col.classList.add('col-md-2', 'text-center');
                col.style = 'padding: 5px;';
                col.innerHTML = 'vs';
                players.insertBefore(col, players.children[1]);
            }
        gameCard.appendChild(players);

        // Players' scores
        if (game.status === 'finished' && game.winner !== null) {
            const scores = document.createElement('div');
            scores.classList.add('row', 'w-100', 'text-center');
            scores.style = 'padding: 5px;';
            for (let j = 0; j < game.scores.length; j++) {
                const col = document.createElement('div');
                col.classList.add('col-md-5');
                if (game.winner === game.players[j].username) {
                    col.style = 'color: green; font-weight: bold; font-size: larger; padding: 5px;';
                } else {
                    col.style = 'color: red; font-weight: bold; font-size: larger; padding: 5px;';}
                if (game.scores.some(score => score.player === game.players[j].username)) {
                    col.innerHTML = game.scores.find(score => score.player === game.players[j].username).score;
                }
                scores.appendChild(col);
            }
            if (game.scores.length === 2) {
                const col = document.createElement('div');
                col.classList.add('col-md-2');
                col.style = 'padding: 5px;';
                col.innerHTML = data.score;
                scores.insertBefore(col, scores.children[1]);
            }
            gameCard.appendChild(scores);
        }

        // Join button
        if (game.status === 'waiting' && game.players.some(player => player.username === username)) {
            const col = document.createElement('div');
            col.classList.add('col', 'd-flex', 'justify-content-center');
            col.style = 'padding: 5px;';
            col.innerHTML = `
                <a href="/games/${game.name}/" id="pendingFriendName" data-link>
                    <button class="btn button-primary">${data.play}</button>
                </a>
            `;
            gameCard.appendChild(col);
        }
        // Game status
        else if (game.status !== 'finished') {
            const col = document.createElement('div');
            col.classList.add('col');
            col.classList.add('text-center');
            col.innerHTML = `<span>${data[game.status]}</span>`;
            gameCard.appendChild(col);
        }
        row.appendChild(gameCard);
    }
    div.innerHTML = row.innerHTML;
};

const getTournament = async (tournament_name) => {
    const response = await fetch(`/api/tournament/${tournament_name}/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    if (response.status !== 200) {
        return null;
    }
    return await response.json();
};

const onClickStagesTab = (tournament, event, data, username) => {
    const id = event.target.getAttribute('data-tabs-id') || event.target.firstElementChild.getAttribute('data-tabs-id');
    const div = document.getElementById('stages_tabs');

    const active_element = document.querySelector('.tabs.active');

    document.querySelectorAll('.tabs').forEach(element => {
        if (tournament.rows[element.getAttribute('data-tabs-id') - 1] === undefined) {
            element.classList.add('disabled');
        }
    });

    const target = document.querySelector(`[data-tabs-id="${id}"]`);
    if (target.classList.contains('disabled') === false && !active_element) {
        target.classList.add('active');
    } else if (target.classList.contains('disabled') === false && active_element) {
        active_element.classList.remove('active');
        target.classList.add('active');
    }
    else if (target.classList.contains('disabled')) {
        return null;
    }
    if (tournament.rows[0].players.length < tournament.nb_of_players) {
        renderNotFullRow(div, data);
    } else {
        renderRow(tournament, id, div, data, username);
    }
};

const renderStagesTabsOfTournament = (div, data, tournament, username) => {
    const rows = tournament.rows;
    if (rows === undefined || rows.length === 0) {
        return null;
    }
    const nb_rows = tournament.nb_of_rows;

    for (let i = 0; i < nb_rows; i++) {
        const li = document.createElement('li');
        li.classList.add('nav-item');
        li.innerHTML = `
            <a class="nav-link tabs" data-tabs-id=${i+1} data-tabs>${data.stage} ${i + 1}</a>
        `;
        div.appendChild(li);
    }
    const target = document.querySelector(`[data-tabs-id="${rows.length}"]`);
    onClickStagesTab(tournament, {target: target}, data, username);
};

const renderPlayersOfTournament = (div, data, tournament, username) => {
    const players = tournament.rows[0].players;
    if (players === undefined || players.length === 0) {
        return null;
    }

    const user_in_players = players.some(player => player.username === username);
    const nb_players = tournament.nb_of_players > players.length && !user_in_players
        ? players.length + 1 : players.length;

    for (let i = 0; i < nb_players; i++) {
        const player = players[i];
        const col = document.createElement('div');
        col.classList.add('col-md-1', 'text-center');
        if (player !== undefined) {
            col.innerHTML = `
                <a href="/user/${player.username}/" data-link>
                    <img src="${player.avatar}" alt="${player.username}" class="avatar rounded-circle" height="50px" width="50px" data-link>
                </a>
            `;
        } else {
            col.innerHTML = `
               <button class="btn button w-100" id="joinTournament">
                   <span class="material-symbols-outlined">add_circle</span>
               </button>
            `;
        }
        div.appendChild(col);
    }
};

export const tournamentView = async (render, div, args) => {
    const language = localStorage.getItem('language') || 'en';
    const data = getLanguageDict(language, 'tournament');
    const username = await getUsername();
    const tournament = await getTournament(args[0]);

    render(div, `
        <style>
            .container-fluid {
                width: 80vw;
                height: auto;
                margin-top: 10vh;
                border-radius: 10px;
                background-color: var(--bg-tournament);
                padding: 30px;
            }
            .tournamentTitle {
                margin-top: 1.5vh;
            }
            .row {
                padding-top: 2vh;
                padding-bottom: 2vh;
                margin: 0;
            }
            .col-md-1 {
                margin-top: 5px;
                margin-bottom: 5px;
            }
            .tournamentCard {
                background-color: var(--btn-bg-color);
                align-items: center;
                border-radius: 20px;
            }
        </style>
        <div class="container-fluid">
            <div id="tournamentContainer">
                <div class="tournamentTitle">
                    <h1>${tournament.tournament_name}</h1>
                </div>
                <div class="tournamentTitle">
                    <h3>${tournament.rows[0].players.length}/${tournament.nb_of_players} ${data.players}</h3>
                </div>
                <div class="row playersRow" id="playersRow"></div>
                <ul class="nav nav-tabs nav-fill mb-3" id="stageTabList"></ul>
                <div id="stages_tabs"></div>
            </div>
        <div>
    `);

    renderPlayersOfTournament(div.querySelector('#playersRow'), data, tournament, username);
    const joinTournamentButton = document.querySelector('#joinTournament');
    if (joinTournamentButton !== null) {
        joinTournamentButton.addEventListener('click', () => {
            joinTournament(tournament.name);
        });
    }
    renderStagesTabsOfTournament(div.querySelector('#stageTabList'), data, tournament, username);
    div.querySelector('#stageTabList').addEventListener('click', (event) => {
        onClickStagesTab(tournament, event, data, username);
    });
};