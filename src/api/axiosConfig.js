import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api", // Базовый URL вашего API
    headers: {
        "Content-Type": "application/json", // Глобально указываем тип контента
    },
});

export default api;
