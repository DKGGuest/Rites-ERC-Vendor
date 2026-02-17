import React, { useState } from 'react';

const ShiftProductionForm = ({ onBack, onSave, lastBatchNumber }) => {
    const [activeSections, setActiveSections] = useState({ 1: true, 2: false, 3: false });
    const [plantType, setPlantType] = useState('Stress Bench'); // Stress Bench or Long Line
    const [formHeader, setFormHeader] = useState({
        unit: 'Shed A',
        shedType: 'Twin',
        date: new Date().toISOString().split('T')[0],
        shift: 'Day Shift',
        batchNo: lastBatchNumber + 1,
        mixDesign: 'M60 - Design A (Active)',
        timeLbc: ''
    });
    const [chambers, setChambers] = useState([{ id: 1, chamberNo: '', benches: [''] }]);
    const [longLineInput, setLongLineInput] = useState('');

    const getSleeperTypeForBench = (benchNo) => {
        if (!benchNo) return null;
        // Mock logic for auto-population: even benches are RT-8746, odd are RT-8521
        return parseInt(benchNo) % 2 === 0 ? 'RT-8746' : 'RT-8521';
    };

    const getChamberSleeperTypes = (benches) => {
        const types = benches.map(b => getSleeperTypeForBench(b)).filter(t => t);
        return [...new Set(types)].join(', ');
    };

    const isBenchDuplicate = (benchNo, currentChamberId, currentBenchIdx) => {
        if (!benchNo) return false;
        const inOtherChambers = chambers.some(c => c.id !== currentChamberId && c.benches.includes(benchNo));
        const currentChamber = chambers.find(c => c.id === currentChamberId);
        const inSameChamber = currentChamber?.benches.some((b, idx) => idx !== currentBenchIdx && b === benchNo);
        return inOtherChambers || inSameChamber;
    };

    const parseGangs = (input) => {
        const parts = input.split(',').map(p => p.trim()).filter(p => p);
        const gangs = [];
        parts.forEach(p => {
            if (p.includes('-')) {
                const [start, end] = p.split('-').map(n => parseInt(n.trim()));
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = Math.min(start, end); i <= Math.max(start, end); i++) gangs.push(i);
                }
            } else {
                const n = parseInt(p);
                if (!isNaN(n)) gangs.push(n);
            }
        });
        return [...new Set(gangs)];
    };

    const toggleSection = (id) => {
        setActiveSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const addChamber = () => {
        setChambers([...chambers, { id: Date.now(), chamberNo: '', benches: [''] }]);
    };

    const updateChamber = (index, field, value) => {
        const newChambers = [...chambers];
        newChambers[index][field] = value;
        setChambers(newChambers);
    };

    const addBenchToChamber = (chamberIndex) => {
        const newChambers = [...chambers];
        newChambers[chamberIndex].benches.push('');
        setChambers(newChambers);
    };

    const updateBench = (chamberIndex, benchIndex, value) => {
        const newChambers = [...chambers];
        newChambers[chamberIndex].benches[benchIndex] = value;
        setChambers(newChambers);
    };

    const calculateTotalCast = () => {
        if (plantType === 'Stress Bench') {
            const sleepersPerBench = formHeader.shedType === 'Single' ? 4 : 8;
            return chambers.reduce((acc, c) => acc + (c.benches.filter(b => b.trim()).length * sleepersPerBench), 0);
        } else {
            const gangs = parseGangs(longLineInput);
            return gangs.length * 8;
        }
    };

    const getProductionBreakdown = () => {
        const counts = {};
        if (plantType === 'Stress Bench') {
            const sleepersPerBench = formHeader.shedType === 'Single' ? 4 : 8;
            chambers.forEach(c => {
                c.benches.forEach(b => {
                    const type = getSleeperTypeForBench(b);
                    if (type) {
                        counts[type] = (counts[type] || 0) + sleepersPerBench;
                    }
                });
            });
        } else {
            const gangs = parseGangs(longLineInput);
            const type = 'RT-8746';
            if (gangs.length > 0) counts[type] = gangs.length * 8;
        }
        return counts;
    };

    const sectionHeaderStyle = {
        background: '#f8fafc',
        padding: '16px 24px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none'
    };

    const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' };
    const inputStyle = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', transition: 'border-color 0.2s' };
    const radioStyle = { width: '18px', height: '18px', cursor: 'pointer', accentColor: '#42818c' };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <button
                    onClick={onBack}
                    style={{ background: 'none', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', color: '#64748b' }}
                >
                    ← Back
                </button>
                <h2 style={{ margin: 0, color: '#1e293b', fontWeight: '800' }}>New Shift Production Declaration</h2>
            </div>

            {/* Section 1: Batch Header */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={sectionHeaderStyle} onClick={() => toggleSection(1)}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Section 1: Batch Header (Initial Declaration)</h3>
                    <span>{activeSections[1] ? '▼' : '▶'}</span>
                </div>
                {activeSections[1] && (
                    <div style={{ padding: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={labelStyle}>Plant Type</label>
                                <div style={{ display: 'flex', gap: '30px', marginTop: '10px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>
                                        <input type="radio" name="plantType" checked={plantType === 'Stress Bench'} onChange={() => setPlantType('Stress Bench')} style={radioStyle} />
                                        Stress Bench
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>
                                        <input type="radio" name="plantType" checked={plantType === 'Long Line'} onChange={() => setPlantType('Long Line')} style={radioStyle} />
                                        Long Line
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>{plantType === 'Stress Bench' ? 'Production Unit (Shed No.)' : 'Production Unit (Line No.)'}</label>
                                <select
                                    style={inputStyle}
                                    value={formHeader.unit}
                                    onChange={(e) => setFormHeader({ ...formHeader, unit: e.target.value })}
                                >
                                    <option value="">Select Unit</option>
                                    {plantType === 'Stress Bench' ? (
                                        <>
                                            <option value="Shed A">Shed A</option>
                                            <option value="Shed B">Shed B</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Line 1">Line 1</option>
                                            <option value="Line 2">Line 2</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            {plantType === 'Stress Bench' && (
                                <div>
                                    <label style={labelStyle}>Shed Type</label>
                                    <select
                                        style={inputStyle}
                                        value={formHeader.shedType}
                                        onChange={(e) => setFormHeader({ ...formHeader, shedType: e.target.value })}
                                    >
                                        <option value="Single">Single (4 Moulds)</option>
                                        <option value="Twin">Twin (8 Moulds)</option>
                                    </select>
                                </div>
                            )}
                            <div>
                                <label style={labelStyle}>Date of Casting</label>
                                <input
                                    type="date"
                                    max={new Date().toISOString().split('T')[0]}
                                    value={formHeader.date}
                                    onChange={(e) => setFormHeader({ ...formHeader, date: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Shift</label>
                                <select
                                    style={inputStyle}
                                    value={formHeader.shift}
                                    onChange={(e) => setFormHeader({ ...formHeader, shift: e.target.value })}
                                >
                                    <option value="Day Shift">Day Shift</option>
                                    <option value="Night Shift">Night Shift</option>
                                    <option value="A">A (08:00 - 20:00)</option>
                                    <option value="B">B (20:00 - 08:00)</option>
                                    <option value="C">C</option>
                                    <option value="General">General</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Batch Number</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 103"
                                    value={formHeader.batchNo}
                                    onChange={(e) => setFormHeader({ ...formHeader, batchNo: e.target.value })}
                                    style={inputStyle}
                                />
                                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>Auto-suggested: Last Batch + 1</span>
                            </div>
                            <div>
                                <label style={labelStyle}>Mix Design Reference</label>
                                <select
                                    style={inputStyle}
                                    value={formHeader.mixDesign}
                                    onChange={(e) => setFormHeader({ ...formHeader, mixDesign: e.target.value })}
                                >
                                    <option value="M60 - Design A (Active)">M60 - Design A (Active)</option>
                                    <option value="M60 - Design B">M60 - Design B</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Time of L.B.C (Last Bench Casting)</label>
                                <input type="time" style={inputStyle} value={formHeader.timeLbc} onChange={(e) => setFormHeader({ ...formHeader, timeLbc: e.target.value })} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Section 2: Casting & Bench Mapping */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={sectionHeaderStyle} onClick={() => toggleSection(2)}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Section 2: Casting & Bench Mapping</h3>
                    <span>{activeSections[2] ? '▼' : '▶'}</span>
                </div>
                {activeSections[2] && (
                    <div style={{ padding: '24px' }}>
                        {plantType === 'Stress Bench' ? (
                            <div>
                                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Map benches grouped by steam chambers. Each chamber requires 1 test sample.</p>
                                    <button onClick={addChamber} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>+ Add Chamber Group</button>
                                </div>

                                {chambers.map((chamber, cIdx) => (
                                    <div key={chamber.id} style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.5fr 0.8fr 1.5fr 0.8fr', gap: '20px', alignItems: 'start' }}>
                                            <div>
                                                <label style={labelStyle}>Chamber No.</label>
                                                <input type="number" value={chamber.chamberNo} onChange={(e) => updateChamber(cIdx, 'chamberNo', e.target.value)} style={inputStyle} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Benches Cast (Bench #)</label>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {chamber.benches.map((bench, bIdx) => {
                                                        const isDuplicate = isBenchDuplicate(bench, chamber.id, bIdx);
                                                        return (
                                                            <div key={bIdx} style={{ position: 'relative' }}>
                                                                <input
                                                                    type="text"
                                                                    value={bench}
                                                                    onChange={(e) => updateBench(cIdx, bIdx, e.target.value)}
                                                                    style={{
                                                                        ...inputStyle,
                                                                        width: '60px',
                                                                        padding: '8px',
                                                                        borderColor: isDuplicate ? '#ef4444' : '#cbd5e1',
                                                                        backgroundColor: isDuplicate ? '#fef2f2' : 'white'
                                                                    }}
                                                                />
                                                                {isDuplicate && <span style={{ position: 'absolute', bottom: '-14px', left: 0, fontSize: '9px', color: '#ef4444', fontWeight: 'bold' }}>Duplicate</span>}
                                                            </div>
                                                        );
                                                    })}
                                                    <button onClick={() => addBenchToChamber(cIdx)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px dashed #cbd5e1', background: 'white', cursor: 'pointer' }}>+</button>
                                                </div>
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Benches</label>
                                                <div style={{ ...inputStyle, background: '#f1f5f9', textAlign: 'center', fontWeight: 'bold' }}>
                                                    {chamber.benches.filter(b => b.trim()).length}
                                                </div>
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Sleeper Type</label>
                                                <div style={{ ...inputStyle, background: '#f1f5f9', color: '#475569', minHeight: '45px', display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                                                    {getChamberSleeperTypes(chamber.benches) || 'N/A'}
                                                </div>
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Mould per bench</label>
                                                <div style={{ ...inputStyle, background: '#f1f5f9', textAlign: 'center', fontWeight: 'bold' }}>
                                                    {formHeader.shedType === 'Single' ? 4 : 8}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                                <div style={{ display: 'grid', gap: '24px' }}>
                                    <div>
                                        <label style={labelStyle}>Enter Gangs (e.g. 1-5, 8, 10-12)</label>
                                        <input
                                            type="text"
                                            placeholder="Enter range or individual numbers separated by comma"
                                            value={longLineInput}
                                            onChange={(e) => setLongLineInput(e.target.value)}
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={labelStyle}>Total Gangs Count</label>
                                            <div style={{ ...inputStyle, background: '#f1f5f9', fontWeight: '700' }}>
                                                {parseGangs(longLineInput).length}
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={labelStyle}>Sleeper Type</label>
                                            <div style={{ ...inputStyle, background: '#f1f5f9', fontWeight: '700' }}>
                                                RT-8746 (Default)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Sleepers per Gang</p>
                                    <h2 style={{ margin: 0, fontSize: '36px', color: '#42818c', fontWeight: '900' }}>8</h2>
                                    <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>(Fixed for Long Line)</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Section 3: Summary & Observation */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={sectionHeaderStyle} onClick={() => toggleSection(3)}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>Section 3: Summary & Observation</h3>
                    <span>{activeSections[3] ? '▼' : '▶'}</span>
                </div>
                {activeSections[3] && (
                    <div style={{ padding: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
                            <div style={{ background: '#f0f9fa', padding: '24px', borderRadius: '16px', border: '1px solid #ccfbf1' }}>
                                <h4 style={{ margin: '0 0 16px 0', color: '#115e59', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase' }}>Production Calculation</h4>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#64748b', fontSize: '14px' }}>Total Casted Sleepers:</span>
                                        <span style={{ color: '#115e59', fontSize: '20px', fontWeight: '800' }}>{calculateTotalCast()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#64748b', fontSize: '14px' }}>Total Types of Sleepers:</span>
                                        <span style={{ color: '#115e59', fontSize: '20px', fontWeight: '800' }}>{Object.keys(getProductionBreakdown()).length}</span>
                                    </div>
                                    <div style={{ borderTop: '1px dashed #ccfbf1', paddingTop: '10px', marginTop: '5px' }}>
                                        <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Breakdown by Type:</span>
                                        {Object.entries(getProductionBreakdown()).map(([type, count]) => (
                                            <div key={type} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ color: '#64748b', fontSize: '13px' }}>{type}:</span>
                                                <span style={{ color: '#115e59', fontSize: '14px', fontWeight: '700' }}>{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginTop: '20px', padding: '12px', background: 'white', borderRadius: '8px', fontSize: '11px', color: '#0d9488' }}>
                                    <strong>Triggers:</strong> Visual Inspection, Steam Cube Testing, Water Cube Testing tasks will be auto-generated for the IE.
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Remarks / Observations</label>
                                <textarea rows="6" style={{ ...inputStyle, resize: 'none' }} placeholder="Enter any specific observations about this shift production..."></textarea>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Form Actions */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button
                    onClick={onBack}
                    style={{ background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
                >
                    Cancel
                </button>
                <button
                    onClick={() => {
                        const newDeclaration = {
                            date: formHeader.date,
                            shift: formHeader.shift,
                            batchNo: `B-${formHeader.batchNo}`,
                            unit: formHeader.unit,
                            total: calculateTotalCast(),
                            sleeperTypes: Object.keys(getProductionBreakdown()).join(', '),
                            status: 'Open'
                        };
                        onSave(newDeclaration);
                        alert(`Production Declaration Submitted successfully!\nUnique Batch Record Created: B-${formHeader.batchNo}\nSleeper IDs Generated (Digital Twin)\nTasks assigned to IE Dashboard.`);
                        onBack();
                    }}
                    style={{ background: '#42818c', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(66, 129, 140, 0.4)' }}
                >
                    Submit Declaration
                </button>
            </div>
        </div>
    );
};

export default ShiftProductionForm;
