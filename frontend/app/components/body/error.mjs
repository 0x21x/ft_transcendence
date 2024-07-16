export const error = async (render, div, errorCode) => {
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
            <h1>ERROR: ${errorCode}</h1>
        </div>
    `);
};