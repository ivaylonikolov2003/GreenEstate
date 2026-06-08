import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBuilding, FaSeedling, FaMap, FaCog, FaLeaf, FaRuler, FaEuroSign } from 'react-icons/fa';
import { getStats } from '../services/api';

function Home() {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        getStats().then(res => setStats(res.data)).catch(() => {});
    }, []);

    const cards = [
        {
            icon: <FaBuilding size={40} color="#2d5a27" />,
            title: 'Моите имоти',
            description: 'Добавяй и управлявай своите имоти. Задавай характеристики като площ, тип почва и слънчево изложение за по-точни препоръки.',
            link: '/properties',
            buttonText: 'Към имотите'
        },
        {
            icon: <FaSeedling size={40} color="#2d5a27" />,
            title: 'Каталог с растения',
            description: 'Разгледай пълния каталог с растения подходящи за озеленяване. Получи персонализирани препоръки според характеристиките на твоя имот и бюджет.',
            link: '/plants',
            buttonText: 'Към растенията'
        },
        {
            icon: <FaMap size={40} color="#2d5a27" />,
            title: 'Планове за озеленяване',
            description: 'Създавай визуални планове за озеленяване с drag-and-drop интерфейс. Изчислявай разходите и генерирай професионални оферти в PDF формат.',
            link: '/properties',
            buttonText: 'Към плановете',
            note: 'Избери имот от списъка, за да достъпиш плановете му'
        }
    ];

    if (role === 'ADMIN') {
        cards.push({
            icon: <FaCog size={40} color="#2d5a27" />,
            title: 'Администрация',
            description: 'Управлявай каталога с растения — добавяй нови видове, задавай цени и региони на разпространение.',
            link: '/admin',
            buttonText: 'Към администрацията'
        });
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f8fdf8' }}>
            {/* Хедър */}
            <div style={{
                background: 'linear-gradient(135deg, #1a4a1a 0%, #2d5a27 50%, #4a7c3f 100%)',
                padding: '60px 20px',
                textAlign: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Декоративни листа в хедъра */}
                {[...Array(5)].map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        bottom: `${i * 10}%`,
                        left: `${i * 20}%`,
                        opacity: 0.1
                    }}>
                        <FaLeaf color="white" size={40 + i * 10} />
                    </div>
                ))}

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <FaLeaf size={50} color="rgba(255,255,255,0.9)" style={{ marginBottom: '15px' }} />
                    <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 10px' }}>
                        Добре дошъл, {username}!
                    </h1>
                    <p style={{ fontSize: '17px', opacity: 0.85, margin: '0 auto', maxWidth: '600px', lineHeight: '1.6' }}>
                        Планирай озеленяването на своите имоти, получавай препоръки за подходящи растения
                        и изчислявай разходите с помощта на GreenEstate.
                    </p>
                </div>
            </div>

            {/* Stats Section */}
            {stats && (stats.properties_count > 0 || stats.plans_count > 0) && (
                <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '30px 20px 0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 10 }}>
                        {[
                            { icon: <FaBuilding size={22} color="#2d5a27" />, label: 'Моите имоти', value: stats.properties_count, unit: 'бр.' },
                            { icon: <FaMap size={22} color="#2d5a27" />, label: 'Планове', value: stats.plans_count, unit: 'бр.' },
                            { icon: <FaRuler size={22} color="#2d5a27" />, label: 'Обща площ', value: stats.total_area, unit: 'кв.м.' },
                            { icon: <FaEuroSign size={22} color="#2d5a27" />, label: 'Общ бюджет', value: stats.total_budget, unit: 'EUR' },
                        ].map((s, i) => (
                            <div key={i} style={{ background: 'white', borderRadius: 16, padding: '18px 22px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', border: '1px solid #e8f5e9', display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 48, height: 48, background: '#f0fdf4', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {s.icon}
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>{s.label}</div>
                                    <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1a3c17', marginTop: 2 }}>
                                        {s.value} <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 400 }}>{s.unit}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Карти */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '50px 20px' }}>
                <h2 style={{ color: '#2d5a27', fontSize: '22px', marginBottom: '24px', fontWeight: 'bold' }}>
                    Какво можеш да направиш?
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px'
                }}>
                    {cards.map((card, i) => (
                        <div key={i} style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '30px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            textAlign: 'center',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            border: '1px solid #e8f5e9'
                        }}
                            onMouseOver={e => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 8px 30px rgba(45,90,39,0.15)';
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                            }}
                        >
                            <div style={{ marginBottom: '16px' }}>
                                {card.icon}
                            </div>
                            <h3 style={{ color: '#2d5a27', fontSize: '20px', margin: '0 0 10px' }}>
                                {card.title}
                            </h3>
                            <p style={{ color: '#666', fontSize: '14px', margin: '0 0 24px', lineHeight: '1.7' }}>
                                {card.description}
                            </p>
                            {card.note && (
                                <p style={{ fontSize: '12px', color: '#888', margin: '0 0 10px', fontStyle: 'italic' }}>
                                    💡 {card.note}
                                </p>
                            )}
                            <Link to={card.link} style={{ textDecoration: 'none' }}>
                                <button style={{
                                    padding: '10px 24px',
                                    background: '#2d5a27',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '20px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                                    onMouseOver={e => e.target.style.background = '#1e3d1a'}
                                    onMouseOut={e => e.target.style.background = '#2d5a27'}
                                >
                                    {card.buttonText}
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* За GreenEstate */}
                <div style={{
                    marginTop: '50px',
                    background: 'white',
                    borderRadius: '16px',
                    padding: '30px 40px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e8f5e9',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '20px'
                }}>
                    <FaLeaf size={40} color="#2d5a27" style={{ flexShrink: 0, marginTop: '4px' }} />
                    <div>
                        <h3 style={{ color: '#2d5a27', margin: '0 0 12px', fontSize: '20px' }}>
                            За GreenEstate
                        </h3>
                        <p style={{ color: '#555', lineHeight: '1.8', margin: 0, fontSize: '15px' }}>
                            GreenEstate е платформа за планиране и управление на озеленяването на имоти.
                            Системата анализира характеристиките на твоя имот — регион, тип почва и слънчево изложение —
                            и препоръчва най-подходящите растения. Можеш да създаваш визуални планове за озеленяване,
                            да изчисляваш необходимото количество растения според площта и да генерираш
                            детайлни оферти в PDF формат с пълна разбивка на разходите.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;