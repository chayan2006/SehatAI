import React, { useState } from 'react';

const INITIAL_INVENTORY = [
    { id: 'O2-104', name: 'O2 Tanks', total: 450, used: 412, status: 'critical' },
    { id: 'VENT-50', name: 'Ventilators', total: 60, used: 24, status: 'good' },
    { id: 'BLOOD-OM', name: 'O- Blood Units', total: 100, used: 85, status: 'warning' },
    { id: 'DEFIB-12', name: 'Defibrillators', total: 40, used: 38, status: 'warning' },
];

const WARD_FLOORPLAN = [
    { id: 'ICU-A', name: 'Intensive Care Unit A', capacity: 20, occupied: 18 },
    { id: 'ICU-B', name: 'Intensive Care Unit B', capacity: 20, occupied: 20 },
    { id: 'ER-1', name: 'Emergency Resuscitation', capacity: 15, occupied: 12 },
    { id: 'OR-MAIN', name: 'Operating Rooms (Main)', capacity: 10, occupied: 8 },
    { id: 'WARD-NEURO', name: 'Neurology Ward', capacity: 40, occupied: 32 },
    { id: 'WARD-CARDIO', name: 'Cardiology Ward', capacity: 40, occupied: 38 },
];

export default function ResourcesView() {
    const [inventory, setInventory] = useState(INITIAL_INVENTORY);
    const [wards, setWards] = useState(WARD_FLOORPLAN);

    return (
        <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
                    Resource &amp; Spatial Management
                </h1>
                <p style={{ color: '#64748b', margin: 0, fontWeight: 500 }}>
                    Monitor hospital bed availability, critical inventory thresholds, and spatial distribution mapping.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>

                {/* Inventory Snapshot */}
                <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                            <span className="material-symbols-outlined" style={{ color: '#f59e0b' }}>inventory_2</span>
                            Critical Equipment &amp; Resources
                        </h3>
                    </div>
                    <div style={{ display: 'grid', gap: 16 }}>
                        {inventory.map((item) => {
                            const pct = Math.round((item.used / item.total) * 100);
                            const color = item.status === 'critical' ? '#ef4444' : item.status === 'warning' ? '#f59e0b' : '#10b77f';
                            return (
                                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 3fr 1fr', gap: 16, alignItems: 'center' }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{item.name}</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <div style={{ background: '#f1f5f9', borderRadius: 8, height: 10, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 8, transition: 'width 1.5s ease' }} />
                                        </div>
                                    </div>
                                    <span style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: color }}>
                                        {item.used} / {item.total}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <button style={{ marginTop: 24, padding: '10px 0', width: '100%', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        Expand Full Inventory Manifest
                    </button>
                </div>

                {/* Spatial Floorplan Mapping */}
                <div style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                            <span className="material-symbols-outlined" style={{ color: '#3b82f6' }}>floor_lamp</span>
                            Live Ward Floorplan (Utilization)
                        </h3>
                    </div>
                    {/* Abstract Floorplan Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                        {wards.map(ward => {
                            const pct = Math.round((ward.occupied / ward.capacity) * 100);
                            const isFull = pct >= 100;
                            return (
                                <div key={ward.id} style={{
                                    border: `2px solid ${isFull ? '#fee2e2' : '#f0fdf8'}`,
                                    background: isFull ? '#fff1f2' : 'white',
                                    borderRadius: 12,
                                    padding: 16,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Fill Indicator */}
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: isFull ? '#fecdd3' : '#dcfce7', height: `${pct}%`, opacity: 0.3, zIndex: 0, transition: 'height 1s ease' }} />

                                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <span style={{ fontSize: 11, fontWeight: 800, color: isFull ? '#e11d48' : '#10b77f' }}>{ward.id}</span>
                                            {isFull && <span style={{ fontSize: 9, fontWeight: 800, color: 'white', background: '#e11d48', padding: '2px 6px', borderRadius: 8, letterSpacing: 1 }}>AT CAPACITY</span>}
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{ward.name}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#64748b' }}>bed</span>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{ward.occupied} / {ward.capacity} Beds</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
