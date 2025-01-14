import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const navigate = useNavigate();

    // Обработчик выхода
    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/auth"); // Перенаправление на страницу авторизации
    };

    return (
        <div>
            <h1>Добро пожаловать в сервис заметок!</h1>
            <Button variant="outlined" color="secondary" onClick={handleLogout}>
                Выйти
            </Button>
        </div>
    );
};

export default HomePage;
