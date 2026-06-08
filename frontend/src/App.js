import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Properties from './pages/Properties';
import Plants from './pages/Plants';
import GardenPlan from './pages/GardenPlan';
import Admin from './pages/Admin';
import NavbarComponent from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Confirmed from './pages/Confirmed';
import ConfirmEmail from './pages/ConfirmEmail';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';

function App() {
    return (
        <Router>
            <NavbarComponent />
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/confirmed" element={<Confirmed />} />
                <Route path="/confirm/:token" element={<ConfirmEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={
                    <PrivateRoute>
                        <Home />
                    </PrivateRoute>
                } />
                <Route path="/properties" element={
                    <PrivateRoute>
                        <Properties />
                    </PrivateRoute>
                } />
                <Route path="/plants" element={
                    <PrivateRoute>
                        <Plants />
                    </PrivateRoute>
                } />
                <Route path="/garden-plan/:id" element={
                    <PrivateRoute>
                        <GardenPlan />
                    </PrivateRoute>
                } />
                <Route path="/admin" element={
                    <PrivateRoute adminOnly={true}>
                        <Admin />
                    </PrivateRoute>
                } />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;