import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, adminOnly = false }) {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (adminOnly && role !== 'ADMIN') {
        return <Navigate to="/" />;
    }

    return children;
}

export default PrivateRoute;