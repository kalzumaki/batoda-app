import AsyncStorage from '@react-native-async-storage/async-storage';
import { RequestConfig } from '../types/request-config';
import { API_ENDPOINTS } from '../api/api-endpoints';
//zrok api gateway
//docker
const API_BASE_URL = 'https://zna0brw6skqo.share.zrok.io/api';
export const BASE_URL = 'https://zna0brw6skqo.share.zrok.io/';


// Request from API
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
// POST
export const post = async (url: string, payload: any, needsAuth: boolean = false) => {
  try {
    let token = null;

    if (needsAuth) {
      token = await AsyncStorage.getItem('userToken');
    }

    const config: RequestConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(payload),
    };

    return request(url, config);
  } catch (error) {
    console.error('Error making POST request:', error);
    throw error;
  }
};
// POST w/o Payload
export const postWithoutPayload = async (url: string, needsAuth: boolean = false) => {
    try {
      let token = null;

      if (needsAuth) {
        token = await AsyncStorage.getItem('userToken');
      }

      const config: RequestConfig = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      };

      return request(url, config);
    } catch (error) {
      console.error('Error making POST request (without payload):', error);
      throw error;
    }
  };

// GET
export const get = async (url: string) => {
  try {
    const token = await AsyncStorage.getItem('userToken');

    const config: RequestConfig = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    };

    return request(url, config);
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};


export const fetchToken = async (username: string, password: string) => {
  try {
    const payload = { username, password };

    const config: RequestConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    const tokenData = await request('/token', config);
    return tokenData.token;
  } catch (error) {
    console.error('Error fetching token:', error);
    throw error;
  }
};

// PUT
export const put = async (url: string, payload: any, needsAuth: boolean = false) => {
  try {
    let token = null;

    if (needsAuth) {
      token = await AsyncStorage.getItem('userToken');
    }

    const config: RequestConfig = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(payload),
    };

    return request(url, config);
  } catch (error) {
    console.error('Error making PUT request:', error);
    throw error;
  }
};

// LOGOUT
export const logout = async () => {
    const token = await AsyncStorage.getItem('userToken');

    if (!token) {
      throw new Error('No token found');
    }

    const config: RequestConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await request(API_ENDPOINTS.LOGOUT, config);
      await AsyncStorage.removeItem('userToken');
      return response;
    } catch (error) {
      throw new Error('Logout failed');
    }
  };
