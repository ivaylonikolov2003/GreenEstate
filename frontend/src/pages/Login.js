import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaLeaf } from 'react-icons/fa';
import { login } from '../services/api';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const [sessionExpired] = useState(() => {
        const expired = sessionStorage.getItem('session_expired');
        if (expired) sessionStorage.removeItem('session_expired');
        return !!expired;
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await login(formData);
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('user_id', response.data.user_id);
            localStorage.setItem('username', response.data.username);
            localStorage.setItem('role', response.data.role);
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.message || 'Грешка при влизане!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a4a1a 0%, #2d5a27 50%, #4a7c3f 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Декоративни листа */}
            {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    bottom: `${10 + i * 5}%`,
                    left: `${10 + i * 15}%`,
                    opacity: 0.15,
                    fontSize: `${20 + i * 5}px`
                }}>
                    <FaLeaf color="white" size={30 + i * 5} />
                </div>
            ))}

            {/* Карта */}
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '40px',
                width: '420px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Лого */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <FaLeaf size={50} color="#2d5a27" />
                    <h2 style={{ color: '#2d5a27', fontWeight: 'bold', fontSize: '28px', margin: '10px 0 5px' }}>
                        GreenEstate
                    </h2>
                    <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
                        Влез в своя акаунт
                    </p>
                </div>

                {/* Изтекла сесия */}
                {sessionExpired && (
                    <div style={{
                        background: '#fef9c3',
                        border: '1px solid #fde047',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        color: '#854d0e',
                        marginBottom: '16px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        ⏱️ Сесията ти изтече. Моля влез отново.
                    </div>
                )}

                {/* Грешка */}
                {error && (
                    <div style={{
                        background: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        color: '#c00',
                        marginBottom: '20px',
                        fontSize: '14px'
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Форма */}
                <form onSubmit={handleSubmit}>
                    {/* Username */}
                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                        <FaUser style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 1
                        }} color="#2d5a27" />
                        <input
                            type="text"
                            name="username"
                            placeholder="Потребителско име"
                            value={formData.username}
                            onChange={handleChange}
                            onFocus={() => setFocusedInput('username')}
                            onBlur={() => setFocusedInput(null)}
                            required
                            style={{
                                width: '100%',
                                padding: '14px 14px 14px 42px',
                                border: `2px solid ${focusedInput === 'username' ? '#2d5a27' : '#e0e0e0'}`,
                                borderRadius: '12px',
                                fontSize: '15px',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.3s',
                                boxShadow: focusedInput === 'username' ? '0 0 0 3px rgba(45,90,39,0.1)' : 'none'
                            }}
                        />
                    </div>

                    {/* Password */}
                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                        <FaLock style={{
                            position: 'absolute',
                            left: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 1
                        }} color="#2d5a27" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Парола"
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() => setFocusedInput('password')}
                            onBlur={() => setFocusedInput(null)}
                            required
                            style={{
                                width: '100%',
                                padding: '14px 14px 14px 42px',
                                border: `2px solid ${focusedInput === 'password' ? '#2d5a27' : '#e0e0e0'}`,
                                borderRadius: '12px',
                                fontSize: '15px',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.3s',
                                boxShadow: focusedInput === 'password' ? '0 0 0 3px rgba(45,90,39,0.1)' : 'none'
                            }}
                        />
                    </div>

                    {/* Бутон */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: loading ? '#888' : '#2d5a27',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginTop: '8px',
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={e => { if (!loading) e.target.style.background = '#1e3d1a' }}
                        onMouseOut={e => { if (!loading) e.target.style.background = '#2d5a27' }}
                    >
                        {loading ? 'Влизане...' : 'Вход →'}
                    </button>
                </form>

                {/* Footer */}
                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
                    <Link to="/forgot-password" style={{ color: '#2d5a27', textDecoration: 'none' }}>
                        Забравена парола?
                    </Link>
                </div>
                <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '14px', color: '#666' }}>
                    <span>Нямаш акаунт? </span>
                    <Link to="/register" style={{ color: '#2d5a27', fontWeight: 'bold', textDecoration: 'none' }}>
                        Регистрирай се
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;