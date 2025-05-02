import AsyncStorage from '@react-native-async-storage/async-storage';
import {RequestConfig} from '../types/request-config';
import {API_ENDPOINTS} from '../api/api-endpoints';
import {API_URL} from '@env';

// Request from API
const request = async (url: string, config: RequestConfig) => {
  try {
    // console.log(`Making request to: ${API_URL}${url}`);
    const response = await fetch(`${API_URL}${url}`, config);

    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      console.log(`Unexpected content type: ${contentType}`);

      const textResponse = await response.text();
      console.log('Non-JSON response:', textResponse.substring(0, 200) + '...');
      return {
        status: false,
        data: null,
        message: `Server returned non-JSON response with content type: ${contentType}`,
      };
    }

    try {
      const data = await response.json();

      if (!response.ok) {
        console.log('API response error:', data.message || response.status);
        return {
          status: false,
          data: null,
          message:
            data.message || `Request failed with status ${response.status}`,
        };
      }

      return data;
    } catch (parseError) {
      console.log('JSON parse error:', parseError);
      const textResponse = await response.clone().text();
      console.log(
        'Failed to parse as JSON:',
        textResponse.substring(0, 200) + '...',
      );

      return {
        status: false,
        data: null,
        message: 'Failed to parse server response as JSON',
      };
    }
  } catch (error) {
    console.log('API request error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      status: false,
      data: null,
      message: `Network error occurred: ${errorMessage}`,
    };
  }
};

// POST
export const post = async (
  url: string,
  payload: any,
  needsAuth: boolean = false,
) => {
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
export const postWithoutPayload = async (
  url: string,
  needsAuth: boolean = false,
) => {
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
export const get = async (url: string, needsAuth: boolean = true) => {
  try {
    let token = null;

    if (needsAuth) {
      token = await AsyncStorage.getItem('userToken');
    }

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
    const payload = {username, password};

    const config: RequestConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    const response = await request('/token', config);
    if (response.status === false) {
      throw new Error(response.message || 'Authentication failed');
    }
    return response.token;
  } catch (error) {
    console.error('Error fetching token:', error);
    throw error;
  }
};

// PUT
export const put = async (
  url: string,
  payload: any,
  needsAuth: boolean = false,
) => {
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

// post with formdata (image uploading)
export const postFormData = async (
  url: string,
  formData: FormData,
  needsAuth: boolean = false,
) => {
  try {
    let token = null;

    if (needsAuth) {
      token = await AsyncStorage.getItem('userToken');
    }

    const config: RequestConfig = {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, browser will set it with boundary
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    };

    return request(url, config);
  } catch (error) {
    console.error('Error making POST request with FormData:', error);
    throw error;
  }
};

//post for headers only
export const postWithHeaders = async (
  url: string,
  payload: any,
  needsAuth: boolean = false,
) => {
  try {
    let token = null;

    if (needsAuth) {
      token = await AsyncStorage.getItem('userToken');
    }

    const config: RequestConfig = {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(payload),
    };

    return request(url, config);
  } catch (error) {
    console.error('Error making POST request with headers:', error);
    throw error;
  }
};
