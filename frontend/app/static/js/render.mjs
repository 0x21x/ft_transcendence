import { routes } from './routes.mjs';

export const render = (div, html, append=false) => {
    if (append){
        div.innerHTML += html;
        return;
    }
    div.innerHTML = html;
};

export const renderHeader = async () => {
    const language = localStorage.getItem('language') || 'en';
    const url = `languages/${language}/navbar.json`;
    const response = await fetch(url);
    const data = await response.json();

    for (let route of routes) {
        const page = document.getElementById(route.name);
        if (page) { page.innerHTML = data[route.name]; }
    }

    // document.getElementById("game").innerHTML = data.game;
    // document.getElementById("history").innerHTML = data.history;
};

export const renderBody = async (div, match) => {
    if (!match) {
        const unknown = `
            <div class="container d-flex  
             align-items-center  
             justify-content-center  
             min-vh-100"> 
             <h1>404</h1>
          </div>
        `;
        render(div, unknown);
        return ;
    }
    await match.route.view(div)
};

