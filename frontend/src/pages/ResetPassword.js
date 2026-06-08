import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FaLeaf, FaLock, FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { resetPassword } from '../services/api';

export default function ResetPassword() {
    const [searchParams]          = useSearchParams();
    const navigate                = useNavigate();
    const token                   = searchParams.get('token') || '';

    const [password, setPassword]       = useState('');
    const [confirm, setConfirm]         = useState('');
    const [loading, setLoading]         = useState(false);
    const [success, setSuccess]         = useState(false);
    const [error, setError]             = useState('');
    const [focusedInput, setFocused]    = useState(null);

    const passwordMatch = confirm && password === confirm;
    const passwordLong  = password.length >= 8;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) { setError('Паролите не съвпадат!'); return; }
        if (!passwordLong) { setError('Паролата трябва да е поне 8 символа!'); return; }
        setLoading(true); setError('');
        try {
            await resetPassword({ token, password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Грешка при смяна на паролата!');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = (name) => ({
        width: '100%', padding: '13px 13px 13px 42px',
        border: `2px solid ${focusedInput === name ? '#2d5a27' : '#e0e0e0'}`,
        borderRadius: 12, fontSize: 15, outline: 'none', boxSizing: 'border-box',
        transition: 'border-color .3s'
    });

    if (!token) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1a4a1a,#2d5a27,#4a7c3f)', padding: 20 }}>
            <div style={{ background: 'white', borderRadius: 20, padding: 40, width: 400, textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
                <FaTimesCircle size={60} color="#dc2626" />
                <h3 style={{ color: '#1f2937', marginTop: 16 }}>Невалиден линк</h3>
                <p style={{ color: '#6b7280', fontSize: 14 }}>Линкът за смяна на парола е невалиден или изтекъл.</p>
                <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                    <button style={{ width: '100%', padding: 12, background: '#2d5a27', color: 'white', border: 'none', borderRadius: 12, fontWeight: 'bold', cursor: 'pointer', marginTop: 8 }}>
                        Поискай нов линк
                    </button>
                </Link>
            </div>
        </div>
    );

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg,#1a4a1a 0%,#2d5a27 50%,#4a7c3f 100%)',
            position: 'relative', overflow: 'hidden', padding: 20
        }}>
            {[...Array(6)].map((_, i) => (
                <div key={i} style={{ position: 'absolute', bottom: `${10+i*5}%`, left: `${10+i*15}%`, opacity: .15 }}>
                    <FaLeaf color="white" size={30+i*5} />
                </div>
            ))}

            <div style={{ background: 'white', borderRadius: 20, padding: 40, width: 420, boxShadow: '0 25px 60px rgba(0,0,0,0.3)', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <FaLeaf size={50} color="#2d5a27" />
                    <h2 style={{ color: '#2d5a27', fontWeight: 'bold', fontSize: 26, margin: '10px 0 5px' }}>GreenEstate</h2>
                    <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Нова парола</p>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <FaCheckCircle size={60} color="#15803d" />
                        <h3 style={{ color: '#15803d', marginTop: 16 }}>Паролата е сменена!</h3>
                        <p style={{ color: '#555', fontSize: 14 }}>Ще бъдеш пренасочен към страницата за вход...</p>
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            <button style={{ width: '100%', padding: 12, background: '#2d5a27', color: 'white', border: 'none', borderRadius: 12, fontWeight: 'bold', cursor: 'pointer', marginTop: 16 }}>
                                Към вход →
                            </button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#991b1b', marginBottom: 16, fontSize: 13 }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ position: 'relative', marginBottom: 14 }}>
                                <FaLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} color="#2d5a27" />
                                <input type="password" placeholder="Нова парола (мин. 8 символа)"
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                                    required style={inputStyle('password')} />
                            </div>

                            <div style={{ position: 'relative', marginBottom: 8 }}>
                                <FaLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} color="#2d5a27" />
                                <input type="password" placeholder="Потвърди новата парола"
                                    value={confirm} onChange={e => setConfirm(e.target.value)}
                                    onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)}
                                    required style={inputStyle('confirm')} />
                            </div>

                            {/* Validation hints */}
                            <div style={{ marginBottom: 20, fontSize: 12 }}>
                                <div style={{ color: passwordLong ? '#15803d' : '#9ca3af', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                                    {passwordLong ? '✅' : '○'} Поне 8 символа
                                </div>
                                {confirm && (
                                    <div style={{ color: passwordMatch ? '#15803d' : '#dc2626', display: 'flex', alignItems: 'center', gap: 5 }}>
                                        {passwordMatch ? '✅' : '❌'} Паролите {passwordMatch ? 'съвпадат' : 'не съвпадат'}
                                    </div>
                                )}
                            </div>

                            <button type="submit" disabled={loading}
                                style={{ width: '100%', padding: 13, background: loading ? '#888' : '#2d5a27', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 'bold', cursor: loading ? 'default' : 'pointer' }}>
                                {loading ? 'Запазване...' : 'Смени паролата →'}
                            </button>
                        </form>

                        <div style={{ textAlign: 'center', marginTop: 20 }}>
                            <Link to="/login" style={{ color: '#2d5a27', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <FaArrowLeft size={12} /> Обратно към вход
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}