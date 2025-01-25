import React, { useState } from "react";
import { AppBar, Toolbar, TextField, Button, Typography, Switch } from "@mui/material";
import { useNavigate } from "react-router-dom";

const TopNavBar = ({ onSearch, onToggleTheme, balance }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        onSearch(e.target.value);
    };

    const handleProfile = () => {
        navigate("/profile");
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
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
                <Switch onChange={onToggleTheme} />
                <Typography variant="body1" sx={{ mx: 2 }}>
                    Баланс: ${balance}
                </Typography>
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