const API_BASE_URL = 'https://pig-positive-gorilla.ngrok-free.app/api'; // Replace with your actual API URL

interface RequestConfig {
    method: string;
    headers: Record<string, string>;
    body?: string;
    token?: string; // New field for token handling
}

const request = async (url: string, config: RequestConfig) => {
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, config);

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
};

// POST method for login, register, etc.
export const post = async (url: string, payload: any) => {
    const config: RequestConfig = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    };
    return request(url, config);
};

// GET method for fetching data
export const get = async (url: string) => {
    const config: RequestConfig = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };
    return request(url, config);
};

// Function to fetch a token from the API
export const fetchToken = async (username: string, password: string) => {
    const payload = { username, password }; // Adjust the payload based on your API requirements

    const config: RequestConfig = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    };

    try {
        const tokenData = await request('/token', config); // Adjust the URL to your actual token endpoint
        return tokenData.token; // Assuming the response contains the token under the key 'token'
    } catch (error) {
        console.error('Error fetching token:', error);
        throw error;
    }
};
