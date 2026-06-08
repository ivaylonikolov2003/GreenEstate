import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaLeaf, FaIdCard } from 'react-icons/fa';
import { register } from '../services/api';

function Register() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        confirm_password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirm_password) {
            setError('Паролите не съвпадат!');
            setLoading(false);
            return;
        }

        try {
            await register({
                first_name: formData.first_name,
                last_name: formData.last_name,
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            setSuccess(formData.email);
        } catch (err) {
            setError(err.response?.data?.message || 'Грешка при регистрация!');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = (name) => ({
        width: '100%',
        padding: '14px 14px 14px 42px',
        border: `2px solid ${focusedInput === name ? '#2d5a27' : '#e0e0e0'}`,
        borderRadius: '12px',
        fontSize: '15px',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s',
        boxShadow: focusedInput === name ? '0 0 0 3px rgba(45,90,39,0.1)' : 'none'
    });

    const iconStyle = {
        position: 'absolute',
        left: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a4a1a 0%, #2d5a27 50%, #4a7c3f 100%)',
            position: 'relative',
            overflow: 'hidden',
            padding: '20px'
        }}>
            {/* Декоративни листа */}
            {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    bottom: `${10 + i * 5}%`,
                    left: `${10 + i * 15}%`,
                    opacity: 0.15
                }}>
                    <FaLeaf color="white" size={30 + i * 5} />
                </div>
            ))}

            {/* Карта */}
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '40px',
                width: '480px',
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
                        Създай нов акаунт
                    </p>
                </div>

                {success ? (
                    /* ── Успешна регистрация ── */
                    <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%',
                            background: '#f0fdf4', border: '3px solid #86efac',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <FaEnvelope size={30} color="#16a34a" />
                        </div>
                        <h3 style={{ color: '#2d5a27', fontSize: '20px', margin: '0 0 10px' }}>
                            Провери имейла си!
                        </h3>
                        <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.6, margin: '0 0 6px' }}>
                            Изпратихме линк за потвърждение на
                        </p>
                        <p style={{ color: '#2d5a27', fontWeight: 700, fontSize: '15px', margin: '0 0 20px', wordBreak: 'break-all' }}>
                            {success}
                        </p>
                        <p style={{ color: '#888', fontSize: '13px', margin: '0 0 24px', lineHeight: 1.6 }}>
                            След като потвърдиш имейла си, ще можеш да влезеш в профила си.
                        </p>
                        <Link to="/login" style={{
                            display: 'inline-block', padding: '12px 32px',
                            background: '#2d5a27', color: 'white', borderRadius: '12px',
                            fontWeight: 700, fontSize: '15px', textDecoration: 'none'
                        }}>
                            Към вход →
                        </Link>
                    </div>
                ) : (
                    /* ── Форма ── */
                    <div>
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

                        <form onSubmit={handleSubmit}>
                            {/* Две колони за имена */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ position: 'relative' }}>
                                    <FaIdCard style={iconStyle} color="#2d5a27" />
                                    <input
                                        type="text"
                                        name="first_name"
                                        placeholder="Собствено име"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedInput('first_name')}
                                        onBlur={() => setFocusedInput(null)}
                                        required
                                        style={inputStyle('first_name')}
                                    />
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <FaIdCard style={iconStyle} color="#2d5a27" />
                                    <input
                                        type="text"
                                        name="last_name"
                                        placeholder="Фамилия"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedInput('last_name')}
                                        onBlur={() => setFocusedInput(null)}
                                        required
                                        style={inputStyle('last_name')}
                                    />
                                </div>
                            </div>

                            {/* Username */}
                            <div style={{ position: 'relative', marginBottom: '16px' }}>
                                <FaUser style={iconStyle} color="#2d5a27" />
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Потребителско име"
                                    value={formData.username}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedInput('username')}
                                    onBlur={() => setFocusedInput(null)}
                                    required
                                    style={inputStyle('username')}
                                />
                            </div>

                            {/* Email */}
                            <div style={{ position: 'relative', marginBottom: '16px' }}>
                                <FaEnvelope style={iconStyle} color="#2d5a27" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Имейл адрес"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedInput('email')}
                                    onBlur={() => setFocusedInput(null)}
                                    required
                                    style={inputStyle('email')}
                                />
                            </div>

                            {/* Password */}
                            <div style={{ position: 'relative', marginBottom: '16px' }}>
                                <FaLock style={iconStyle} color="#2d5a27" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Парола (мин. 8 символа)"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedInput('password')}
                                    onBlur={() => setFocusedInput(null)}
                                    required
                                    style={inputStyle('password')}
                                />
                            </div>

                            {/* Confirm Password */}
                            <div style={{ position: 'relative', marginBottom: '16px' }}>
                                <FaLock style={iconStyle} color="#2d5a27" />
                                <input
                                    type="password"
                                    name="confirm_password"
                                    placeholder="Потвърди паролата"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedInput('confirm_password')}
                                    onBlur={() => setFocusedInput(null)}
                                    required
                                    style={inputStyle('confirm_password')}
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
                                {loading ? 'Регистрация...' : 'Регистрирай се →'}
                            </button>
                        </form>

                        {/* Footer */}
                        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#666' }}>
                            <span>Вече имаш акаунт? </span>
                            <Link to="/login" style={{ color: '#2d5a27', fontWeight: 'bold', textDecoration: 'none' }}>
                                Влез
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Register;