import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaLeaf } from 'react-icons/fa';

const API_URL = 'http://127.0.0.1:5000';

export default function ConfirmEmail() {
    const { token }  = useParams();
    const navigate   = useNavigate();
    const calledRef  = useRef(false); // предотвратява двойно извикване в Strict Mode

    useEffect(() => {
        if (!token) { navigate('/confirmed?status=invalid'); return; }
        if (calledRef.current) return; // вече е извикано
        calledRef.current = true;

        fetch(`${API_URL}/confirm/${token}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
            .then(res => res.json())
            .then(data => navigate(`/confirmed?status=${data.status || 'invalid'}`))
            .catch(() => navigate('/confirmed?status=invalid'));
    }, [token, navigate]);

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a4a1a 0%, #2d5a27 50%, #4a7c3f 100%)',
            flexDirection: 'column', gap: 16
        }}>
            <FaLeaf size={50} color="rgba(255,255,255,0.8)" />
            <div style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Потвърждаване на акаунт...</div>
        </div>
    );
}