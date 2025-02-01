import React, { useState, useEffect } from "react";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
import {
    TextField,
    Button,
    Box,
    Typography,
    Container,
    Paper,
    Switch,
    FormControlLabel,
    Avatar,
    IconButton,
} from "@mui/material";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { PhotoCamera } from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import { useSnackbar } from "notistack";

const Profile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // const { enqueueSnackbar } = useSnackbar();
    const enqueueSnackbar = (message, options) => {
        console.log(message, options);
    };

    const [user, setUser] = useState(location.state?.user || {});
    const [username, setUsername] = useState(user.username || "");
    const [email, setEmail] = useState(user.email || "");
    const [password, setPassword] = useState("");
    const [colorTheme, setColorTheme] = useState(user.color_theme || false);
    const [tlgUsername, setTlgUsername] = useState(user.tlg_username || "");
    const [phoneNumber, setPhoneNumber] = useState(user.phone_number || "");
    const [billing, setBilling] = useState(user.billing || false);
    const [avatar, setAvatar] = useState(user.avatar || null);
    const [avatarPreview, setAvatarPreview] = useState(user.avatar || "");

    // Загрузка данных пользователя
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const accessToken = localStorage.getItem("accessToken");
                if (accessToken) {
                    const response = await axios.get("/api/users/me", {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });
                    setUser(response.data);
                    setUsername(response.data.username);
                    setEmail(response.data.email);
                    setColorTheme(response.data.color_theme || false);
                    setTlgUsername(response.data.tlg_username || "");
                    setPhoneNumber(response.data.phone_number || "");
                    setBilling(response.data.billing || false);
                    setAvatar(response.data.avatar || "");
                    setAvatarPreview(response.data.avatar || "");
                }
            } catch (error) {
                console.error("Ошибка при загрузке данных пользователя:", error);
            }
        };

        fetchUserData();
    }, []);

    // Валидация Telegram username
    const validateTlgUsername = (username) => {
        const regex = /^@[a-zA-Z0-9_]{5,32}$/;
        return regex.test(username);
    };

    // Валидация номера телефона
    const validatePhoneNumber = (phone) => {
        const regex = /^\+\d{1,3} \(\d{1,3}\) \d{3}-\d{2}-\d{2}$/;
        return regex.test(phone);
    };

    // Обработка загрузки аватара
    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file.size > 400 * 1024) {
            enqueueSnackbar("Файл слишком большой (максимум 400 КБ)", { variant: "error" });
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setAvatarPreview(reader.result);
            setAvatar(file);
        };
        reader.readAsDataURL(file);
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: "image/png, image/jpeg, image/bmp",
        maxSize: 400 * 1024, // 400 КБ
    });

    // Отправка формы
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateTlgUsername(tlgUsername)) {
            enqueueSnackbar("Некорректный формат Telegram username (должно быть @username)", {
                variant: "error",
            });
            return;
        }

        if (!validatePhoneNumber(phoneNumber)) {
            enqueueSnackbar(
                "Некорректный формат номера телефона (должен быть в формате +X (XXX) XXX-XX-XX)",
                { variant: "error" }
            );
            return;
        }

        try {
            const formData = new FormData();
            formData.append("username", username);
            formData.append("email", email);
            formData.append("password", password);
            formData.append("tlg_username", tlgUsername);
            formData.append("phone_number", phoneNumber);
            formData.append("billing", billing);
            if (avatar) {
                formData.append("avatar", avatar);
            }

            const response = await axios.put(`/api/users/${user.id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (response.status === 200) {
                console.log("Профиль успешно обновлён:", response.data);
                setUser(response.data); // ✅ Теперь данные обновятся в UI
                alert("Профиль успешно обновлён!");
            } else {
                console.error("Ошибка при обновлении профиля: ", response.statusText);
                alert("Ошибка при обновлении профиля.");
            }
        } catch (error) {
            console.error("Ошибка при обновлении профиля:", error);
            alert("Ошибка при обновлении профиля. Проверьте данные.");
        }
    };

    const handleCancel = () => {
        navigate(-1); // Возврат на предыдущую страницу
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
                        Профиль
                    </Typography>

                    {/* Аватар */}
                    <Box {...getRootProps()} sx={{ mb: 2, textAlign: "center" }}>
                        <input {...getInputProps()} />
                        <Avatar
                            src={avatarPreview || "/default-avatar.png"}
                            sx={{ width: 100, height: 100, cursor: "pointer" }}
                        />
                        <IconButton color="primary" aria-label="upload avatar">
                            <PhotoCamera />
                        </IconButton>
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            Нажмите для загрузки аватара (PNG, JPG, BMP, до 400 КБ)
                        </Typography>
                    </Box>

                    {/* Логин */}
                    <TextField
                        fullWidth
                        label="Логин"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        margin="normal"
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />

                    {/* Email */}
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />

                    {/* Пароль */}
                    <TextField
                        fullWidth
                        type="password"
                        label="Пароль"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />

                    {/* Telegram username */}
                    <TextField
                        fullWidth
                        label="Telegram username"
                        name="tlg_username"
                        value={tlgUsername}
                        onChange={(e) => setTlgUsername(e.target.value)}
                        margin="normal"
                        variant="outlined"
                        sx={{ mb: 2 }}
                        placeholder="@username"
                        helperText="Введите Telegram username в формате @username"
                    />

                    {/* Номер телефона */}
                    <TextField
                        fullWidth
                        label="Номер телефона"
                        name="phone_number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        margin="normal"
                        variant="outlined"
                        sx={{ mb: 2 }}
                        placeholder="+X (XXX) XXX-XX-XX"
                        helperText="Введите номер телефона в формате +X (XXX) XXX-XX-XX"
                    />

                    {/* Цветовая тема */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={colorTheme}
                                onChange={(e) => setColorTheme(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Темная тема"
                        sx={{ mb: 2 }}
                    />

                    {/* Премиум аккаунт */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={billing}
                                onChange={(e) => setBilling(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Премиум аккаунт"
                        sx={{ mb: 2 }}
                    />

                    {/* Кнопки */}
                    <Box display="flex" justifyContent="space-between" width="100%">
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleCancel}
                            sx={{ mt: 2, width: "48%" }}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            sx={{ mt: 2, width: "48%" }}
                        >
                            Сохранить изменения
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Profile;