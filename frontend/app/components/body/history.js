import { getLanguageDict } from '../../engine/language.js';


const fillTableWithHistory = (table, history) => {
    for (let i = 0; i < history.length; i++) {
	    const tr = document.createElement('tr');
	    for (let j = 0; j < 4; j++) {
	    	const td = document.createElement('td');
            if ((j + 1) % 2 !== 0)
                td.innerHTML = `<a href="/user/${Object.values(history[i])[j]}" data-link>${Object.values(history[i])[j]}</a>`;
            else
                td.textContent = Object.values(history[i])[j];
	    	tr.appendChild(td);
	    }
	    table.appendChild(tr);
    }
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