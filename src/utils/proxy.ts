import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://cosmic-whippet-really.ngrok-free.app/api'; // Replace with your actual API URL
// const API_BASE_URL = 'https://pig-positive-gorilla.ngrok-free.app/api'; // Replace with your actual API URL

interface RequestConfig {
  method: string;
  headers: Record<string, string>;
  body?: string;
  token?: string; // Token field for handling bearer token
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

// POST method for login, register, etc. (with optional Bearer token)
export const post = async (url: string, payload: any, needsAuth: boolean = false) => {
  try {
    let token = null;
    
    if (needsAuth) {
      token = await AsyncStorage.getItem('userToken'); // Retrieve token if required for the request
    }

    const config: RequestConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '', // Include the token if required
      },
      body: JSON.stringify(payload),
    };

    return request(url, config);
  } catch (error) {
    console.error('Error making POST request:', error);
    throw error;
  }
};

// GET method for fetching data with Bearer token
export const get = async (url: string) => {
  try {
    const token = await AsyncStorage.getItem('userToken'); // Retrieve the token from storage

    const config: RequestConfig = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '', // Include the token if it exists
      },
    };

    return request(url, config);
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

// Function to fetch a token from the API (for login)
export const fetchToken = async (username: string, password: string) => {
  try {
    const payload = { username, password }; // Adjust the payload based on your API requirements

    const config: RequestConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    const tokenData = await request('/token', config); // Adjust the URL to your actual token endpoint
    return tokenData.token; // Assuming the response contains the token under the key 'token'
  } catch (error) {
    console.error('Error fetching token:', error);
    throw error;
  }
};

// PUT method for updates (optional Bearer token)
export const put = async (url: string, payload: any, needsAuth: boolean = false) => {
  try {
    let token = null;

    if (needsAuth) {
      token = await AsyncStorage.getItem('userToken'); // Retrieve token if required for the request
    }

    const config: RequestConfig = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '', // Include the token if required
      },
      body: JSON.stringify(payload),
    };

    return request(url, config);
  } catch (error) {
    console.error('Error making PUT request:', error);
    throw error;
  }
};

/// In your proxy utility file (utils/proxy.ts)

// src/utils/proxy.ts

export const logout = async () => {
    const token = await AsyncStorage.getItem('userToken'); // Retrieve token from storage
    
    if (!token) {
      throw new Error('No token found');
    }
  
    const config: RequestConfig = {
      method: 'POST', // Assuming the API uses POST for logout
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Send the token in the Authorization header
      },
    };
  
    try {
      const response = await request('/logout', config); // Adjust the endpoint if needed
      await AsyncStorage.removeItem('userToken'); // Remove the token only if logout request is successful
      return response;
    } catch (error) {
      throw new Error('Logout failed');
    }
  };
  
