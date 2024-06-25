import { tournament as tournamentFunc } from "./../tournament.mjs"

export const setPlayersNames = (render, div, data, tournament) => {
    render(div, `
        <style>
            .container {
                margin-left: 30vw;
                margin-top: 25vh;
                width: 40vw;
                height: 40vh;
            }
            .formSetPlayersNames {
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
                <h1>${data.setPlayersNames}</h1>
            </div>
            <div class="row formSetPlayersNames">
                <div id="formPlayers">
                </div>
                <button type="button" class="btn button w-25" id="setPlayersNamesButton">${data.add}</button>
            </form>
        </div>
    `);

    let formPlayers = document.getElementById('formPlayers');
    for (let i = 0; i < tournament.nbPlayers - (tournament.players) ? tournament.players.length : 0; i++) {
        let div = document.createElement('div');
        div.classList.add('mb-3');
        let input = document.createElement("input");
        input.classList.add('form-control');
        input.classList.add('players');
        input.setAttribute('type', 'text');
        input.setAttribute('placeholder', `${data.player} ${i + 1}`);
        div.appendChild(input);
        formPlayers.appendChild(div);
    }

    const setPlayersNamesButton = document.getElementById('setPlayersNamesButton');
    setPlayersNamesButton.addEventListener('click', () => {
        document.querySelectorAll('.players').forEach(player => {
            if (player.value !== "") {
                // /!\ CHECK IF NO IN PLAYERS LIST
                // tournament.players.set(player.value, 0);
                tournament.addPlayer(player.value);
            }
        })
        if ((tournament.players) ? tournament.players.length : 0 !== parseInt(tournament.nbPlayers)) {
            setPlayersNames(render, div, data, tournament);
        } else {
            tournament.calculateGames();
            localStorage.setItem('tournament', JSON.stringify(tournament.toJson()));
            console.log(tournament.toJson());
            tournamentFunc(render,  div).then();
        }
    });
}


