import { data as enData } from '../../languages/en/history.js'
import { data as frData } from '../../languages/fr/history.js'


const fillTableWithHistory = (table, history) => {
    for (let i = 0; i < history.length; i++) {
	    let tr = document.createElement('tr');
	    for (let j = 0; j < 4; j++) {
	    	let td = document.createElement('td');
            td.textContent = Object.values(history[i])[j];
	    	tr.appendChild(td);
	    }
	    table.appendChild(tr);
    }
}

export const history =  async (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const data = language === 'en' ? enData : frData;

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
              <button type="button" class="btn button w-100" id="clearButton">${data.clearHistory}</button>
            </div>
      </div>
    `);

    let table = document.getElementById("table");
    let historyStorage = localStorage.getItem('history');
    const clearButton = document.getElementById('clearButton');

    clearButton.addEventListener('click', () => {
        localStorage.removeItem('history');
        table.innerHTML = '';
        history(render, div);
    });
    if (historyStorage) {
        historyStorage = JSON.parse(historyStorage);
        fillTableWithHistory(table, historyStorage);
    }

};