export const register = async (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const url = `languages/${language}/auth.json`;
    const response = await fetch(url);
    const data = await response.json();

    render(div, `
        <style>
            .registerForm {
                margin-top: 5vh;
            }
            h1 {
              text-align: center;  
            }
        </style>
            <div class="row registerForm">
                <div class="mb-3">
                    <label for="username" class="form-label">${data.username}</label>
                    <input type="text" class="form-control" id="usernameValue">
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">${data.password}</label>
                    <input type="password" class="form-control" id="passwordValue">
                </div>
                <div class="col text-center">
                    <button type="button" class="btn button w-100" id="toRegisterButton">${data.register}</button>
                </div>
                <br>
                <div class="col text-center">
                    <button type="button" class="btn button w-100" id="toOAuthRegisterButton">${data.Oregister}</button>
                </div>
            </div>
    `);

    const toRegisterButton = document.getElementById('toRegisterButton');
    const toOAuthRegisterButton = document.getElementById('toOAuthRegisterButton');
    toRegisterButton.addEventListener('click', async () => {
        const username = document.getElementById('usernameValue').value;
        const password = document.getElementById('passwordValue').value;
        const user = {
            username: username,
            password: password
        }
        await fetch('http://localhost:5002/api/auth/register/', {
           method: "POST",
            body: JSON.stringify(user),
            headers: {'Content-Type': 'application/json',}
        });

    });
    toOAuthRegisterButton.addEventListener('click', async () => {
        // do AOuth register behavior
    });
}