export const user = async (render, div, args) => {
    // const avatar_url = await getAvatarUrl();

    render(div, `
        <style>
            .profileContainer {
                margin-top: 20px;
                width: 50vw;
            }
            .col {
                margin-top: 10px;
                margin-bottom: 10px;
            }
        </style>
        <div class="container profileContainer">
            <h2 id="username">${args[0]}</h2>
        </div>
    `);
};