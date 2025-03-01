import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const api = axios.create({
    baseURL: API_URL+"/api", // Базовый URL вашего API
    headers: {
        "Content-Type": "application/json", // Глобально указываем тип контента
    },
});

// Добавляем интерцептор для вставки токена в заголовки запросов
api.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem("accessToken");

    // 💡 Не добавляем токен для регистрации
    if (accessToken && !config.url.includes("/auth/register")) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

export default api;
