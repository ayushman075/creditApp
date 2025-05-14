import axios from 'axios';
import Cookies from 'js-cookie'; 

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api/v1/',
  timeout: 500000, 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});


axiosInstance.interceptors.request.use(
  (config) => {
   
    const token = Cookies.get('authToken'); 
    if (token) {
      
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("No token found in cookies.");
      Cookies.remove('authToken'); 
       window.location.href = '/login';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default axiosInstance;
