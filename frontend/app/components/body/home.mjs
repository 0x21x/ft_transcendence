export const home = async (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const url = `languages/${language}/welcome.json`;
    const response = await fetch(url);
    const data = await response.json();

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