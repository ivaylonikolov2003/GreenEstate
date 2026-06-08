import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaLeaf, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';

function Confirmed() {
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status');

    const getContent = () => {
        switch (status) {
            case 'success':
                return {
                    icon: <FaCheckCircle size={70} color="#2d5a27" />,
                    title: 'Акаунтът е потвърден!',
                    message: 'Успешно потвърди своя акаунт. Вече можеш да влезеш в системата.',
                    color: '#2d5a27',
                    bg: '#efe',
                    border: '#cfc'
                };
            case 'already':
                return {
                    icon: <FaExclamationCircle size={70} color="#f0a500" />,
                    title: 'Акаунтът вече е потвърден!',
                    message: 'Твоят акаунт вече е бил потвърден преди това. Можеш да влезеш в системата.',
                    color: '#f0a500',
                    bg: '#fff8e1',
                    border: '#ffe082'
                };
            case 'invalid':
                return {
                    icon: <FaTimesCircle size={70} color="#c00" />,
                    title: 'Невалиден токен!',
                    message: 'Линкът за потвърждение е невалиден или вече е използван.',
                    color: '#c00',
                    bg: '#fee',
                    border: '#fcc'
                };
            default:
                return {
                    icon: <FaExclamationCircle size={70} color="#888" />,
                    title: 'Непознат статус',
                    message: 'Нещо се обърка. Моля опитай отново.',
                    color: '#888',
                    bg: '#f5f5f5',
                    border: '#ddd'
                };
        }
    };

    const content = getContent();

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
                padding: '50px 40px',
                width: '480px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                position: 'relative',
                zIndex: 1,
                textAlign: 'center'
            }}>
                {/* Лого */}
                <div style={{ marginBottom: '30px' }}>
                    <FaLeaf size={40} color="#2d5a27" />
                    <h2 style={{ color: '#2d5a27', fontWeight: 'bold', fontSize: '24px', margin: '10px 0 0' }}>
                        GreenEstate
                    </h2>
                </div>

                {/* Икона на статус */}
                <div style={{ marginBottom: '20px' }}>
                    {content.icon}
                </div>

                {/* Съобщение */}
                <div style={{
                    background: content.bg,
                    border: `1px solid ${content.border}`,
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '30px'
                }}>
                    <h3 style={{ color: content.color, margin: '0 0 10px', fontSize: '20px' }}>
                        {content.title}
                    </h3>
                    <p style={{ color: '#666', margin: 0, fontSize: '15px' }}>
                        {content.message}
                    </p>
                </div>

                {/* Бутон */}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                    <button style={{
                        width: '100%',
                        padding: '14px',
                        background: '#2d5a27',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                        onMouseOver={e => e.target.style.background = '#1e3d1a'}
                        onMouseOut={e => e.target.style.background = '#2d5a27'}
                    >
                        Към страницата за вход →
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default Confirmed;