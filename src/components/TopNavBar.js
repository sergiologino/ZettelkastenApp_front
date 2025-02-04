import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, TextField, Button, Typography, Avatar, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const TopNavBar = ({ onSearch, onToggleTheme, balance, resetAppState }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        onSearch(e.target.value);
    };

    const handleProfile = async () => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            if (accessToken) {
                const response = await api.get("/users/me");
                console.log("ответ с профилем: ", response.data);
                setUser(response.data); // ✅ Сохраняем данные пользователя
                navigate("/profile", { state: { user: response.data } });
            } else {
                navigate("/profile");
            }
        } catch (error) {
            console.error("Ошибка при получении данных пользователя:", error);
            navigate("/profile");
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const accessToken = localStorage.getItem("accessToken");
                if (accessToken) {
                    const response = await api.get("/users/me");
                    setUser(response.data); // ✅ Загружаем пользователя при старте
                }
            } catch (error) {
                console.error("Ошибка при загрузке данных пользователя:", error);
            }
        };
        fetchUserData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        resetAppState();
        navigate("/auth");
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Note App
                </Typography>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Поиск заметок..."
                    value={searchQuery}
                    onChange={handleSearch}
                    sx={{ mx: 2 }}
                />

                {/* ✅ Баланс, имя пользователя и аватар */}
                <Box sx={{ display: "flex", alignItems: "center", mx: 2 }}>
                    <Typography variant="body1" sx={{ mr: 2 }}>
                        Баланс: {balance} руб.
                    </Typography>
                    {user && (
                        <>
                            <Avatar
                                src={user.avatar || "/default-avatar.png"}
                                alt={user.username}
                                sx={{ width: 32, height: 32, mr: 1 }}
                            />
                            <Typography variant="body1">{user.username}</Typography>
                        </>
                    )}
                </Box>

                <Button color="inherit" onClick={handleProfile}>
                    Профиль
                </Button>
                <Button color="inherit" onClick={handleLogout}>
                    Выйти
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default TopNavBar;
