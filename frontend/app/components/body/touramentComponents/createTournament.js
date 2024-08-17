import { setPlayersNames } from './setPlayersNames.js';

export const createTournament = (render, div, data, tournament) => {
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
                <button type="button" class="btn button w-25" id="createTournamentButton">${data.create}</button>
            </form>
        </div>
    `);

    const createTournamentButton = document.getElementById('createTournamentButton');
    const form = {
        tournamentPlayers: document.getElementById('tournamentPlayers'),
        tournamentName: document.getElementById('tournamentName'),
    };

    createTournamentButton.addEventListener('click', () => {
        if (form.tournamentPlayers.value !== '' && form.tournamentName.value !== '') {
            tournament.setNbPlayers(form.tournamentPlayers.value);
            tournament.setName(form.tournamentName.value);
            // /!\ /!\ /!\ HAVE TO SET TOURNAMENT TO LOCALSTORAGE
            setPlayersNames(render, div, data, tournament);
        }
    });


    return [];
};