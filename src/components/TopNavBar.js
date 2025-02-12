import React, { useState, useEffect } from "react";
import {AppBar, Toolbar, IconButton, Button, Typography, Avatar, Box, Paper, InputBase} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { Search as SearchIcon, AccountCircle } from "@mui/icons-material";
import logo from "../logo.svg"; // ✅ Подключаем логотип
import api from "../api/api";
import ProfileModal from "./Profile";

const SearchContainer = styled(Paper)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    width: 300,
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.grey[200],
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    flex: 1,
    marginLeft: theme.spacing(1),
}));



const TopNavBar = ({ onSearchResults , onToggleTheme, balance, resetAppState }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [user, setUser] = useState(null);
    const [profileOpen, setProfileOpen] =useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const accessToken = localStorage.getItem("accessToken");
                if (accessToken) {
                    const response = await api.get("/users/me");
                    // console.log("Content-Type ответа:", response.headers["content-type"]);
                    // console.log("Полученные данные пользователя:", response.data);
                    setUser(response.data); // ✅ Загружаем пользователя при старте
                }
            } catch (error) {
                console.error("Ошибка при загрузке данных пользователя:", error);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        if (user?.avatarUrl) {
            // console.log("Обновленный аватар в TopNavBar:", user.avatarUrl);
        }
    }, [user?.avatarUrl]);


    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            const response = await api.get(`/notes/search`, {
                params: { query: searchQuery }
            });
            onSearchResults(response.data); // Передаем результаты поиска в родительский компонент
        } catch (error) {
            console.error("Ошибка при поиске:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        resetAppState();
        navigate("/auth");
    };

    // {console.log("Передача open в ProfileModal:", profileOpen)}
    return (
        <AppBar position="static">
            <Toolbar sx={{display: "flex", justifyContent: "space-between", alignItems: "left"}}>
                {/* Логотип + название */}
                <Box sx={{display: "flex", alignItems: "center"}}>
                    <img src={logo} alt="Логотип" style={{width: 40, height: 40, marginRight: 10}}/>
                    <Typography variant="h6" noWrap sx={{fontWeight: "bold", color: "white"}}>
                        Alta Note
                    </Typography>
                </Box>
                {/* Поле поиска с кнопкой лупы */}
                <SearchContainer>
                    <StyledInputBase
                        placeholder="Поиск..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <IconButton onClick={handleSearch}>
                        <SearchIcon />
                    </IconButton>
                </SearchContainer>


                {/* ✅ Баланс, имя пользователя и аватар */}
                <Box sx={{display: "flex", alignItems: "center", mx: 2}}>
                    <Typography variant="body1" sx={{mr: 2}}>
                        Баланс: {balance} руб.
                    </Typography>
                    {user && (
                        <>
                            <Avatar
                                src={user.avatar ? user.avatar : process.env.PUBLIC_URL + "/default-avatar.png"}
                                alt={user.username}
                                sx={{width: 32, height: 32, mr: 1}}
                            />
                            <Typography variant="body1">{user.username}</Typography>
                            {/* ✅ Проверяем, что передаём проп `open` корректно */}
                            <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
                        </>
                    )}
                </Box>

                <IconButton color="inherit" onClick={() => {
                    // console.log("Клик по кнопке профиля");
                    setProfileOpen(true);
                }}>
                    <AccountCircle/>
                    <Typography variant="body1" sx={{mr: 2}}>
                        Профиль
                    </Typography>
                </IconButton>
                <Button color="inherit" onClick={handleLogout}>
                    Выйти
                </Button>
            </Toolbar>
        </AppBar>
    );
};
export default TopNavBar;
