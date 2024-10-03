import { redirect, reload } from '../../engine/utils.js';
import { error } from '../../engine/error.js';
import { getLanguageDict } from '../../engine/language.js';

export const createTournament = (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const data = getLanguageDict(language, 'tournament');

    render(div, `
        <style>
            .container {
                margin-left: 30vw;
                margin-top: 25vh;
                width: 40vw;
                height: 40vh;
            }
            .formTournamentCreation {
                margin-top: 5vh;
            }
            h1 {
              text-align: center;  
            }
        </style>
        <div class="container
         align-items-center  
         justify-content-center  
         "> 
            <div class="row">
                <h1>${data.createTournament}</h1>
            </div>
            <div class="row formTournamentCreation">
                <div class="mb-3">
                    <label for="tournamentName" class="form-label">${data.tournamentNameLabel}</label>
                    <input type="text" class="form-control" id="tournamentName">
                </div>
                <div class="mb-3">
                    <label for="tournamentPlayers" class="form-label">${data.tournamentPlayersLabel}</label>
                    <select class="form-select" id="tournamentPlayers">
                      <option selected value="">${data.choosePlayersLabel}</option>
                      <option value="2">2</option>
                      <option value="4">4</option>
                      <option value="8">8</option>
                      <option value="16">16</option>
                    </select>
                </div>
                <button type="button" class="btn button w-100" id="createTournamentButton">${data.create}</button>
            </form>
        </div>
    `);

    const createTournamentButton = document.getElementById('createTournamentButton');
    const form = {
        tournamentPlayers: document.getElementById('tournamentPlayers'),
        tournamentName: document.getElementById('tournamentName'),
    };

    createTournamentButton.addEventListener('click', async () => {
        if (form.tournamentPlayers.value && form.tournamentName.value) {
            const response = await fetch('/api/tournaments/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tournament_name: form.tournamentName.value,
                    nb_of_players: parseInt(form.tournamentPlayers.value, 10),
                }),
            });
            if (response.status !== 200) {
                await reload();
                switch (response.status) {
                    case 400:
                        error('Invalid name or number of players', 'warning');
                        break;
                    case 409:
                        error('Error while creating tournament', 'danger');
                        break;
                    default:
                        error('Unknown error', 'danger');
                        break;
                }
                return;
            }
            return await redirect('/tournament/');
        }
    });
};