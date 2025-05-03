import AsyncStorage from '@react-native-async-storage/async-storage';
import {RequestConfig} from '../types/request-config';
import {API_ENDPOINTS} from '../api/api-endpoints';
import {API_URL} from '@env';

/**
 * Core request function to handle API calls
 */
const request = async (url: string, config: RequestConfig) => {
  try {
    // Ensure headers exist
    if (!config.headers) {
      config.headers = {};
    }

    // Set Accept header for all requests
    config.headers['Accept'] = 'application/json';

    // Make the API request
    const response = await fetch(`${API_URL}${url}`, config);

    // Check if response has JSON content type
    const contentType = response.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      console.log(`Unexpected content type: ${contentType}`);

      const textResponse = await response.text();
      console.log('Non-JSON response:', textResponse.substring(0, 200) + '...');

      // Handle authentication issues
      if (textResponse.includes('Unauthenticated')) {
        await AsyncStorage.removeItem('userToken');
        return {
          status: false,
          data: null,
          message: 'Unauthenticated. Please log in again.',
        };
      }

      return {
        status: false,
        data: null,
        message: `Server returned non-JSON response with content type: ${contentType}`,
      };
    }

    // Parse the JSON response
    try {
      const data = await response.json();

      // Handle non-successful responses
      if (!response.ok) {
        console.log('API response error:', data.message || response.status);
        return {
          status: false,
          data: null,
          message:
            data.message || `Request failed with status ${response.status}`,
        };
      }

      // Return successful response
      return data;
    } catch (parseError) {
      console.log('JSON parse error:', parseError);

      // Get text response if JSON parsing fails
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

/**
 * Helper function to get authorization header when needed
 */
const getAuthHeader = async (needsAuth: boolean) => {
  if (!needsAuth) return '';

  const token = await AsyncStorage.getItem('userToken');
  return token ? `Bearer ${token}` : '';
};

/**
 * POST request with JSON payload
 */
export const post = async (
  url: string,
  payload: any,
  needsAuth: boolean = false,
) => {
  try {
    const authHeader = await getAuthHeader(needsAuth);

    const config: RequestConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    };

    return request(url, config);
  } catch (error) {
    console.error('Error making POST request:', error);
    throw error;
  }
};

/**
 * POST request without payload
 */
export const postWithoutPayload = async (
  url: string,
  needsAuth: boolean = false,
) => {
  try {
    const authHeader = await getAuthHeader(needsAuth);

    const config: RequestConfig = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    };

    return request(url, config);
  } catch (error) {
    console.error('Error making POST request (without payload):', error);
    throw error;
  }
};

/**
 * GET request
 */
export const get = async (url: string, needsAuth: boolean = true) => {
  try {
    const authHeader = await getAuthHeader(needsAuth);

    const config: RequestConfig = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    };

    return request(url, config);
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

/**
 * Authentication token request
 */
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

/**
 * PUT request with JSON payload
 */
export const put = async (
  url: string,
  payload: any,
  needsAuth: boolean = false,
) => {
  try {
    const authHeader = await getAuthHeader(needsAuth);

    const config: RequestConfig = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    };

    return request(url, config);
  } catch (error) {
    console.error('Error making PUT request:', error);
    throw error;
  }
};

/**
 * Logout request
 */
export const logout = async () => {
  try {
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

    const response = await request(API_ENDPOINTS.LOGOUT, config);
    await AsyncStorage.removeItem('userToken');
    return response;
  } catch (error) {
    throw new Error('Logout failed');
  }
};

/**
 * POST request with FormData (for file uploads)
 */
export const postFormData = async (
  url: string,
  formData: FormData,
  needsAuth: boolean = false,
) => {
  try {
    const authHeader = await getAuthHeader(needsAuth);

    const config: RequestConfig = {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, browser will set it with boundary
        Authorization: authHeader,
      },
      body: formData,
    };

    return request(url, config);
  } catch (error) {
    console.error('Error making POST request with FormData:', error);
    throw error;
  }
};

/**
 * POST with custom headers only
 */
export const postWithHeaders = async (
  url: string,
  payload: any,
  needsAuth: boolean = false,
) => {
  try {
    const authHeader = await getAuthHeader(needsAuth);

    const config: RequestConfig = {
      method: 'POST',
      headers: {
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    };

    return request(url, config);
  } catch (error) {
    console.error('Error making POST request with headers:', error);
    throw error;
  }
};
