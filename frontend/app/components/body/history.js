import { getLanguageDict } from '../../engine/language.js';


const fillTableWithHistory = (table, history) => {
    for (let i = 0; i < history.length; i++) {
	    const tr = document.createElement('tr');
        const tdPlayer1 = document.createElement('td');
        const tdPlayer2 = document.createElement('td');
        const tdScore1 = document.createElement('td');
        const tdScore2 = document.createElement('td');
        tdPlayer1.innerHTML = `<a href="/user/${history[i]['player1']}" data-link>${history[i]['player1']}</a>`;
        tdPlayer2.innerHTML = `<a href="/user/${history[i]['player2']}" data-link>${history[i]['player2']}</a>`;
        tdScore1.innerHTML = history[i]['score1'];
        tdScore2.innerHTML = history[i]['score2'];
        tr.appendChild(tdPlayer1);
        tr.appendChild(tdScore1);
        tr.appendChild(tdPlayer2);
        tr.appendChild(tdScore2);
	    table.appendChild(tr);
    }
};

const calculateWinRate = (history, username) => {
    let win = 0;
    let lose = 0;
    for (let i = 0; i < history.length; i++) {
        if (history[i]['winner'] === username)
            win++;
        else
            lose++;
    }
    return Math.round(win / (win + lose) * 100);
};

export const getHistory = async (table, username='') => {
    const response = await fetch(`/api/games/history/${username}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    if (response.status !== 200)
        return ;
    const history = await response.json();
    if (!history.length)
        return ;
    fillTableWithHistory(table, history);
    if (username !== '')
        return(calculateWinRate(history, username));
};

export const history =  async (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const data = getLanguageDict(language, 'history');

    render (div, `
        <style>
            table {
                width: 10%;
            }    
            td, th {
              text-align: center;
            }
            .button {
                margin-top: 5px;
            }
        </style>
        <div class="container-fluid d-flex
         align-items-center  
         justify-content-center  
         min-vh-100"> 
         
         <div class="table-responsive">
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
      </div>
    `);

    const table = document.getElementById('table');
    await getHistory(table);

};