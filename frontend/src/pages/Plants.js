import React, { useState, useEffect } from 'react';
import {
    FaSeedling, FaLeaf, FaStar, FaSearch,
    FaSun, FaCloudSun, FaMoon,
    FaTint, FaThermometerHalf, FaRulerVertical,
    FaLayerGroup, FaCalendarAlt, FaBuilding,
    FaExclamationTriangle, FaCheckCircle, FaTimes,
    FaTree, FaSpa
} from 'react-icons/fa';
import { getPlants, recommendPlants, getProperties } from '../services/api';

const WATER_LABELS  = { LOW: 'Ниско', MEDIUM: 'Средно', HIGH: 'Високо' };
const SUN_LABELS    = { FULL_SUN: 'Слънчево', PARTIAL_SUN: 'Частично', SHADE: 'Сянка' };
const SEASON_LABELS = { SPRING: 'Пролет', SUMMER: 'Лято', AUTUMN: 'Есен', WINTER: 'Зима', ALL_YEAR: 'Целогодишно' };
const SOIL_LABELS   = { CLAY: 'Глинеста', SANDY: 'Песъчлива', LOAMY: 'Глинесто-песъчлива', ROCKY: 'Камениста' };
const DIFF_LABELS   = { EASY: 'Лесно', MEDIUM: 'Средно', HARD: 'Трудно' };

const GRASS_NAMES = ['трева', 'тревна смеска', 'тревна настилка'];

function isGrass(name) {
    return GRASS_NAMES.some(g => name.toLowerCase().includes(g));
}

function getUnit(name) {
    return isGrass(name) ? 'кг' : 'бр.';
}

function getUnitPerSqm(name) {
    return isGrass(name) ? 'кг/кв.м.' : 'бр./кв.м.';
}

const BG_COLORS = [
    '#e8f5e9', '#fce7f3', '#fff3e0', '#fef9c3',
    '#e0f2fe', '#f3e8ff', '#fde8e8', '#e8fdf5'
];
const ICON_COLORS = [
    '#2d5a27', '#c2185b', '#e65100', '#f9a825',
    '#0277bd', '#6a1b9a', '#c62828', '#00695c'
];
const PLANT_ICONS = [FaSeedling, FaLeaf, FaTree, FaSpa, FaSeedling, FaLeaf, FaTree, FaSpa];

function getPlantBg(id)        { return BG_COLORS[id % BG_COLORS.length]; }
function getPlantIconColor(id) { return ICON_COLORS[id % ICON_COLORS.length]; }
function getPlantIcon(id)      { return PLANT_ICONS[id % PLANT_ICONS.length]; }

function SunIcon({ value, size = 12 }) {
    if (value === 'FULL_SUN')    return <FaSun size={size} />;
    if (value === 'PARTIAL_SUN') return <FaCloudSun size={size} />;
    return <FaMoon size={size} />;
}

function DiffBadge({ diff }) {
    const styles = {
        EASY:   { background: '#EAF3DE', color: '#3B6D11' },
        MEDIUM: { background: '#FAEEDA', color: '#854F0B' },
        HARD:   { background: '#FCEBEB', color: '#A32D2D' },
    };
    return (
        <span style={{
            ...styles[diff],
            fontSize: '11px', padding: '3px 10px',
            borderRadius: '20px', fontWeight: '600'
        }}>
            {DIFF_LABELS[diff] || diff}
        </span>
    );
}

function Tag({ icon, children }) {
    return (
        <span style={{
            fontSize: '11px', padding: '3px 8px', borderRadius: '8px',
            background: '#f0fdf4', color: '#2d5a27', border: '1px solid #c8e6c9',
            display: 'inline-flex', alignItems: 'center', gap: '4px'
        }}>
            {icon}{children}
        </span>
    );
}

function PlantCard({ plant, recommended }) {
    const [showDetail, setShowDetail] = useState(false);
    const PlantIcon = getPlantIcon(plant.id);

    return (
        <>
            <div style={{
                background: 'white', borderRadius: '16px', overflow: 'hidden',
                border: '1px solid #e8f5e9', boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                transition: 'transform .2s, box-shadow .2s', display: 'flex', flexDirection: 'column'
            }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(45,90,39,0.15)'; }}
                onMouseOut={e  => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'; }}
            >
                {/* Image / icon area */}
                <div style={{
                    height: '160px',
                    background: plant.image_url ? 'none' : getPlantBg(plant.id),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', flexShrink: 0, overflow: 'hidden'
                }}>
                    {plant.image_url
                        ? <img src={plant.image_url} alt={plant.name}
                               style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <PlantIcon size={60} color={getPlantIconColor(plant.id)} style={{ opacity: 0.75 }} />
                    }
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                        <DiffBadge diff={plant.care_difficulty} />
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#1a3c17', marginBottom: '4px' }}>
                        {plant.name}
                    </div>
                    <div style={{
                        fontSize: '12px', color: '#666', lineHeight: '1.6', marginBottom: '10px',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                        {plant.description || 'Без описание.'}
                    </div>

                    {recommended && (
                        <div style={{
                            background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px',
                            padding: '7px 10px', fontSize: '12px', color: '#15803d',
                            display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px'
                        }}>
                            <FaStar size={11} />
                            Препоръчано · {recommended.recommended_quantity} {getUnit(plant.name)} · {recommended.estimated_cost.toFixed(2)} EUR
                        </div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px', flex: 1 }}>
                        <Tag icon={<SunIcon value={plant.sun_needs} size={11} />}>
                            {SUN_LABELS[plant.sun_needs] || plant.sun_needs}
                        </Tag>
                        <Tag icon={<FaTint size={11} />}>
                            {WATER_LABELS[plant.water_needs] || plant.water_needs}
                        </Tag>
                        <Tag icon={<FaCalendarAlt size={11} />}>
                            {SEASON_LABELS[plant.season] || plant.season}
                        </Tag>
                        {plant.soil_type && (
                            <Tag icon={<FaLayerGroup size={11} />}>{SOIL_LABELS[plant.soil_type]}</Tag>
                        )}
                        {plant.min_temp_celsius != null && (
                            <Tag icon={<FaThermometerHalf size={11} />}>мин. {plant.min_temp_celsius}°C</Tag>
                        )}
                        {plant.max_height_cm && (
                            <Tag icon={<FaRulerVertical size={11} />}>{plant.max_height_cm} см</Tag>
                        )}
                    </div>

                    {/* Price row */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        paddingTop: '10px', borderTop: '1px solid #e8f5e9'
                    }}>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#2d5a27' }}>
                                {plant.price != null ? `${plant.price.toFixed(2)} EUR` : '—'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                                    {plant.quantity_per_sqm > 0
                                        ? `${plant.quantity_per_sqm} ${getUnitPerSqm(plant.name)}`
                                        : '1 бр.'}
                                </div>
                        </div>
                        <button
                            onClick={() => setShowDetail(true)}
                            style={{
                                padding: '7px 16px', background: '#2d5a27', color: 'white',
                                border: 'none', borderRadius: '20px', fontSize: '12px',
                                fontWeight: 'bold', cursor: 'pointer'
                            }}
                            onMouseOver={e => e.target.style.background = '#1e3d1a'}
                            onMouseOut={e  => e.target.style.background = '#2d5a27'}
                        >
                            Детайли
                        </button>
                    </div>
                </div>
            </div>

            {showDetail && (
                <PlantModal plant={plant} recommended={recommended} onClose={() => setShowDetail(false)} />
            )}
        </>
    );
}

function DetailRow({ icon, label, value }) {
    return (
        <div style={{ background: '#f8fdf8', borderRadius: '10px', padding: '10px', border: '1px solid #e8f5e9' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {icon} {label}
            </div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>{value}</div>
        </div>
    );
}

function PlantModal({ plant, recommended, onClose }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, padding: '20px'
        }} onClick={onClose}>
            <div style={{
                background: 'white', borderRadius: '20px', padding: '30px',
                width: '500px', maxHeight: '85vh', overflowY: 'auto',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
            }} onClick={e => e.stopPropagation()}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a3c17' }}>{plant.name}</div>
                        <div style={{ marginTop: '6px' }}><DiffBadge diff={plant.care_difficulty} /></div>
                    </div>
                    <button onClick={onClose} style={{
                        background: '#f5f5f5', border: 'none', borderRadius: '50%',
                        width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', color: '#666', flexShrink: 0
                    }}>
                        <FaTimes size={14} />
                    </button>
                </div>

                {plant.description && (
                    <p style={{ color: '#555', lineHeight: '1.7', marginBottom: '20px', fontSize: '14px' }}>
                        {plant.description}
                    </p>
                )}

                {recommended && (
                    <div style={{
                        background: '#dcfce7', border: '1px solid #86efac', borderRadius: '12px',
                        padding: '14px', marginBottom: '20px', fontSize: '13px', color: '#15803d'
                    }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaCheckCircle size={14} /> Препоръчано за твоя имот
                        </div>
                        <div>Препоръчано количество: <strong>{recommended.recommended_quantity} {getUnit(plant.name)}</strong></div>
                        <div>Прогнозна цена: <strong>{recommended.estimated_cost.toFixed(2)} EUR</strong></div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                    <DetailRow icon={<SunIcon value={plant.sun_needs} size={11} />}  label="Слънчевост"       value={SUN_LABELS[plant.sun_needs] || plant.sun_needs} />
                    <DetailRow icon={<FaTint size={11} />}                            label="Нужди от вода"    value={WATER_LABELS[plant.water_needs] || plant.water_needs} />
                    <DetailRow icon={<FaCalendarAlt size={11} />}                     label="Сезон"            value={SEASON_LABELS[plant.season] || plant.season} />
                    <DetailRow icon={<FaLayerGroup size={11} />}                      label="Почва"            value={plant.soil_type ? SOIL_LABELS[plant.soil_type] : 'Всякаква'} />
                    <DetailRow icon={<FaThermometerHalf size={11} />}                 label="Мин. температура" value={plant.min_temp_celsius != null ? `${plant.min_temp_celsius}°C` : '—'} />
                    <DetailRow icon={<FaRulerVertical size={11} />}                   label="Макс. височина"   value={plant.max_height_cm ? `${plant.max_height_cm} см` : '—'} />
                    <DetailRow icon={<FaStar size={11} />}                            label="Цена"             value={plant.price != null ? `${plant.price.toFixed(2)} EUR` : '—'} />
                    <DetailRow icon={<FaSeedling size={11} />}                        label={getUnitPerSqm(plant.name)} value={plant.quantity_per_sqm > 0 ? `${plant.quantity_per_sqm} ${getUnitPerSqm(plant.name)}` : '1 бр.'} />
                </div>

                {plant.regions && plant.regions.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FaLeaf size={11} /> Региони
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {plant.regions.map(r => (
                                <span key={r} style={{
                                    fontSize: '12px', padding: '4px 10px', borderRadius: '20px',
                                    background: '#f0fdf4', color: '#2d5a27', border: '1px solid #c8e6c9'
                                }}>{r}</span>
                            ))}
                        </div>
                    </div>
                )}

                <button onClick={onClose} style={{
                    width: '100%', padding: '12px', background: '#2d5a27', color: 'white',
                    border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer'
                }}
                    onMouseOver={e => e.target.style.background = '#1e3d1a'}
                    onMouseOut={e  => e.target.style.background = '#2d5a27'}
                >
                    Затвори
                </button>
            </div>
        </div>
    );
}

export default function Plants() {
    const [tab, setTab]                 = useState('all');
    const [plants, setPlants]           = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [properties, setProperties]   = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState('');

    const [search, setSearch]             = useState('');
    const [filterWater, setFilterWater]   = useState('');
    const [filterSun, setFilterSun]       = useState('');
    const [filterSeason, setFilterSeason] = useState('');
    const [filterDiff, setFilterDiff]     = useState('');

    const [selProperty, setSelProperty] = useState('');
    const [budget, setBudget]           = useState('');
    const [recLoading, setRecLoading]   = useState(false);
    const [recError, setRecError]       = useState('');

    const recMap = recommended.reduce((m, p) => { m[p.id] = p; return m; }, {});

    useEffect(() => {
        Promise.all([
            getPlants(),
            getProperties()
        ])
            .then(([plantsRes, propsRes]) => {
                setPlants(plantsRes.data || []);
                setProperties(propsRes.data || []);
            })
            .catch(() => setError('Грешка при зареждане на растенията!'))
            .finally(() => setLoading(false));
    }, []);

    const handleRecommend = async () => {
        if (!selProperty) { setRecError('Избери имот!'); return; }
        setRecLoading(true); setRecError('');
        try {
            const res = await recommendPlants(selProperty, budget || undefined);
            setRecommended(res.data || []);
            if ((res.data || []).length === 0) setRecError('Няма намерени растения за този имот.');
        } catch (e) {
            setRecError(e.response?.data?.message || 'Грешка при търсене!');
        } finally {
            setRecLoading(false);
        }
    };

    const filtered = plants.filter(p => {
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterWater  && p.water_needs     !== filterWater)  return false;
        if (filterSun    && p.sun_needs       !== filterSun)    return false;
        if (filterSeason && p.season          !== filterSeason) return false;
        if (filterDiff   && p.care_difficulty !== filterDiff)   return false;
        return true;
    });

    const displayPlants = tab === 'all' ? filtered : recommended;

    const selectStyle = {
        padding: '9px 12px', border: '1.5px solid #d1d5db', borderRadius: '10px',
        fontSize: '13px', background: 'white', cursor: 'pointer', outline: 'none', color: '#333'
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fdf8' }}>

            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg,#1a4a1a 0%,#2d5a27 50%,#4a7c3f 100%)',
                padding: '40px 20px', color: 'white', position: 'relative', overflow: 'hidden'
            }}>
                {[...Array(4)].map((_, i) => (
                    <div key={i} style={{ position: 'absolute', bottom: `${i * 15}%`, left: `${i * 25}%`, opacity: .1 }}>
                        <FaLeaf color="white" size={35 + i * 8} />
                    </div>
                ))}
                <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <FaSeedling size={30} color="rgba(255,255,255,0.9)" />
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Растения</h1>
                    </div>
                    <p style={{ opacity: .85, margin: 0, fontSize: '15px' }}>
                        Разгледай каталога или получи персонализирани препоръки за твоя имот
                    </p>
                </div>
            </div>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '36px 20px' }}>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                    {[
                        { id: 'all',       label: 'Всички растения',   icon: <FaLeaf size={13} /> },
                        { id: 'recommend', label: 'Препоръки за имот', icon: <FaStar size={13} /> },
                    ].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)} style={{
                            padding: '9px 22px', borderRadius: '20px', fontSize: '14px',
                            cursor: 'pointer', fontWeight: tab === t.id ? 'bold' : '500',
                            border: tab === t.id ? 'none' : '1.5px solid #d1d5db',
                            background: tab === t.id ? '#2d5a27' : 'white',
                            color: tab === t.id ? 'white' : '#555',
                            transition: 'all .2s', display: 'flex', alignItems: 'center', gap: '7px'
                        }}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {error && (
                    <div style={{
                        background: '#fee', border: '1px solid #fcc', borderRadius: '10px',
                        padding: '12px 16px', color: '#c00', marginBottom: '20px',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <FaExclamationTriangle size={14} /> {error}
                    </div>
                )}

                {/* All tab filters */}
                {tab === 'all' && (
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '20px',
                        border: '1px solid #e8f5e9', marginBottom: '28px',
                        display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: '1', minWidth: '180px' }}>
                            <label style={{ fontSize: '12px', color: '#888', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaSearch size={11} /> Търсене по име
                            </label>
                            <div style={{ position: 'relative' }}>
                                <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} size={12} />
                                <input
                                    type="text" placeholder="Например: Роза..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    style={{ ...selectStyle, paddingLeft: '30px', width: '100%' }}
                                />
                            </div>
                        </div>
                        {[
                            { label: 'Вода',       icon: <FaTint size={11} />,        val: filterWater,  set: setFilterWater,
                              opts: [['','Всички'],['LOW','Ниско'],['MEDIUM','Средно'],['HIGH','Високо']] },
                            { label: 'Слънчевост', icon: <FaSun size={11} />,         val: filterSun,    set: setFilterSun,
                              opts: [['','Всички'],['FULL_SUN','Слънчево'],['PARTIAL_SUN','Частично'],['SHADE','Сянка']] },
                            { label: 'Сезон',      icon: <FaCalendarAlt size={11} />, val: filterSeason, set: setFilterSeason,
                              opts: [['','Всички'],['SPRING','Пролет'],['SUMMER','Лято'],['AUTUMN','Есен'],['WINTER','Зима'],['ALL_YEAR','Целогодишно']] },
                            { label: 'Трудност',   icon: <FaSpa size={11} />,         val: filterDiff,   set: setFilterDiff,
                              opts: [['','Всички'],['EASY','Лесно'],['MEDIUM','Средно'],['HARD','Трудно']] },
                        ].map(f => (
                            <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '12px', color: '#888', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {f.icon} {f.label}
                                </label>
                                <select value={f.val} onChange={e => f.set(e.target.value)} style={selectStyle}>
                                    {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                )}

                {/* Recommend tab controls */}
                {tab === 'recommend' && (
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '20px',
                        border: '1px solid #e8f5e9', marginBottom: '28px',
                        display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: '200px' }}>
                            <label style={{ fontSize: '12px', color: '#888', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaBuilding size={11} /> Избери имот *
                            </label>
                            <select value={selProperty} onChange={e => setSelProperty(e.target.value)} style={selectStyle}>
                                <option value="">— Избери имот —</option>
                                {properties.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.area_sqm} кв.м.)</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '12px', color: '#888', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaStar size={11} /> Макс. бюджет (EUR)
                            </label>
                            <input
                                type="number" placeholder="Незадължително"
                                value={budget} onChange={e => setBudget(e.target.value)}
                                style={{ ...selectStyle, width: '180px' }}
                            />
                        </div>
                        <button
                            onClick={handleRecommend}
                            disabled={recLoading}
                            style={{
                                padding: '10px 24px', background: recLoading ? '#aaa' : '#2d5a27',
                                color: 'white', border: 'none', borderRadius: '20px',
                                fontSize: '14px', fontWeight: 'bold',
                                cursor: recLoading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                            onMouseOver={e => { if (!recLoading) e.currentTarget.style.background = '#1e3d1a'; }}
                            onMouseOut={e  => { if (!recLoading) e.currentTarget.style.background = '#2d5a27'; }}
                        >
                            <FaSeedling size={14} />
                            {recLoading ? 'Търсене...' : 'Намери растения'}
                        </button>
                        {recError && (
                            <div style={{ width: '100%', color: '#c00', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FaExclamationTriangle size={12} /> {recError}
                            </div>
                        )}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
                        <FaLeaf size={40} color="#2d5a27" />
                        <p style={{ marginTop: '16px', fontSize: '16px' }}>Зареждане...</p>
                    </div>
                ) : displayPlants.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '60px', background: 'white',
                        borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                    }}>
                        <FaSeedling size={48} color="#ccc" />
                        <h3 style={{ color: '#666', marginTop: '16px' }}>
                            {tab === 'recommend' ? 'Избери имот и натисни "Намери растения"' : 'Няма намерени растения'}
                        </h3>
                        {tab === 'all' && <p style={{ color: '#999' }}>Опитай с различни филтри</p>}
                    </div>
                ) : (
                    <>
                        <div style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
                            {displayPlants.length} {displayPlants.length === 1 ? 'растение' : 'растения'}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {displayPlants.map(plant => (
                                <PlantCard key={plant.id} plant={plant} recommended={recMap[plant.id] || null} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}