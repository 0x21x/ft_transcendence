import { getLanguageDict } from '../../engine/language.js';
import { reload } from '../../engine/utils.js';
import { websocketsHandler } from '../../engine/router.js';

export const fillTableWithGames = (table, games) => {
    for (let i = 0; i < games.length; i++) {
	    const tr = document.createElement('tr');
        const tdPlayer1 = document.createElement('td');
        const tdPlayer2 = document.createElement('td');
        const tdButton = document.createElement('td');
        const players = Object.keys(games[i]['players']);
        tdPlayer1.innerHTML = players[0] || null;
        tdPlayer2.innerHTML = players[1] || null;
        if (players.length < 2)
            tdButton.innerHTML = `<a href="/games/${games[i]['name']}" class="btn button">JOIN</a>`;
        else
            tdButton.innerHTML = 'IN GAME';
        tr.appendChild(tdPlayer1);
        tr.appendChild(tdPlayer2);
        tr.appendChild(tdButton);
	    table.appendChild(tr);
    }
};

export const gameHandler = (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const data = getLanguageDict(language, 'game');

    render(div, `
        <style>
            .container {
                margin-left: auto;
                margin-top: auto;
                width: 70%;
            }
        </style>
        <div class="container"> 
            <div class="table-responsive">
                <table class="table table-bordered mb-0 bg-table">
                    <thead>
                        <tr>
                            <th scope="col">${data.player1}</th>
                            <th scope="col">${data.player2}</th>
                            <th scope="col">${data.status}</th>
                        </tr>
                    </thead>
                    <tbody id="games_table"></tbody>
                </table>
            </div>
            <div class="row">
                <button type="button" class="btn button" id="createGameButton">${data.createGame}</button>
            </div>
        </div>
    `);

    const createGameButton = document.getElementById('createGameButton');
    const websocket = websocketsHandler.getWs('games');
    if (!websocket) {
        return reload();
    }
    websocketsHandler.handleWebSocketOpen(websocket, (websocket) => {
        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const gameTable = document.getElementById('games_table');
            if (!gameTable) { return ; }
            gameTable.innerHTML = '';
            fillTableWithGames(gameTable, data.games);
        };
    });
    createGameButton.addEventListener('click', async () => {
        await fetch('/api/games/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });
    });
};

