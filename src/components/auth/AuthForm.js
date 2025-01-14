import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthForm = () => {
    const [isRegister, setIsRegister] = useState(false); // Регистрация или вход
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const navigate = useNavigate();

    // Автоматическая авторизация, если токен есть в localStorage
    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            navigate("/"); // Перенаправляем на главную страницу
        }
    }, [navigate]);

    // Обновление состояния формы
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Регистрация пользователя
    const handleRegister = async () => {
        try {
            await axios.post("http://localhost:8081/api/auth/register", formData);
            alert("Регистрация успешна! Теперь войдите.");
            setIsRegister(false);
        } catch (error) {
            console.error("Ошибка регистрации:", error);
            alert("Ошибка регистрации. Проверьте данные.");
        }
    };

    // Авторизация пользователя
    const handleLogin = async () => {
        try {
            const response = await axios.post("http://localhost:8081/api/auth/login", {
                username: formData.username,
                password: formData.password,
            });
            const { accessToken, refreshToken } = response.data;

            // Сохраняем токены
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);

            alert("Вы успешно вошли!");
            navigate("/"); // Перенаправляем на главную страницу
        } catch (error) {
            console.error("Ошибка авторизации:", error);
            alert("Ошибка авторизации. Проверьте данные.");
        }
    };

    // Перенаправление на YandexID
    const handleYandexLogin = () => {
        const clientId = 'a0bc7b7381a84739be01111f12d9447e';
        const redirectUri = 'http://localhost:8081/login/oauth2/code/yandex';
        const scope = 'login login:email';
        const state = 'someUniqueStateValue';

        const authUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

        window.location.href = authUrl;
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            maxWidth="400px"
            bgcolor="#fff"
            p={4}
            borderRadius="8px"
            boxShadow="0 4px 8px rgba(0, 0, 0, 0.1)"
        >
            <Typography variant="h5" gutterBottom>
                {isRegister ? "Регистрация" : "Вход"}
            </Typography>
            {isRegister && (
                <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    margin="normal"
                />
            )}
            <TextField
                fullWidth
                label="Логин"
                name="username"
                value={formData.username}
                onChange={handleChange}
                margin="normal"
            />
            <TextField
                fullWidth
                type="password"
                label="Пароль"
                name="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
            />
            <Button
                variant="contained"
                color="primary"
                onClick={isRegister ? handleRegister : handleLogin}
                sx={{ marginTop: "16px", width: "100%" }}
            >
                {isRegister ? "Зарегистрироваться" : "Войти"}
            </Button>
            <Button
                variant="text"
                onClick={() => setIsRegister(!isRegister)}
                sx={{ marginTop: "8px" }}
            >
                {isRegister
                    ? "Уже есть аккаунт? Войти"
                    : "Нет аккаунта? Зарегистрироваться"}
            </Button>
            <Button
                variant="outlined"
                color="secondary"
                onClick={handleYandexLogin}
                sx={{ marginTop: "16px", width: "100%" }}
            >
                Войти через YandexID
            </Button>
        </Box>
    );
};

export default AuthForm;
