const refreshAccess = async () => {
    try {
        const response = await fetch('http://localhost:5002/api/auth/login/refresh/', {
           method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({refresh: localStorage.getItem('refresh')}),
        });
        if (response.status === 401) {
            return false;
        }
        if (response.status !== 200) {
            localStorage.removeItem('refresh_token');
            return false;
        }
        localStorage.setItem('access_token', response.access);
        return true;
    }
    catch {
        return false;
    }
};

const checkAccess = async () => {
    try {
        const response = await fetch('http://localhost:5002/api/auth/verify/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access'),
            },
        });
        if (response.status === 401) {
            localStorage.removeItem('access');
            return false;
        }
        if (response.status !== 200) {
            localStorage.removeItem('access');
            return false;
        }
    }
    catch {
        return false;
    }
    return true;
};

export const loggedIn = () => {
    const access_token = localStorage.getItem('access');
    const refresh_token = localStorage.getItem('refresh');

    if (access_token === null && refresh_token === null) {
        return false;
    }

    if (refresh_token === null) {
        localStorage.removeItem('access_token');
        return false;
    }

    if (access_token === null) {
        if (!refreshAccess()) {
            return false;
        }
    }

    return checkAccess();
};