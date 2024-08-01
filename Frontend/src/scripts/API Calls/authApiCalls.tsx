import apiUrl from "./apiUrl";

const login = async (email: string, password: string, onSuccess: () => void): Promise<void> => {
    try {
        const response = await fetch(apiUrl + '/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token); // Store token in local storage
            onSuccess(); // Call the success callback
        } else {
            const data = await response.json();
            throw new Error(data.message || 'Error logging in');
        }
    } catch (err) {
        throw new Error('Error logging in');
    }
}

const register = async (username: string, email: string, password: string, onSuccess: () => void): Promise<void> => {
    try {
        const response = await fetch(apiUrl + '/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok) {
            onSuccess()
            alert("Registration Successful")
        } else {
            const data = await response.json();
            alert(data.message || 'Error registering user');
            // throw new Error(data.message || 'Error registering user');
        }
    } catch (err) {
        alert('Error registering user');
        throw new Error('Error registering user');
    }
}

export { login, register }