import { getLanguageDict } from '../../engine/language.js';
import { redirect } from '../../engine/utils.js';

const getAllTournaments = async (status=null) => {
    const url = status ? `/api/tournaments/${status}/` : '/api/tournaments/';
    const response = await fetch(url, {
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

const renderWaitingTournaments = async (div, data) => {
    if (!div)
        return null;

    const tournaments = await getAllTournaments('waiting');
    if (tournaments === null) {
        div.innerHTML = `<p>${data.noWaitingTournamentsYet}</p>`;
        return null;
    }

    const tmp_div = document.createElement('div');
    for (let i = 0; i < tournaments.length; i++) {

        const tournamentCard = document.createElement('div');
        tournamentCard.classList.add('col-md-5', 'tournamentCard', 'row');

        const col = document.createElement('div');
        col.classList.add('col', 'w-100', 'text-center');
        col.innerHTML = tournaments[i].tournament_name;
        tournamentCard.appendChild(col);

        const col2 = document.createElement('div');
        col2.classList.add('col', 'w-100');
        const actualPlayersNb = tournaments[i].rows[0].players.length;
        const maxPlayersNb = tournaments[i].nb_of_players;
        col2.innerHTML = `${actualPlayersNb}/${maxPlayersNb} ${data.players}`;
        tournamentCard.appendChild(col2);

        const col3 = document.createElement('div');
        col3.classList.add('col', 'w-100');
        const button = document.createElement('button');
        button.classList.add('btn', 'button-primary', 'w-100');
        button.innerHTML = data.view;
        button.setAttribute('data-tournament-name', tournaments[i].name);
        col3.appendChild(button);
        tournamentCard.appendChild(col3);
        tmp_div.appendChild(tournamentCard);
    }
    div.innerHTML = tmp_div.innerHTML;
};

const renderInProgressTournaments = async (div, data) => {
    if (!div)
        return null;

    const tournaments = await getAllTournaments('in_progress');
    if (tournaments === null) {
        div.innerHTML = `<p>${data.noInProgressTournamentsYet}</p>`;
        return null;
    }

    const tmp_div = document.createElement('div');
    for (let i = 0; i < tournaments.length; i++) {

        const tournamentCard = document.createElement('div');
        tournamentCard.classList.add('col-md-5', 'tournamentCard', 'row');

        const col = document.createElement('div');
        col.classList.add('col', 'w-100', 'text-center');
        col.innerHTML = tournaments[i].tournament_name;
        tournamentCard.appendChild(col);

        const col2 = document.createElement('div');
        col2.classList.add('col', 'w-100');
        const button = document.createElement('button');
        button.classList.add('btn', 'button-primary', 'w-100');
        button.innerHTML = data.view;
        button.setAttribute('data-tournament-name', tournaments[i].name);
        col2.appendChild(button);
        tournamentCard.appendChild(col2);
        tmp_div.appendChild(tournamentCard);
    }
    div.innerHTML = tmp_div.innerHTML;
};

export const tournament = async (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const data = getLanguageDict(language, 'tournament');

        render(div, `
        <style>
            .container-fluid {
                width: 80vw;
                height: 80vh;
                margin-top: 15vh;
            }
            .tournamentTitle {
                margin-top: 5vh;
            }
            .row {
            
                padding-top: 1vh;
            }
            .tournamentCard {
                background-color: var(--btn-bg-color);
                align-items: center;
                display: flex;
                border-radius: 10px;
                margin: 1vw;
            }
            .col {
                margin-top: 20px;
                margin-bottom: 20px;
            }
            .sticky-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                border: none;
                border-radius: 10px;
                padding: 20px 40px;
            }
        </style>
        <div class="container-fluid">
            <div id="tournamentContainer">
                <div class="tournamentTitle">
                    <h3>${data.waitingTournaments}</h3>
                    <div class="row" id="waitingTournamentsRow"></div>
                </div>
                <div class="tournamentTitle">
                    <h3>${data.inProgressTournaments}</h3>
                    <div class="row" id="inProgressTournamentsRow"></div>
                </div>
            </div>
            <button class="btn button-primary sticky-button">${data.createTournament}</button>
        <div>
    `);

    const createTournamentButton = document.querySelector('.sticky-button');
    createTournamentButton.addEventListener('click', async () => await redirect('/create_tournament/'));

    await renderWaitingTournaments(document.getElementById('waitingTournamentsRow'), data);
    await renderInProgressTournaments(document.getElementById('inProgressTournamentsRow'), data);

    const tournamentContainer = document.getElementById('tournamentContainer');
    tournamentContainer.addEventListener('click', async (event) => {
        const name = event.target.getAttribute('data-tournament-name');
        if (!name) { return; }
        return await redirect(`/tournament/${name}/`);
    });
};