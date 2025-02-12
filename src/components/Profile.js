import React, { useState, useEffect } from "react";
import {
    TextField,
    Button,
    Avatar,
    IconButton,
    Modal,
    Box,
    Typography,
    Paper,
} from "@mui/material";
import { PhotoCamera, Close } from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import api, { updateAvatar, updateUserProfile } from "../api/api";

console.log("Проверка перед рендерингом ProfileModal");
const ProfileModal  = ({ open = false, onClose }) =>  {
    // console.log("ProfileModal рендерится, open:", open);
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [tlgUsername, setTlgUsername] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    // console.log("открываем профиль");

    useEffect(() => {
        if (open) { // ✅ Загружаем данные только если окно открыто
            const loadUser = async () => {
                try {
                    const response = await api.get("/users/me");

                    // console.log("Данные профиля:", response.data);
                    setUser(response.data);
                    setUsername(response.data.username);
                    setEmail(response.data.email);
                    setTlgUsername(response.data.tlgUsername);
                    setPhoneNumber(response.data.phoneNumber);
                    // console.log("Полученный avatarUrl:", response.data.avatarUrl); // Проверка, что приходит в avatarUrl
                    setAvatarPreview(
                        response.data.avatarUrl && response.data.avatarUrl !== "0"
                            ? response.data.avatarUrl
                            : process.env.PUBLIC_URL + "/default-avatar.png"
                    );
                } catch (error) {
                    console.error("Ошибка загрузки профиля:", error);
                }
            };
            loadUser();
        }
    }, [open]);

    useEffect(() => {
        // console.log("Изменение open:", open);
    }, [open]);

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        setAvatarPreview(URL.createObjectURL(file));
        setAvatar(file);
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: "image/*" });

    const handleAvatarUpload = async () => {
        if (!avatar) return;
        try {
            const formData = new FormData();
            formData.append("avatar", avatar);

            const response = await api.put(`/users/${user.id}/avatar`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // console.log("Ответ сервера после загрузки аватара:", response.data);

            if (response.data.avatarUrl) {
                setAvatarPreview(response.data.avatarUrl);
                setUser(prev => ({ ...prev, avatarUrl: response.data.avatarUrl }));
            }

            alert("Аватар успешно обновлён!");
        } catch (error) {
            console.error("Ошибка обновления аватара:", error);
        }
    };

    const handleSaveProfile = async () => {
        const updatedUser = { username, email, password, tlgUsername, phoneNumber };
        try {
            await updateUserProfile(user.id, updatedUser);
            alert("Профиль успешно обновлён!");
            onClose(); // Закрытие модального окна после сохранения
        } catch (error) {
            console.error("Ошибка обновления профиля:", error);
        }
    };


    // console.log("ProfileModal перед рендерингом JSX, user:", user);
    const avatarSrc = user?.avatarUrl && user.avatarUrl !== "0"
        ? user.avatarUrl
        : process.env.PUBLIC_URL + "/default-avatar.png";

    // console.log("Аватар для рендера:", avatarSrc);

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}
            >
                <Paper elevation={3} sx={{ padding: 4, borderRadius: 2, position: "relative" }}>
                    {/* Кнопка закрытия */}
                    <IconButton
                        onClick={onClose}
                        sx={{ position: "absolute", top: 8, right: 8 }}
                    >
                        <Close />
                    </IconButton>

                    <Typography variant="h5" sx={{ textAlign: "center", mb: 2 }}>
                        Редактирование профиля
                    </Typography>

                    {/* Загрузка аватара */}
                    <div {...getRootProps()} style={{ textAlign: "center", cursor: "pointer" }}>
                        <input {...getInputProps()} />
                        <Avatar src={avatarSrc} />
                        <IconButton color="primary">
                            <PhotoCamera />
                        </IconButton>
                    </div>
                    <Button
                        onClick={handleAvatarUpload}
                        variant="contained"
                        sx={{ marginTop: 2, width: "100%" }}
                    >
                        Сохранить аватар
                    </Button>

                    {/* Поля профиля */}
                    <TextField
                        fullWidth
                        label="Логин"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        type="password"
                        label="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Telegram username"
                        value={tlgUsername}
                        onChange={(e) => setTlgUsername(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Телефон"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        margin="normal"
                    />

                    {/* Кнопки сохранения и отмены */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                        <Button
                            variant="outlined"
                            onClick={onClose}
                            sx={{ width: "48%" }}
                        >
                            Отменить
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSaveProfile}
                            sx={{ width: "48%" }}
                        >
                            Сохранить
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Modal>
    );
};

export default ProfileModal;
