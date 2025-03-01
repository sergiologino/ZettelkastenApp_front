import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const accessToken = localStorage.getItem('accessToken');

    // Если токен отсутствует, перенаправляем на страницу входа
    if (!accessToken) {
        return <Navigate to="/auth" />;
    }

    // Если токен есть, отображаем защищенный компонент
    return children;
};

export default PrivateRoute;