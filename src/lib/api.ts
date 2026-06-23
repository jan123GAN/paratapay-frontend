// src/api/apiInstance.js

import axios from 'axios';

export const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_BACK_END || '',
  withCredentials: true,
});


apiInstance.interceptors.request.use(
  (config) => {

    const token = sessionStorage.getItem('token');
    console.log(token)


    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {

      console.error('Unauthorized request. Redirecting to login...');

      localStorage.removeItem('token');

    }
    return Promise.reject(error);
  }
);