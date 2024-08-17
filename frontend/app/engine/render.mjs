import { routes } from './routes.js';
import { data as enData } from '../languages/en/navbar.js'
import { data as frData } from '../languages/fr/navbar.js'

export const render = (div, html, append=false) => {
    if (append){
        div.innerHTML += html;
        return;
    }
    div.innerHTML = html;
};

export const renderHeader = async () => {
    const language = localStorage.getItem('language') || 'en';
    const data = language === 'en' ? enData : frData;

    for (let route of routes) {
        const page = document.getElementById(route.name);
        if (page) { page.innerHTML = data[route.name]; }
    }
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
    match.route.view(div, match.args)
};

