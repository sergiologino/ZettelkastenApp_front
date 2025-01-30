import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography, Container, Paper, Divider } from "@mui/material";
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

    // Проверка токена в localStorage для автоматической авторизации
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
                "http://localhost:8080/api/auth/register",
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
                "http://localhost:8080/api/auth/login",
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

            // navigate("/notes"); // Перенаправляем на страницу заметок
            navigate("/"); // Перенаправляем на страницу заметок
        } catch (error) {
            console.error("Ошибка авторизации:", error);
            alert("Ошибка авторизации. Проверьте данные.");
        }
    };

    // Авторизация через Яндекс
    const handleYandexLogin = async () => {
        try {
            axios.defaults.withCredentials = true;
            const response = await axios.get("http://localhost:8080/api/auth/oauth2/authorize/yandex");
            const { state } = response.data;

            if (!state) {
                console.error("Ошибка: state отсутствует в ответе сервера");
                alert("Не удалось получить state для авторизации.");
                return;
            }

            const clientId = "a0bc7b7381a84739be01111f12d9447e"; // Ваш client_id
            const redirectUri = "http://localhost:8080/login/oauth2/code/yandex";
            const scope = "login login:email login:info";

            const authUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
            window.location.href = authUrl;
        } catch (error) {
            console.error("Ошибка при инициализации Yandex OAuth:", error);
            alert("Не удалось начать авторизацию через Яндекс.");
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ padding: 4, marginTop: 8, borderRadius: 2 }}>
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
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
                            variant="outlined"
                            sx={{ mb: 2 }}
                        />
                    )}

                    <TextField
                        fullWidth
                        label="Логин"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        type="password"
                        label="Пароль"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        margin="normal"
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={isRegister ? handleRegister : handleLogin}
                        sx={{ mt: 2, width: "100%", py: 1.5 }}
                    >
                        {isRegister ? "Зарегистрироваться" : "Войти"}
                    </Button>

                    <Button
                        variant="text"
                        onClick={() => setIsRegister(!isRegister)}
                        sx={{ mt: 2 }}
                    >
                        {isRegister
                            ? "Уже есть аккаунт? Войти"
                            : "Нет аккаунта? Зарегистрироваться"}
                    </Button>

                    <Divider sx={{ width: "100%", my: 3 }} />

                    <Button
                        variant="outlined"
                        onClick={handleYandexLogin}
                        sx={{ mt: 2, width: "100%", py: 1.5 }}
                    >
                        Войти через Яндекс
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default AuthForm;