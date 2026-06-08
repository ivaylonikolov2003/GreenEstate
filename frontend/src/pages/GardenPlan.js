// GardenPlan.js — wrapper that reads planId from URL params and fetches planMeta
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProperty, getGardenPlans, createGardenPlan, deleteGardenPlan } from '../services/api';
import GardenPlanCanvas from './GardenPlanCanvas';
import { FaLeaf, FaPlus, FaTrash, FaTimes, FaCheck } from 'react-icons/fa';

function GardenPlan() {
    const { id } = useParams(); // property id
    const [property, setProperty] = useState(null);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [planForm, setPlanForm] = useState({ name: '', description: '', width_m: 10, height_m: 8, budget: '' });

    useEffect(() => {
        fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchAll = async () => {
        try {
            const [propRes, planRes] = await Promise.all([
                getProperty(id),
                getGardenPlans(id),
            ]);
            setProperty(propRes.data);
            const augmented = planRes.data.map(augmentPlan);
            setPlans(augmented);
            if (augmented.length > 0) setSelectedPlan(augmented[0]);
        } catch {
            setError('Грешка при зареждане!');
        } finally {
            setLoading(false);
        }
    };

    function augmentPlan(p) {
        let width_m = 10, height_m = 8, budget = null;
        let description = p.description || '';
        const match = description.match(/^<<(\{.*?\})>>([\s\S]*)$/);
        if (match) {
            try {
                const meta = JSON.parse(match[1]);
                width_m = meta.width_m || 10;
                height_m = meta.height_m || 8;
                budget = meta.budget || null;
                description = match[2].trim();
            } catch {}
        }
        return { ...p, width_m, height_m, budget, cleanDescription: description };
    }

    const handleCreatePlan = async (e) => {
        e.preventDefault();
        try {
            const meta = JSON.stringify({
                width_m: parseFloat(planForm.width_m),
                height_m: parseFloat(planForm.height_m),
                budget: planForm.budget ? parseFloat(planForm.budget) : null
            });
            const descWithMeta = `<<${meta}>>${planForm.description ? ' ' + planForm.description : ''}`;
            await createGardenPlan({
                property_id: parseInt(id),
                name: planForm.name,
                description: descWithMeta,
                grid_width: 10,
                grid_height: 10,
                budget: planForm.budget ? parseFloat(planForm.budget) : null,
            });
            setShowModal(false);
            setPlanForm({ name: '', description: '', width_m: 10, height_m: 8, budget: '' });
            fetchAll();
        } catch (e) {
            setError(e.response?.data?.message || 'Грешка при създаване!');
        }
    };

    const handleDeletePlan = async (planId) => {
        if (!window.confirm('Изтриване на плана?')) return;
        try {
            await deleteGardenPlan(planId);
            const remaining = plans.filter(p => p.id !== planId);
            setPlans(remaining);
            setSelectedPlan(remaining[0] || null);
        } catch {
            setError('Грешка при изтриване!');
        }
    };

    const inputStyle = {
        width: '100%', padding: '8px 12px', border: '1.5px solid #d1fae5',
        borderRadius: '8px', fontSize: '13px', outline: 'none',
        background: 'white', boxSizing: 'border-box'
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f0fdf4', flexDirection: 'column', gap: 12 }}>
            <FaLeaf size={40} color="#22c55e" />
            <span style={{ color: '#166534', fontWeight: 600 }}>Зареждане…</span>
        </div>
    );

    // planMeta shape expected by GardenPlanCanvas
    const planMeta = selectedPlan ? {
        name: selectedPlan.name,
        width_m: selectedPlan.width_m,
        height_m: selectedPlan.height_m,
        budget: selectedPlan.budget || 0,
    } : null;

    return (
        <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

            {/* Top bar with plan tabs */}
            <div style={{ background: 'linear-gradient(90deg,#14532d,#166534,#15803d)', color: 'white', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
                <FaLeaf size={16} />
                <span style={{ fontWeight: 700, fontSize: 15 }}>GreenPlan — {property?.name}</span>
                <span style={{ fontSize: 12, opacity: 0.7, marginRight: 8 }}>{property?.region} · {property?.area_sqm} кв.м.</span>

                {/* Plan tabs */}
                <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
                    {plans.map(plan => (
                        <div key={plan.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <button
                                onClick={() => setSelectedPlan(plan)}
                                style={{
                                    padding: '4px 12px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                    background: selectedPlan?.id === plan.id ? 'white' : 'rgba(255,255,255,0.2)',
                                    color: selectedPlan?.id === plan.id ? '#166534' : 'white',
                                }}>
                                {plan.name}
                            </button>
                            <button onClick={() => handleDeletePlan(plan.id)}
                                style={{ background: 'rgba(255,100,100,0.25)', color: 'white', border: 'none', borderRadius: 8, padding: '3px 6px', cursor: 'pointer', fontSize: 10 }}>
                                <FaTrash size={8} />
                            </button>
                        </div>
                    ))}
                    <button onClick={() => setShowModal(true)}
                        style={{ padding: '4px 12px', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.5)', background: 'transparent', color: 'white', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FaPlus size={10} /> Нов план
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 20px', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                    ⚠️ {error}
                    <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b' }}>✕</button>
                </div>
            )}

            {/* Canvas */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                {selectedPlan && planMeta ? (
                    <GardenPlanCanvas planId={selectedPlan.id} planMeta={planMeta} />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 16, color: '#6b7280' }}>
                        <FaLeaf size={50} color="#d1fae5" />
                        <p>Избери или създай план</p>
                        <button onClick={() => setShowModal(true)}
                            style={{ padding: '10px 24px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 20, fontWeight: 700, cursor: 'pointer' }}>
                            + Нов план
                        </button>
                    </div>
                )}
            </div>

            {/* Create plan modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: 16, padding: 28, width: 400, boxShadow: '0 25px 60px #0004' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ color: '#166534', margin: 0, fontSize: 18 }}>Нов план</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleCreatePlan}>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Име *</label>
                                <input style={inputStyle} value={planForm.name} onChange={e => setPlanForm(f => ({ ...f, name: e.target.value }))} required placeholder="Преден двор" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Ширина (м) *</label>
                                    <input style={inputStyle} type="number" value={planForm.width_m} min={1} max={100} onChange={e => setPlanForm(f => ({ ...f, width_m: e.target.value }))} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Дължина (м) *</label>
                                    <input style={inputStyle} type="number" value={planForm.height_m} min={1} max={100} onChange={e => setPlanForm(f => ({ ...f, height_m: e.target.value }))} required />
                                </div>
                            </div>
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Бюджет (EUR)</label>
                                <input style={inputStyle} type="number" value={planForm.budget} onChange={e => setPlanForm(f => ({ ...f, budget: e.target.value }))} placeholder="500" />
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Описание</label>
                                <textarea style={{ ...inputStyle, height: 60, resize: 'vertical' }} value={planForm.description} onChange={e => setPlanForm(f => ({ ...f, description: e.target.value }))} />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: 10, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>Откажи</button>
                                <button type="submit" style={{ flex: 1, padding: 10, background: '#22c55e', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                    <FaCheck size={12} /> Създай
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GardenPlan;