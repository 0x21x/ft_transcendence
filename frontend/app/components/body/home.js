import { getLanguageDict } from '../../engine/language.js';

export const home = (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const data = getLanguageDict(language, 'welcome');

    render(div, `
        <style>
            .container-fluid {
                width: 70vw;
                height: 40vh;
                margin-top: 30vh;
            }
            .row ,  .col-md-6{
                padding-top: 1vh;
            }
            h1 {
                text-align: center;
            }
            
        </style>
        <div class="container-fluid">
            <h1>${data.welcome}</h1>
        </div>
    `);
};