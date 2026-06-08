import React, { useState, useEffect } from 'react';
import {
    FaCog, FaLeaf, FaPlus, FaTrash, FaEdit, FaTimes, FaCheck,
    FaSeedling, FaSearch, FaExclamationTriangle
} from 'react-icons/fa';
import { getPlants, createPlant, updatePlant, deletePlant } from '../services/api';

const WATER_LABELS  = { LOW: 'Ниско', MEDIUM: 'Средно', HIGH: 'Високо' };
const SUN_LABELS    = { FULL_SUN: 'Слънчево', PARTIAL_SUN: 'Частично', SHADE: 'Сянка' };
const SEASON_LABELS = { SPRING: 'Пролет', SUMMER: 'Лято', AUTUMN: 'Есен', WINTER: 'Зима', ALL_YEAR: 'Целогодишно' };
const DIFF_LABELS   = { EASY: 'Лесно', MEDIUM: 'Средно', HARD: 'Трудно' };
const DIFF_COLORS   = {
    EASY:   { bg: '#dcfce7', color: '#15803d' },
    MEDIUM: { bg: '#fef9c3', color: '#854d0e' },
    HARD:   { bg: '#fee2e2', color: '#991b1b' },
};

const emptyForm = {
    name: '', description: '', water_needs: 'MEDIUM', sun_needs: 'FULL_SUN',
    season: 'ALL_YEAR', soil_type: '', care_difficulty: 'EASY',
    min_temp_celsius: '', max_height_cm: '', image_url: '',
    price: '', quantity_per_sqm: '', regions: ''
};

const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1.5px solid #d1fae5',
    borderRadius: '8px', fontSize: '13px', outline: 'none',
    background: 'white', boxSizing: 'border-box'
};
const selectStyle = { ...inputStyle, cursor: 'pointer' };
const labelStyle  = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' };

export default function Admin() {
    const [plants,   setPlants]   = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [search,   setSearch]   = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editPlant, setEditPlant] = useState(null); // null = добавяне, обект = редактиране
    const [form,     setForm]     = useState(emptyForm);
    const [saving,   setSaving]   = useState(false);
    const [error,    setError]    = useState('');
    const [success,  setSuccess]  = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [page, setPage]         = useState(1);
    const PAGE_SIZE = 10;

    useEffect(() => { fetchPlants(); }, []);

    const fetchPlants = async () => {
        setLoading(true);
        try {
            const res = await getPlants();
            setPlants(res.data || []);
        } catch {
            setError('Грешка при зареждане на растенията!');
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditPlant(null);
        setForm(emptyForm);
        setError('');
        setShowModal(true);
    };

    const openEdit = (plant) => {
        setEditPlant(plant);
        setForm({
            name:             plant.name || '',
            description:      plant.description || '',
            water_needs:      plant.water_needs || 'MEDIUM',
            sun_needs:        plant.sun_needs || 'FULL_SUN',
            season:           plant.season || 'ALL_YEAR',
            soil_type:        plant.soil_type || '',
            care_difficulty:  plant.care_difficulty || 'EASY',
            min_temp_celsius: plant.min_temp_celsius ?? '',
            max_height_cm:    plant.max_height_cm ?? '',
            image_url:        plant.image_url || '',
            price:            plant.price ?? '',
            quantity_per_sqm: plant.quantity_per_sqm ?? '',
            regions:          (plant.regions || []).join(', '),
        });
        setError('');
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = {
                name:             form.name,
                description:      form.description || null,
                water_needs:      form.water_needs,
                sun_needs:        form.sun_needs,
                season:           form.season,
                soil_type:        form.soil_type || null,
                care_difficulty:  form.care_difficulty,
                min_temp_celsius: form.min_temp_celsius !== '' ? parseInt(form.min_temp_celsius) : null,
                max_height_cm:    form.max_height_cm   !== '' ? parseInt(form.max_height_cm)    : null,
                image_url:        form.image_url || null,
                price:            form.price !== '' ? parseFloat(form.price) : 0,
                quantity_per_sqm: form.quantity_per_sqm !== '' ? parseFloat(form.quantity_per_sqm) : 0,
                regions:          form.regions ? form.regions.split(',').map(r => r.trim()).filter(Boolean) : [],
            };

            if (editPlant) {
                await updatePlant(editPlant.id, payload);
                setSuccess('Растението е обновено успешно!');
            } else {
                await createPlant(payload);
                setSuccess('Растението е добавено успешно!');
            }

            setShowModal(false);
            setForm(emptyForm);
            setEditPlant(null);
            fetchPlants();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Грешка при запазване!');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deletePlant(id);
            setPlants(p => p.filter(x => x.id !== id));
            setSuccess('Растението е изтрито!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Грешка при изтриване!');
        } finally {
            setDeleteId(null);
        }
    };

    const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const filtered = plants.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

;

    return (
        <div style={{ minHeight: '100vh', background: '#f8fdf8' }}>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg,#1a4a1a 0%,#2d5a27 50%,#4a7c3f 100%)', padding: '40px 20px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                {[...Array(4)].map((_, i) => (
                    <div key={i} style={{ position: 'absolute', bottom: `${i*15}%`, left: `${i*25}%`, opacity: .1 }}>
                        <FaLeaf color="white" size={35+i*8} />
                    </div>
                ))}
                <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <FaCog size={28} color="rgba(255,255,255,0.9)" />
                            <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>Администрация</h1>
                        </div>
                        <p style={{ opacity: .85, margin: 0, fontSize: 15 }}>
                            Управлявай каталога с растения — {plants.length} растения общо
                        </p>
                    </div>
                    <button onClick={openAdd}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'white', color: '#2d5a27', border: 'none', borderRadius: 20, fontSize: 15, fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                        <FaPlus /> Добави растение
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '36px 20px' }}>

                {error && (
                    <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', color: '#991b1b', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span><FaExclamationTriangle size={13} style={{ marginRight: 8 }} />{error}</span>
                        <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b' }}><FaTimes /></button>
                    </div>
                )}
                {success && (
                    <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 10, padding: '12px 16px', color: '#15803d', marginBottom: 20 }}>
                        ✅ {success}
                    </div>
                )}

                {/* Search */}
                <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e8f5e9', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FaSearch color="#9ca3af" />
                    <input type="text" placeholder="Търси растение по име..."
                        value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        style={{ ...inputStyle, border: 'none', fontSize: 14, flex: 1 }} />
                    <span style={{ fontSize: 13, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                        {filtered.length} / {plants.length} растения
                    </span>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60, color: '#666' }}>
                        <FaLeaf size={40} color="#2d5a27" />
                        <p style={{ marginTop: 16 }}>Зареждане...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <FaSeedling size={48} color="#ccc" />
                        <h3 style={{ color: '#666', marginTop: 16 }}>Няма намерени растения</h3>
                    </div>
                ) : (
                    <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e8f5e9', overflow: 'hidden' }}>
                        {/* Header row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 110px', padding: '12px 20px', background: '#f0fdf4', borderBottom: '2px solid #e8f5e9', gap: 8 }}>
                            {['Растение', 'Вода', 'Слънце', 'Сезон', 'Трудност', 'Цена / бр./кв.м.', ''].map((h, i) => (
                                <div key={i} style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: .5 }}>{h}</div>
                            ))}
                        </div>

                        {paginated.map((plant, idx) => (
                            <div key={plant.id} style={{
                                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 110px',
                                padding: '14px 20px', gap: 8, alignItems: 'center',
                                borderBottom: idx < paginated.length - 1 ? '1px solid #f0fdf4' : 'none',
                                transition: 'background .15s'
                            }}
                                onMouseOver={e => e.currentTarget.style.background = '#fafff8'}
                                onMouseOut={e  => e.currentTarget.style.background = 'white'}>

                                <div>
                                    <div style={{ fontWeight: 700, color: '#1a3c17', fontSize: 14 }}>{plant.name}</div>
                                    {plant.regions?.length > 0 && (
                                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                                            📍 {plant.regions.slice(0,3).join(', ')}{plant.regions.length > 3 ? ` +${plant.regions.length-3}` : ''}
                                        </div>
                                    )}
                                    {plant.description && (
                                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                                            {plant.description}
                                        </div>
                                    )}
                                </div>

                                <div style={{ fontSize: 13, color: '#374151' }}>{WATER_LABELS[plant.water_needs] || plant.water_needs}</div>
                                <div style={{ fontSize: 13, color: '#374151' }}>{SUN_LABELS[plant.sun_needs] || plant.sun_needs}</div>
                                <div style={{ fontSize: 13, color: '#374151' }}>{SEASON_LABELS[plant.season] || plant.season}</div>

                                <div>
                                    <span style={{
                                        fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                                        background: (DIFF_COLORS[plant.care_difficulty] || {}).bg,
                                        color: (DIFF_COLORS[plant.care_difficulty] || {}).color,
                                    }}>
                                        {DIFF_LABELS[plant.care_difficulty] || plant.care_difficulty}
                                    </span>
                                </div>

                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#2d5a27' }}>
                                        {plant.price != null ? `${Number(plant.price).toFixed(2)} EUR` : '—'}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#9ca3af' }}>
                                            {plant.quantity_per_sqm > 0 ? `${plant.quantity_per_sqm} бр./кв.м.` : '1 бр.'}
                                        </div>
                                </div>

                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                    <button onClick={() => openEdit(plant)}
                                        style={{ padding: '6px 10px', background: '#e8f5e9', color: '#2d5a27', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}
                                        onMouseOver={e => e.currentTarget.style.background = '#c8e6c9'}
                                        onMouseOut={e  => e.currentTarget.style.background = '#e8f5e9'}
                                        title="Редактирай">
                                        <FaEdit size={11} />
                                    </button>
                                    <button onClick={() => setDeleteId(plant.id)}
                                        style={{ padding: '6px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}
                                        onMouseOver={e => e.currentTarget.style.background = '#fca5a5'}
                                        onMouseOut={e  => e.currentTarget.style.background = '#fee2e2'}
                                        title="Изтрий">
                                        <FaTrash size={11} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #d1fae5', background: page === 1 ? '#f9fafb' : 'white', color: page === 1 ? '#d1d5db' : '#2d5a27', cursor: page === 1 ? 'default' : 'pointer', fontWeight: 600 }}>
                            ← Предишна
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setPage(p)}
                                style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${p === page ? '#2d5a27' : '#d1fae5'}`, background: p === page ? '#2d5a27' : 'white', color: p === page ? 'white' : '#374151', cursor: 'pointer', fontWeight: p === page ? 700 : 400 }}>
                                {p}
                            </button>
                        ))}
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #d1fae5', background: page === totalPages ? '#f9fafb' : 'white', color: page === totalPages ? '#d1d5db' : '#2d5a27', cursor: page === totalPages ? 'default' : 'pointer', fontWeight: 600 }}>
                            Следваща →
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit modal */}
            {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div style={{ background: 'white', borderRadius: 20, padding: 30, width: 620, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FaSeedling color="#2d5a27" size={20} />
                        <h3 style={{ color: '#2d5a27', margin: 0, fontSize: 20 }}>
                            {editPlant ? 'Редактирай растение' : 'Добави ново растение'}
                        </h3>
                    </div>
                    <button onClick={() => setShowModal(false)}
                        style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                        <FaTimes size={14} />
                    </button>
                </div>

                {error && (
                    <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#991b1b', marginBottom: 16, fontSize: 13 }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Име *</label>
                        <input style={inputStyle} value={form.name} onChange={e => f('name', e.target.value)} required placeholder="Например: Тревна смеска" />
                    </div>

                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Описание</label>
                        <textarea style={{ ...inputStyle, height: 70, resize: 'vertical' }} value={form.description} onChange={e => f('description', e.target.value)} placeholder="Кратко описание..." />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                        <div>
                            <label style={labelStyle}>Нужди от вода *</label>
                            <select style={selectStyle} value={form.water_needs} onChange={e => f('water_needs', e.target.value)}>
                                <option value="LOW">Ниско</option>
                                <option value="MEDIUM">Средно</option>
                                <option value="HIGH">Високо</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Слънчевост *</label>
                            <select style={selectStyle} value={form.sun_needs} onChange={e => f('sun_needs', e.target.value)}>
                                <option value="FULL_SUN">Слънчево</option>
                                <option value="PARTIAL_SUN">Частично</option>
                                <option value="SHADE">Сянка</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Сезон *</label>
                            <select style={selectStyle} value={form.season} onChange={e => f('season', e.target.value)}>
                                <option value="ALL_YEAR">Целогодишно</option>
                                <option value="SPRING">Пролет</option>
                                <option value="SUMMER">Лято</option>
                                <option value="AUTUMN">Есен</option>
                                <option value="WINTER">Зима</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                        <div>
                            <label style={labelStyle}>Тип почва</label>
                            <select style={selectStyle} value={form.soil_type} onChange={e => f('soil_type', e.target.value)}>
                                <option value="">— Всякаква —</option>
                                <option value="CLAY">Глинеста</option>
                                <option value="SANDY">Песъчлива</option>
                                <option value="LOAMY">Глинесто-песъчлива</option>
                                <option value="ROCKY">Камениста</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Трудност *</label>
                            <select style={selectStyle} value={form.care_difficulty} onChange={e => f('care_difficulty', e.target.value)}>
                                <option value="EASY">Лесно</option>
                                <option value="MEDIUM">Средно</option>
                                <option value="HARD">Трудно</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 12, marginBottom: 14 }}>
                        <div>
                            <label style={labelStyle}>Мин. температура (°C)</label>
                            <input style={inputStyle} type="number" value={form.min_temp_celsius} onChange={e => f('min_temp_celsius', e.target.value)} placeholder="-10" />
                        </div>
                        <div>
                            <label style={labelStyle}>Макс. височина (см)</label>
                            <input style={inputStyle} type="number" value={form.max_height_cm} onChange={e => f('max_height_cm', e.target.value)} placeholder="200" />
                        </div>
                        <div>
                            <label style={labelStyle}>URL на снимка</label>
                            <input style={inputStyle} type="url" value={form.image_url} onChange={e => f('image_url', e.target.value)} placeholder="https://..." />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                        <div>
                            <label style={labelStyle}>Цена (EUR/бр.)</label>
                            <input style={inputStyle} type="number" step="0.01" min="0" value={form.price} onChange={e => f('price', e.target.value)} placeholder="5.00" />
                        </div>
                        <div>
                            <label style={labelStyle}>Количество на кв.м.</label>
                            <input style={inputStyle} type="number" step="0.01" min="0" value={form.quantity_per_sqm} onChange={e => f('quantity_per_sqm', e.target.value)} placeholder="3 (0 = обект/дърво)" />
                        </div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={labelStyle}>Региони (разделени със запетая)</label>
                        <input style={inputStyle} value={form.regions} onChange={e => f('regions', e.target.value)} placeholder="София, Пловдив, Варна" />
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Регионите, в които расте това растение</div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button type="button" onClick={() => setShowModal(false)}
                            style={{ flex: 1, padding: 12, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                            Откажи
                        </button>
                        <button type="submit" disabled={saving}
                            style={{ flex: 1, padding: 12, background: saving ? '#9ca3af' : '#2d5a27', color: 'white', border: 'none', borderRadius: 12, cursor: saving ? 'default' : 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                            onMouseOver={e => { if (!saving) e.currentTarget.style.background = '#1e3d1a'; }}
                            onMouseOut={e  => { if (!saving) e.currentTarget.style.background = '#2d5a27'; }}>
                            <FaCheck size={13} /> {saving ? 'Запазване...' : editPlant ? 'Запази промените' : 'Добави растение'}
                        </button>
                    </div>
                </form>
            </div>
        </div>

            )}

            {/* Delete confirm */}
            {deleteId && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: 16, padding: 32, width: 380, boxShadow: '0 25px 60px rgba(0,0,0,0.3)', textAlign: 'center' }}>
                        <div style={{ width: 56, height: 56, background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <FaTrash size={22} color="#dc2626" />
                        </div>
                        <h3 style={{ color: '#1f2937', margin: '0 0 8px' }}>Изтриване на растение</h3>
                        <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 24px' }}>
                            Сигурен ли си? Растението ще бъде изтрито от каталога.
                        </p>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => setDeleteId(null)}
                                style={{ flex: 1, padding: 11, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
                                Откажи
                            </button>
                            <button onClick={() => handleDelete(deleteId)}
                                style={{ flex: 1, padding: 11, background: '#dc2626', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}
                                onMouseOver={e => e.currentTarget.style.background = '#b91c1c'}
                                onMouseOut={e  => e.currentTarget.style.background = '#dc2626'}>
                                Изтрий
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}