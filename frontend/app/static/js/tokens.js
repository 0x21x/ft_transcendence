const refresh = async () => {
    const response = await fetch('http://localhost:5002/api/auth/login/refresh/', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    console.log(response);
    return response.status === 200;
};


export const loggedIn = async () => {
    const response = await fetch('http://localhost:5002/api/auth/verify/', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.status !== 200) {
        return refresh();
    }

    return response.status === 200;
};
