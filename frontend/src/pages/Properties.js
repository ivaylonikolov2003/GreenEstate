import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaLeaf, FaTimes, FaCheck } from 'react-icons/fa';
import { getProperties, createProperty, updateProperty, deleteProperty, getGardenPlans } from '../services/api';

function Properties() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [planCounts, setPlanCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editProperty, setEditProperty] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'HOUSE',
        area_sqm: '',
        green_area_sqm: '',
        width_m: '',
        height_m: '',
        sun_exposure: 'FULL_SUN',
        soil_type: 'LOAMY',
        region: ''
    });

    const typeLabels = { HOUSE: 'Къща', APARTMENT: 'Апартамент', VILLA: 'Вила' };
    const sunLabels = { FULL_SUN: 'Слънчево', PARTIAL_SUN: 'Частично слънчево', SHADE: 'Сянка' };
    const soilLabels = { CLAY: 'Глинеста', SANDY: 'Песъчлива', LOAMY: 'Глинесто-песъчлива', ROCKY: 'Камениста' };

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const response = await getProperties();
            setProperties(response.data);
            // Зареждаме броя планове за всеки имот
            const counts = {};
            await Promise.all(response.data.map(async (prop) => {
                try {
                    const planRes = await getGardenPlans(prop.id);
                    counts[prop.id] = (planRes.data || []).length;
                } catch {
                    counts[prop.id] = 0;
                }
            }));
            setPlanCounts(counts);
        } catch (error) {
            setError('Грешка при зареждане на имотите!');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Валидация на green_area_sqm
        if (formData.green_area_sqm && parseFloat(formData.green_area_sqm) > parseFloat(formData.area_sqm)) {
            setError('Площта за озеленяване не може да е по-голяма от общата площ на имота!');
            return;
        }

        try {
            if (editProperty) {
                await updateProperty(editProperty.id, formData);
            } else {
                await createProperty(formData);
            }
            setShowModal(false);
            setEditProperty(null);
            resetForm();
            fetchProperties();
        } catch (error) {
            setError(error.response?.data?.message || 'Грешка при запазване!');
        }
    };

    const handleEdit = (prop) => {
        setEditProperty(prop);
        setFormData({
            name: prop.name,
            description: prop.description || '',
            type: prop.type,
            area_sqm: prop.area_sqm,
            green_area_sqm: prop.green_area_sqm || '',
            width_m: prop.width_m || '',
            height_m: prop.height_m || '',
            sun_exposure: prop.sun_exposure,
            soil_type: prop.soil_type || 'LOAMY',
            region: prop.region
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Сигурен ли си, че искаш да изтриеш този имот?')) {
            try {
                await deleteProperty(id);
                fetchProperties();
            } catch (error) {
                setError('Грешка при изтриване!');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            type: 'HOUSE',
            area_sqm: '',
            green_area_sqm: '',
            width_m: '',
            height_m: '',
            sun_exposure: 'FULL_SUN',
            soil_type: 'LOAMY',
            region: ''
        });
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 14px',
        border: '2px solid #e0e0e0',
        borderRadius: '10px',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s'
    };

    const selectStyle = {
        ...inputStyle,
        background: 'white',
        cursor: 'pointer'
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fdf8' }}>
            {/* Хедър */}
            <div style={{
                background: 'linear-gradient(135deg, #1a4a1a 0%, #2d5a27 50%, #4a7c3f 100%)',
                padding: '40px 20px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {[...Array(4)].map((_, i) => (
                    <div key={i} style={{ position: 'absolute', bottom: `${i * 15}%`, left: `${i * 25}%`, opacity: 0.1 }}>
                        <FaLeaf color="white" size={35 + i * 8} />
                    </div>
                ))}
                <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <FaBuilding size={30} color="rgba(255,255,255,0.9)" />
                            <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Моите имоти</h1>
                        </div>
                        <p style={{ opacity: 0.85, margin: 0, fontSize: '15px' }}>
                            Управлявай своите имоти и планирай тяхното озеленяване
                        </p>
                    </div>
                    <button
                        onClick={() => { setEditProperty(null); resetForm(); setShowModal(true); }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            background: 'white',
                            color: '#2d5a27',
                            border: 'none',
                            borderRadius: '20px',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                            transition: 'all 0.3s'
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <FaPlus /> Добави имот
                    </button>
                </div>
            </div>

            {/* Съдържание */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
                {error && (
                    <div style={{ background: '#fee', border: '1px solid #fcc', borderRadius: '10px', padding: '12px 16px', color: '#c00', marginBottom: '20px' }}>
                        ⚠️ {error}
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
                        <FaLeaf size={40} color="#2d5a27" />
                        <p style={{ marginTop: '16px', fontSize: '16px' }}>Зареждане...</p>
                    </div>
                ) : properties.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <FaBuilding size={50} color="#ccc" />
                        <h3 style={{ color: '#666', marginTop: '16px' }}>Нямаш добавени имоти</h3>
                        <p style={{ color: '#999' }}>Добави своя първи имот за да започнеш планирането</p>
                        <button
                            onClick={() => { setEditProperty(null); resetForm(); setShowModal(true); }}
                            style={{ padding: '12px 24px', background: '#2d5a27', color: 'white', border: 'none', borderRadius: '20px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginTop: '16px' }}
                        >
                            Добави имот
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                        {properties.map(prop => (
                            <div key={prop.id} style={{
                                background: 'white',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                border: '1px solid #e8f5e9',
                                transition: 'transform 0.3s, box-shadow 0.3s'
                            }}
                                onMouseOver={e => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(45,90,39,0.15)';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                                }}
                            >
                                {/* Горна лента */}
                                <div style={{ background: 'linear-gradient(135deg, #2d5a27, #4a7c3f)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FaBuilding color="white" size={18} />
                                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>{prop.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>
                                            {typeLabels[prop.type]}
                                        </span>
                                        <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            🗺️ {planCounts[prop.id] ?? 0} плана
                                        </span>
                                    </div>
                                </div>

                                {/* Информация */}
                                <div style={{ padding: '20px' }}>
                                    {prop.description && (
                                        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px', fontStyle: 'italic' }}>
                                            {prop.description}
                                        </p>
                                    )}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                                        {[
                                            { label: 'Площ', value: `${prop.area_sqm} кв.м.` },
                                            { label: 'Регион', value: prop.region },
                                            { label: 'Изложение', value: sunLabels[prop.sun_exposure] },
                                            { label: 'Тип почва', value: soilLabels[prop.soil_type] || 'Не е зададен' }
                                        ].map((item, i) => (
                                            <div key={i} style={{ background: '#f8fdf8', borderRadius: '8px', padding: '10px', border: '1px solid #e8f5e9' }}>
                                                <div style={{ fontSize: '11px', color: '#888', marginBottom: '2px' }}>{item.label}</div>
                                                <div style={{ fontSize: '13px', color: '#333', fontWeight: '500' }}>{item.value}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Бутони */}
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => navigate(`/garden-plan/${prop.id}`)}
                                            style={{ flex: 1, padding: '10px', background: '#2d5a27', color: 'white', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                            onMouseOver={e => e.currentTarget.style.background = '#1e3d1a'}
                                            onMouseOut={e => e.currentTarget.style.background = '#2d5a27'}
                                        >
                                            <FaLeaf /> Планове
                                        </button>
                                        <button
                                            onClick={() => handleEdit(prop)}
                                            style={{ padding: '10px 14px', background: '#e8f5e9', color: '#2d5a27', border: 'none', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                            onMouseOver={e => e.currentTarget.style.background = '#c8e6c9'}
                                            onMouseOut={e => e.currentTarget.style.background = '#e8f5e9'}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(prop.id)}
                                            style={{ padding: '10px 14px', background: '#fee', color: '#c00', border: 'none', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                            onMouseOver={e => e.currentTarget.style.background = '#fcc'}
                                            onMouseOut={e => e.currentTarget.style.background = '#fee'}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Модал */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '30px', width: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ color: '#2d5a27', margin: 0, fontSize: '20px' }}>
                                {editProperty ? 'Редактирай имот' : 'Добави нов имот'}
                            </h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', color: '#555', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>Име на имота *</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} required placeholder="Например: Моята къща" />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', color: '#555', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>Описание</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ ...inputStyle, height: '80px', resize: 'vertical' }} placeholder="Кратко описание на имота" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#555', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>Тип имот *</label>
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={selectStyle}>
                                        <option value="HOUSE">Къща</option>
                                        <option value="APARTMENT">Апартамент</option>
                                        <option value="VILLA">Вила</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#555', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>Регион *</label>
                                    <input type="text" value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value })} style={inputStyle} required placeholder="Например: София" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#555', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>Площ (кв.м.) *</label>
                                    <input type="number" value={formData.area_sqm} onChange={e => setFormData({ ...formData, area_sqm: e.target.value })} style={inputStyle} required placeholder="150" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#555', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>Площ за озеленяване (кв.м.)</label>
                                    <input type="number" value={formData.green_area_sqm} onChange={e => setFormData({ ...formData, green_area_sqm: e.target.value })} style={inputStyle} placeholder="80" min="1" />
                                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: 3 }}>Използва се за препоръки на растения</div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#555', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>Ширина (м)</label>
                                    <input type="number" value={formData.width_m} onChange={e => setFormData({ ...formData, width_m: e.target.value })} style={inputStyle} placeholder="10" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#555', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>Дължина (м)</label>
                                    <input type="number" value={formData.height_m} onChange={e => setFormData({ ...formData, height_m: e.target.value })} style={inputStyle} placeholder="15" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#555', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>Слънчево изложение *</label>
                                    <select value={formData.sun_exposure} onChange={e => setFormData({ ...formData, sun_exposure: e.target.value })} style={selectStyle}>
                                        <option value="FULL_SUN">Слънчево</option>
                                        <option value="PARTIAL_SUN">Частично слънчево</option>
                                        <option value="SHADE">Сянка</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#555', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>Тип почва</label>
                                    <select value={formData.soil_type} onChange={e => setFormData({ ...formData, soil_type: e.target.value })} style={selectStyle}>
                                        <option value="CLAY">Глинеста</option>
                                        <option value="SANDY">Песъчлива</option>
                                        <option value="LOAMY">Глинесто-песъчлива</option>
                                        <option value="ROCKY">Камениста</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: '12px', fontSize: '15px', cursor: 'pointer' }}>
                                    Откажи
                                </button>
                                <button type="submit" style={{ flex: 1, padding: '12px', background: '#2d5a27', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    onMouseOver={e => e.currentTarget.style.background = '#1e3d1a'}
                                    onMouseOut={e => e.currentTarget.style.background = '#2d5a27'}
                                >
                                    <FaCheck /> {editProperty ? 'Запази' : 'Добави'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Properties;