import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api"
});

// Auto attach token
axiosInstance.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if(user?.token){
        config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
});

export default axiosInstance;