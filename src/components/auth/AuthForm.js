import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AuthStyle.css"; // Подключаем стили


const AuthForm = () => {
    const [isRegister, setIsRegister] = useState(false); // Регистрация или вход
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const navigate = useNavigate();

    // Проверка токена в localStorage для автоматической авторизации7
    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            navigate("/"); // Если токен есть, перенаправляем на главную страницу
        }
    }, [navigate]);

    // Обновление данных формы
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Обработка регистрации пользователя
    const handleRegister = async () => {
        try {
            await axios.post(
                "http://localhost:8081/api/auth/register",
                formData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true, // Убедитесь, что cookies используются корректно
                }
            );
            alert("Регистрация успешна! Теперь войдите.");
            setIsRegister(false); // Переключаемся на экран входа
        } catch (error) {
            console.error("Ошибка регистрации:", error);
            alert("Ошибка регистрации. Проверьте данные.");
        }
    };

    // Обработка авторизации пользователя
    const handleLogin = async () => {
        try {
            const response = await axios.post(
                "http://localhost:8081/api/auth/login",
                {
                username: formData.username,
                password: formData.password,
            },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true, // Включите, если используете cookie
                }
                );
            const { accessToken, refreshToken } = response.data;

            // Сохраняем токены в localStorage
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);

            //alert("Вы успешно вошли!");
            navigate("/notes"); // Перенаправляем на страницу заметок
        } catch (error) {
            console.error("Ошибка авторизации:", error);
            alert("Ошибка авторизации. Проверьте данные.");
        }
    };

    //Авторизация через Яндекс
    const handleYandexLogin = async () => {
        try {
            axios.defaults.withCredentials = true;
            const response = await axios.get("http://localhost:8081/api/auth/oauth2/authorize/yandex");
            const { state } = response.data;

            if (!state) {
                console.error("Ошибка: state отсутствует в ответе сервера");
                alert("Не удалось получить state для авторизации.");
                return;
            }

            const clientId = "a0bc7b7381a84739be01111f12d9447e"; // Ваш client_id
            const redirectUri = "http://localhost:8081/login/oauth2/code/yandex";
            const scope = "login login:email  login:info";
            //const state = 'someUniqueStateValue';

            const authUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
            //const authUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
            window.location.href = authUrl;
        } catch (error) {
            console.error("Ошибка при инициализации Yandex OAuth:", error);
            alert("Не удалось начать авторизацию через Яндекс.");
        }
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
            <button
                className="yandex-login-button"
                onClick={handleYandexLogin}
                style={{ marginTop: "16px", width: "100%" }}
            >
                Войти через Яндекс
            </button>
        </Box>
    );
};

export default AuthForm;