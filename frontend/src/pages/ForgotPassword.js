import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { forgotPassword } from '../services/api';

export default function ForgotPassword() {
    const [email, setEmail]     = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent]       = useState(false);
    const [error, setError]     = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await forgotPassword({ email });
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Грешка при изпращане!');
        } finally {
            setLoading(false);
        }
    };

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

            <div style={{ background: 'white', borderRadius: 20, padding: '40px', width: 420, boxShadow: '0 25px 60px rgba(0,0,0,0.3)', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <FaLeaf size={50} color="#2d5a27" />
                    <h2 style={{ color: '#2d5a27', fontWeight: 'bold', fontSize: 26, margin: '10px 0 5px' }}>GreenEstate</h2>
                    <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Забравена парола</p>
                </div>

                {sent ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 12, padding: '20px', marginBottom: 24 }}>
                            <div style={{ fontSize: 40, marginBottom: 10 }}>📧</div>
                            <h3 style={{ color: '#15803d', margin: '0 0 8px' }}>Имейлът е изпратен!</h3>
                            <p style={{ color: '#166534', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                                Ако имейл адресът съществува в системата, ще получиш линк за смяна на паролата. Провери си входящата поща.
                            </p>
                        </div>
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            <button style={{ width: '100%', padding: 13, background: '#2d5a27', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 'bold', cursor: 'pointer' }}>
                                Към страницата за вход
                            </button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <p style={{ color: '#555', fontSize: 14, lineHeight: 1.7, marginBottom: 24, textAlign: 'center' }}>
                            Въведи имейл адреса си и ще ти изпратим линк за смяна на паролата.
                        </p>

                        {error && (
                            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#991b1b', marginBottom: 16, fontSize: 13 }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ position: 'relative', marginBottom: 20 }}>
                                <FaEnvelope style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} color="#2d5a27" />
                                <input
                                    type="email" placeholder="Имейл адрес"
                                    value={email} onChange={e => setEmail(e.target.value)} required
                                    style={{ width: '100%', padding: '13px 13px 13px 42px', border: '2px solid #e0e0e0', borderRadius: 12, fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <button type="submit" disabled={loading}
                                style={{ width: '100%', padding: 13, background: loading ? '#888' : '#2d5a27', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 'bold', cursor: loading ? 'default' : 'pointer' }}>
                                {loading ? 'Изпращане...' : 'Изпрати линк →'}
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