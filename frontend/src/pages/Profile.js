import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaLock, FaCheck, FaTimes, FaEdit, FaLeaf } from 'react-icons/fa';
import { getProfile, updateProfile } from '../services/api';

const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1.5px solid #d1fae5',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
    background: 'white', boxSizing: 'border-box', transition: 'border-color .2s'
};
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' };

export default function Profile() {
    const [profile, setProfile]       = useState(null);
    const [loading, setLoading]       = useState(true);
    const [editMode, setEditMode]     = useState(false);
    const [saving, setSaving]         = useState(false);
    const [success, setSuccess]       = useState('');
    const [error, setError]           = useState('');

    const [form, setForm] = useState({
        first_name: '', last_name: '', email: '',
        current_password: '', new_password: '', confirm_password: ''
    });

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const res = await getProfile();
            setProfile(res.data);
            setForm(f => ({
                ...f,
                first_name: res.data.first_name || '',
                last_name:  res.data.last_name  || '',
                email:      res.data.email      || '',
            }));
        } catch {
            setError('Грешка при зареждане на профила!');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.new_password && form.new_password !== form.confirm_password) {
            setError('Новите пароли не съвпадат!');
            return;
        }
        setSaving(true); setError('');
        try {
            const payload = {
                first_name: form.first_name,
                last_name:  form.last_name,
                email:      form.email,
            };
            if (form.new_password) {
                payload.current_password = form.current_password;
                payload.new_password     = form.new_password;
            }
            await updateProfile(payload);
            setSuccess('Профилът е обновен успешно!');
            setEditMode(false);
            setForm(f => ({ ...f, current_password: '', new_password: '', confirm_password: '' }));
            fetchProfile();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Грешка при запазване!');
        } finally {
            setSaving(false);
        }
    };

    const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const initials = profile
        ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
        : '';

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
            <FaLeaf size={40} color="#22c55e" />
            <span style={{ color: '#166534', fontWeight: 600 }}>Зареждане...</span>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8fdf8', padding: '40px 20px' }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg,#1a4a1a,#2d5a27,#4a7c3f)', borderRadius: 20, padding: '32px', color: 'white', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 'bold', flexShrink: 0 }}>
                        {initials}
                    </div>
                    <div>
                        <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 'bold' }}>
                            {profile?.first_name} {profile?.last_name}
                        </h1>
                        <div style={{ opacity: .85, fontSize: 14 }}>@{profile?.username}</div>
                        <div style={{ opacity: .75, fontSize: 13, marginTop: 4 }}>
                            {profile?.role === 'ADMIN' ? '⚙️ Администратор' : '🌿 Потребител'} · Регистриран на {profile?.created_at}
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                {success && (
                    <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10, padding: '12px 16px', color: '#15803d', marginBottom: 16 }}>
                        ✅ {success}
                    </div>
                )}
                {error && (
                    <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', color: '#991b1b', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                        ⚠️ {error}
                        <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b' }}><FaTimes /></button>
                    </div>
                )}

                {/* Card */}
                <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e8f5e9', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, color: '#1a3c17', fontSize: 16 }}>Лични данни</h3>
                        {!editMode && (
                            <button onClick={() => { setEditMode(true); setError(''); }}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: '#f0fdf4', color: '#2d5a27', border: '1px solid #d1fae5', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                                <FaEdit size={12} /> Редактирай
                            </button>
                        )}
                    </div>

                    <div style={{ padding: 24 }}>
                        {!editMode ? (
                            /* View mode */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {[
                                    { icon: <FaUser />, label: 'Пълно име', value: `${profile?.first_name} ${profile?.last_name}` },
                                    { icon: <FaUser />, label: 'Потребителско име', value: `@${profile?.username}` },
                                    { icon: <FaEnvelope />, label: 'Имейл', value: profile?.email },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: '#f8fdf8', borderRadius: 10 }}>
                                        <span style={{ color: '#2d5a27', fontSize: 16 }}>{item.icon}</span>
                                        <div>
                                            <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>{item.label}</div>
                                            <div style={{ fontSize: 15, color: '#1f2937', fontWeight: 500, marginTop: 2 }}>{item.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Edit mode */
                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                                    <div>
                                        <label style={labelStyle}>Име</label>
                                        <input style={inputStyle} value={form.first_name} onChange={e => f('first_name', e.target.value)} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Фамилия</label>
                                        <input style={inputStyle} value={form.last_name} onChange={e => f('last_name', e.target.value)} />
                                    </div>
                                </div>

                                <div style={{ marginBottom: 20 }}>
                                    <label style={labelStyle}>Имейл</label>
                                    <input style={inputStyle} type="email" value={form.email} onChange={e => f('email', e.target.value)} />
                                </div>

                                <div style={{ borderTop: '1px solid #f0fdf4', paddingTop: 20, marginBottom: 14 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FaLock size={12} color="#2d5a27" /> Смяна на парола <span style={{ fontWeight: 400, color: '#9ca3af' }}>(незадължително)</span>
                                    </div>
                                    <div style={{ marginBottom: 12 }}>
                                        <label style={labelStyle}>Текуща парола</label>
                                        <input style={inputStyle} type="password" value={form.current_password} onChange={e => f('current_password', e.target.value)} placeholder="Въведи текущата парола" />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                        <div>
                                            <label style={labelStyle}>Нова парола</label>
                                            <input style={inputStyle} type="password" value={form.new_password} onChange={e => f('new_password', e.target.value)} placeholder="Мин. 8 символа" />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Потвърди паролата</label>
                                            <input style={inputStyle} type="password" value={form.confirm_password} onChange={e => f('confirm_password', e.target.value)} placeholder="Повтори паролата" />
                                        </div>
                                    </div>
                                    {form.new_password && form.confirm_password && (
                                        <div style={{ fontSize: 12, marginTop: 6, color: form.new_password === form.confirm_password ? '#15803d' : '#dc2626' }}>
                                            {form.new_password === form.confirm_password ? '✅ Паролите съвпадат' : '❌ Паролите не съвпадат'}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button type="button" onClick={() => { setEditMode(false); setError(''); }}
                                        style={{ flex: 1, padding: 11, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
                                        Откажи
                                    </button>
                                    <button type="submit" disabled={saving}
                                        style={{ flex: 1, padding: 11, background: saving ? '#9ca3af' : '#2d5a27', color: 'white', border: 'none', borderRadius: 10, cursor: saving ? 'default' : 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                        <FaCheck size={12} /> {saving ? 'Запазване...' : 'Запази'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}