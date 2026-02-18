import React, { useState } from 'react';

const PoAssignedDashboard = () => {
    const [pos] = useState([
        { id: 1, poNo: 'PO/SLP/2026/001', date: '2026-01-15', description: 'Monoblock Concrete Sleepers', qty: 50000, unit: 'Nos', status: 'Active' },
        { id: 2, poNo: 'PO/SLP/2026/045', date: '2026-02-01', description: 'Turnout Sleepers Set', qty: 120, unit: 'Sets', status: 'Active' },
        { id: 3, poNo: 'PO/SLP/2025/112', date: '2025-11-20', description: 'Monoblock Concrete Sleepers', qty: 25000, unit: 'Nos', status: 'Completed' },
    ]);

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '24px', fontWeight: '800' }}>Purchase Orders Assigned</h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Overview of all POs assigned to your plant</p>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>PO Details</th>
                            <th style={{ padding: '20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Description</th>
                            <th style={{ padding: '20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Total Quantity</th>
                            <th style={{ padding: '20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                            <th style={{ padding: '20px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pos.map((po, index) => (
                            <tr key={po.id} style={{ borderBottom: index === pos.length - 1 ? 'none' : '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                <td style={{ padding: '20px' }}>
                                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>{po.poNo}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Dated: {po.date}</div>
                                </td>
                                <td style={{ padding: '20px', color: '#475569', fontSize: '14px' }}>
                                    {po.description}
                                </td>
                                <td style={{ padding: '20px', textAlign: 'right' }}>
                                    <div style={{ fontWeight: '700', color: '#1e293b' }}>{po.qty.toLocaleString()}</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{po.unit}</div>
                                </td>
                                <td style={{ padding: '20px', textAlign: 'center' }}>
                                    <span style={{
                                        background: po.status === 'Active' ? '#f0fdf4' : '#f1f5f9',
                                        color: po.status === 'Active' ? '#166534' : '#64748b',
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        fontSize: '11px',
                                        fontWeight: '700'
                                    }}>
                                        {po.status}
                                    </span>
                                </td>
                                <td style={{ padding: '20px', textAlign: 'center' }}>
                                    <button style={{
                                        background: 'none',
                                        border: '1px solid #e2e8f0',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: '#475569',
                                        cursor: 'pointer'
                                    }}>
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PoAssignedDashboard;
