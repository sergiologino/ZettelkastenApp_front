import React from "react";
import AuthForm from "./AuthForm";
import { Box, Typography } from "@mui/material";

const AuthPage =({ resetAppState, loadProjectsAndSelectFirst })=> {
    return (
    <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
            height="100vh"
            bgcolor="#f5f5f5"
        >
            <Typography variant="h4" gutterBottom>
                Добро пожаловать в приложение заметок!
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Войдите или зарегистрируйтесь, чтобы продолжить.
            </Typography>
        <AuthForm resetAppState={resetAppState} loadProjectsAndSelectFirst={loadProjectsAndSelectFirst} /> {/* ✅ Передаем resetAppState */}
        </Box>
    );
};

export default AuthPage;
