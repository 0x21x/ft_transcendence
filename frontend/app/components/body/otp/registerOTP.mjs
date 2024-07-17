const registerOTPRequest = async (password) => {
    if (!password)
        return false;
    const response = await fetch('http://localhost:5002/api/otp/register/', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({password: password}),
    });
    if (response.status !== 201)
        return false;

    return response.json();
}

export const registerOTP = async (render, div) => {
    const language = localStorage.getItem('language') || 'en';
    const url = `languages/${language}/otp.json`;
    const response = await fetch(url);
    const data = await response.json();

    render(div, `
        <style>
            .button-green {
                color: var(--btn-font-color);
                background-color: #4CBB17;
            }
    
            .button-green:hover {
                background-color: #228B22;
                transition: background-color 0.2s;
            }
        </style>
        <div class="registerOTPClass">
            <input type="password" id="passwordField" class="form-control" placeholder="${data.password}" required>
            <button class="btn button-green w-100" id="registerOTPButton">${data.setOTP}</button>
        </div>
        <p id="secret_code"></p>
    `);

    const registerOTPButton = document.getElementById('registerOTPButton');
    registerOTPButton.addEventListener('click', async () => {
        const password = document.getElementById('passwordField').value;
        const otp = await registerOTPRequest(password);
        if (!otp)
            return ;
        const registerOTPClass = document.querySelector('.registerOTPClass');
        registerOTPClass.style.display = 'none';
        document.getElementById('secret_code').innerHTML = `YOUR OTP CODE IS: ${otp.otp_secret}`;
    });
}