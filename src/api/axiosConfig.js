import axios from "axios";
 const API_URL = process.env.REACT_APP_API_URL; // || "http://localhost:8080";

const api = axios.create({
    baseURL: API_URL+"/api", // Базовый URL вашего API

    headers: {
        "Content-Type": "application/json", // Глобально указываем тип контента
    },
});
// console.log("рассчитанный api:",api);
// console.log("API_URL:", API_URL);
// console.log("API Base URL:", api.defaults.baseURL);

// Добавляем интерцептор для вставки токена в заголовки запросов
api.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("accessToken");

    // 💡 Не добавляем токен для регистрации
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

export default api;
