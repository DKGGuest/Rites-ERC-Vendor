import React, { useState, useEffect } from 'react';

const InventoryForm = ({ material, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState(() => {
        if (initialData) {
            return {
                date: initialData.date,
                qty: initialData.qty,
                details: initialData.details || {}
            };
        }

        const base = {
            date: new Date().toISOString().split('T')[0],
            qty: '',
            details: {}
        };

        switch (material.id) {
            case 'hts-wire':
                base.details = {
                    grade: '3ply 3mm',
                    manufacturer: 'Tata Steel',
                    relaxationTest: 'Y',
                    coils: [{ coilNumber: '', lotNo: '', quantity: '' }]
                };
                break;
            case 'cement':
                base.details = {
                    grade: 'OPC 53',
                    manufacturer: '',
                    ewayBillNo: '',
                    ewayDate: '',
                    batches: [{ week: '', year: new Date().getFullYear(), mtcNo: '', quantity: '' }]
                };
                break;
            case 'aggregates':
                base.details = {
                    type: 'CA1',
                    source: '',
                    challanNo: '',
                    challanDate: new Date().toISOString().split('T')[0]
                };
                break;
            case 'admixture':
                base.details = {
                    grade: 'Type 1',
                    manufacturer: '',
                    ewayBillNo: '',
                    ewayDate: new Date().toISOString().split('T')[0],
                    lotNo: '',
                    mtcNo: ''
                };
                break;
            case 'sgci-insert':
                base.details = {
                    grade: 'MK-III Insert',
                    manufacturer: 'Adianth',
                    ewayBillNo: '',
                    ewayDate: new Date().toISOString().split('T')[0],
                    icNo: '',
                    icDate: new Date().toISOString().split('T')[0]
                };
                break;
            case 'dowel':
                base.details = {
                    grade: 'Type A',
                    manufacturer: 'Manufacturer 1',
                    ewayBillNo: '',
                    ewayDate: new Date().toISOString().split('T')[0],
                    icNo: '',
                    icDate: new Date().toISOString().split('T')[0]
                };
                break;
            default:
                break;
        }
        return base;
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                date: initialData.date,
                qty: initialData.qty,
                details: initialData.details || {}
            });
        }
    }, [initialData]);

    const handleChange = (e, field, isDetail = false) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        if (isDetail) {
            setFormData({
                ...formData,
                details: { ...formData.details, [field]: value }
            });
        } else {
            setFormData({ ...formData, [field]: value });
        }
    };

    const calculateAge = (receiptDateStr, mfgWeek, mfgYear) => {
        if (!mfgWeek || !mfgYear || !receiptDateStr) return '0';
        try {
            const receiptDate = new Date(receiptDateStr);
            const mfgDate = new Date(mfgYear, 0, 1 + (mfgWeek - 1) * 7);
            const diffTime = Math.abs(receiptDate - mfgDate);
            const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44);
            if (mfgDate > receiptDate) return '0.0';
            return diffMonths.toFixed(1);
        } catch (e) {
            return '0';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalDetails = { ...formData.details };

        onSubmit({
            id: initialData?.id || `INV-${material.id.toUpperCase().substring(0, 3)}-${Math.floor(Math.random() * 10000)}`,
            status: initialData?.status || 'Unverified',
            ...formData,
            details: finalDetails
        });
    };

    const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' };
    const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '6px' };
    const groupStyle = { marginBottom: '16px' };
    const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' };

    const renderFields = () => {
        switch (material.id) {
            case 'cement':
                const batches = formData.details.batches || [{ week: '', year: new Date().getFullYear(), mtcNo: '', quantity: '' }];
                const handleBatchChange = (index, field, value) => {
                    const newBatches = [...batches];
                    newBatches[index] = { ...newBatches[index], [field]: value };
                    const totalQty = newBatches.reduce((sum, b) => sum + (parseFloat(b.quantity) || 0), 0);
                    setFormData({
                        ...formData,
                        qty: totalQty,
                        details: { ...formData.details, batches: newBatches }
                    });
                };
                const addBatch = () => {
                    const newBatches = [...batches, { week: '', year: new Date().getFullYear(), mtcNo: '', quantity: '' }];
                    setFormData({ ...formData, details: { ...formData.details, batches: newBatches } });
                };
                const removeBatch = (index) => {
                    const newBatches = batches.filter((_, i) => i !== index);
                    const totalQty = newBatches.reduce((sum, b) => sum + (parseFloat(b.quantity) || 0), 0);
                    setFormData({
                        ...formData,
                        qty: totalQty,
                        details: { ...formData.details, batches: newBatches }
                    });
                };

                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={gridStyle}>
                            <div style={groupStyle}>
                                <label style={labelStyle}>Grade / Spec</label>
                                <select value={formData.details.grade || 'OPC 53'} onChange={(e) => handleChange(e, 'grade', true)} required style={inputStyle}>
                                    <option value="OPC 53">OPC 53</option>
                                </select>
                            </div>
                            <div style={groupStyle}>
                                <label style={labelStyle}>Manufacturer</label>
                                <select value={formData.details.manufacturer || ''} onChange={(e) => handleChange(e, 'manufacturer', true)} required style={inputStyle}>
                                    <option value="">Select Manufacturer</option>
                                    <option value="ACC Limited, Wadi">ACC Limited, Wadi</option>
                                    <option value="Ultratech Cement">Ultratech Cement</option>
                                    <option value="Ambuja Cement">Ambuja Cement</option>
                                </select>
                            </div>
                            <div style={groupStyle}><label style={labelStyle}>Eway Bill Number</label><input type="text" value={formData.details.ewayBillNo || ''} onChange={(e) => handleChange(e, 'ewayBillNo', true)} required style={inputStyle} /></div>
                            <div style={groupStyle}><label style={labelStyle}>Eway Date</label><input type="date" value={formData.details.ewayDate || ''} onChange={(e) => handleChange(e, 'ewayDate', true)} required style={inputStyle} /></div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Batch Details</h3>
                                <button type="button" onClick={addBatch} style={{ background: '#42818c', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>+ Add Batch</button>
                            </div>
                            {batches.map((batch, index) => (
                                <div key={index} style={{ marginBottom: index === batches.length - 1 ? 0 : '16px', paddingBottom: index === batches.length - 1 ? 0 : '16px', borderBottom: index === batches.length - 1 ? 'none' : '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr 1.5fr 40px', gap: '12px', alignItems: 'end' }}>
                                        <div><label style={{ ...labelStyle, fontSize: '11px' }}>Week</label><input type="number" min="1" max="53" value={batch.week} onChange={(e) => handleBatchChange(index, 'week', e.target.value)} required style={inputStyle} /></div>
                                        <div><label style={{ ...labelStyle, fontSize: '11px' }}>Year</label><input type="number" value={batch.year} onChange={(e) => handleBatchChange(index, 'year', e.target.value)} required style={inputStyle} /></div>
                                        <div><label style={{ ...labelStyle, fontSize: '11px' }}>MTC No.</label><input type="text" value={batch.mtcNo} onChange={(e) => handleBatchChange(index, 'mtcNo', e.target.value)} required style={inputStyle} /></div>
                                        <div><label style={{ ...labelStyle, fontSize: '11px' }}>Quantity (MT)</label><input type="number" step="0.001" value={batch.quantity} onChange={(e) => handleBatchChange(index, 'quantity', e.target.value)} required style={inputStyle} /></div>
                                        <button type="button" onClick={() => removeBatch(index)} style={{ padding: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }} disabled={batches.length === 1}>×</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={groupStyle}>
                            <label style={{ ...labelStyle, color: '#42818c' }}>Total Qty Received (MT) - Auto Calculated</label>
                            <input type="number" value={formData.qty} readOnly style={{ ...inputStyle, borderColor: '#42818c', background: '#f0fdfa' }} />
                        </div>
                    </div>
                );
            case 'hts-wire':
                const coils = formData.details.coils || [{ coilNumber: '', lotNo: '', quantity: '' }];
                const handleCoilChange = (index, field, value) => {
                    const newCoils = [...coils];
                    newCoils[index] = { ...newCoils[index], [field]: value };
                    const totalQty = newCoils.reduce((sum, c) => sum + (parseFloat(c.quantity) || 0), 0);
                    setFormData({
                        ...formData,
                        qty: totalQty,
                        details: { ...formData.details, coils: newCoils }
                    });
                };
                const addCoil = () => {
                    const newCoils = [...coils, { coilNumber: '', lotNo: '', quantity: '' }];
                    setFormData({ ...formData, details: { ...formData.details, coils: newCoils } });
                };
                const removeCoil = (index) => {
                    const newCoils = coils.filter((_, i) => i !== index);
                    const totalQty = newCoils.reduce((sum, c) => sum + (parseFloat(c.quantity) || 0), 0);
                    setFormData({
                        ...formData,
                        qty: totalQty,
                        details: { ...formData.details, coils: newCoils }
                    });
                };

                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={gridStyle}>
                            <div style={groupStyle}>
                                <label style={labelStyle}>Grade / Spec</label>
                                <select value={formData.details.grade || ''} onChange={(e) => handleChange(e, 'grade', true)} required style={inputStyle}>
                                    <option value="">Select Grade</option>
                                    <option value="3ply 3mm">3ply 3mm</option>
                                </select>
                            </div>
                            <div style={groupStyle}>
                                <label style={labelStyle}>Manufacturer</label>
                                <select value={formData.details.manufacturer || ''} onChange={(e) => handleChange(e, 'manufacturer', true)} required style={inputStyle}>
                                    <option value="">Select Manufacturer</option>
                                    <option value="Tata Steel">Tata Steel</option>
                                    <option value="JSPL">JSPL</option>
                                </select>
                            </div>
                            <div style={groupStyle}><label style={labelStyle}>Eway Bill Number</label><input type="text" value={formData.details.ewayBillNo || ''} onChange={(e) => handleChange(e, 'ewayBillNo', true)} required style={inputStyle} /></div>
                            <div style={groupStyle}><label style={labelStyle}>Eway Date</label><input type="date" value={formData.details.ewayDate || ''} onChange={(e) => handleChange(e, 'ewayDate', true)} required style={inputStyle} /></div>
                            <div style={groupStyle}><label style={labelStyle}>RITES IC Number</label><input type="text" value={formData.details.icNo || ''} onChange={(e) => handleChange(e, 'icNo', true)} required style={inputStyle} /></div>
                            <div style={groupStyle}><label style={labelStyle}>RITES IC Date</label><input type="date" value={formData.details.icDate || ''} onChange={(e) => handleChange(e, 'icDate', true)} required style={inputStyle} /></div>
                            <div style={groupStyle}>
                                <label style={labelStyle}>Relaxation Test (Y/N)</label>
                                <select value={formData.details.relaxationTest || ''} onChange={(e) => handleChange(e, 'relaxationTest', true)} style={inputStyle}>
                                    <option value="Y">Yes</option>
                                    <option value="N">No</option>
                                </select>
                            </div>
                            <div style={groupStyle}><label style={labelStyle}>Relaxation Test Date</label><input type="date" value={formData.details.relaxationDate || ''} onChange={(e) => handleChange(e, 'relaxationDate', true)} style={inputStyle} /></div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Coil Details</h4>
                                <button type="button" onClick={addCoil} style={{ background: '#42818c', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>+ Add Coil</button>
                            </div>
                            {coils.map((coil, index) => (
                                <div key={index} style={{ ...gridStyle, gridTemplateColumns: '1fr 1fr 1fr 40px', alignItems: 'end', marginBottom: index === coils.length - 1 ? 0 : '12px' }}>
                                    <div><label style={{ ...labelStyle, fontSize: '11px' }}>Coil Number</label><input type="text" value={coil.coilNumber} onChange={(e) => handleCoilChange(index, 'coilNumber', e.target.value)} required style={inputStyle} /></div>
                                    <div><label style={{ ...labelStyle, fontSize: '11px' }}>Lot No.</label><input type="text" value={coil.lotNo} onChange={(e) => handleCoilChange(index, 'lotNo', e.target.value)} required style={inputStyle} /></div>
                                    <div><label style={{ ...labelStyle, fontSize: '11px' }}>Quantity (MT)</label><input type="number" step="0.001" value={coil.quantity} onChange={(e) => handleCoilChange(index, 'quantity', e.target.value)} required style={inputStyle} /></div>
                                    <button type="button" onClick={() => removeCoil(index)} style={{ padding: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }} disabled={coils.length === 1}>×</button>
                                </div>
                            ))}
                        </div>

                        <div style={groupStyle}>
                            <label style={{ ...labelStyle, color: '#42818c' }}>Total Qty Received (MT) - Auto Calculated</label>
                            <input type="number" value={formData.qty} readOnly style={{ ...inputStyle, borderColor: '#42818c', background: '#f0fdfa' }} />
                        </div>
                    </div>
                );
            case 'aggregates':
                return (
                    <div style={gridStyle}>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Grade / Spec</label>
                            <select value={formData.details.type || 'CA1'} onChange={(e) => handleChange(e, 'type', true)} required style={inputStyle}>
                                <option value="CA1">CA1</option>
                                <option value="CA2">CA2</option>
                                <option value="FA">FA</option>
                            </select>
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Manufacturer</label>
                            <select value={formData.details.source || ''} onChange={(e) => handleChange(e, 'source', true)} required style={inputStyle}>
                                <option value="">Select Source</option>
                                <option value="Approved Source A">Approved Source A</option>
                                <option value="Global Aggregates">Global Aggregates</option>
                                <option value="Standard Quarries">Standard Quarries</option>
                            </select>
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Challan Number</label>
                            <input type="text" value={formData.details.challanNo || ''} onChange={(e) => handleChange(e, 'challanNo', true)} required style={inputStyle} />
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Challan Date</label>
                            <input type="date" value={formData.details.challanDate || ''} onChange={(e) => handleChange(e, 'challanDate', true)} required style={inputStyle} />
                        </div>
                        <div style={groupStyle}>
                            <label style={{ ...labelStyle, color: '#42818c' }}>Total Qty Received (MT)</label>
                            <input type="number" step="0.001" value={formData.qty} onChange={(e) => handleChange(e, 'qty')} required style={{ ...inputStyle, borderColor: '#42818c' }} />
                        </div>
                    </div>
                );
            case 'admixture':
                return (
                    <div style={gridStyle}>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Grade / Spec</label>
                            <select value={formData.details.grade || 'Type 1'} onChange={(e) => handleChange(e, 'grade', true)} required style={inputStyle}>
                                <option value="Type 1">Type 1</option>
                                <option value="Type 2">Type 2</option>
                            </select>
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Manufacturer</label>
                            <select value={formData.details.manufacturer || ''} onChange={(e) => handleChange(e, 'manufacturer', true)} required style={inputStyle}>
                                <option value="">Select Manufacturer</option>
                                <option value="FOSROC">FOSROC</option>
                                <option value="BASF">BASF</option>
                                <option value="Sika">Sika</option>
                            </select>
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>E Way Bill Number</label>
                            <input type="text" value={formData.details.ewayBillNo || ''} onChange={(e) => handleChange(e, 'ewayBillNo', true)} required style={inputStyle} />
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>E Way Bill Date</label>
                            <input type="date" value={formData.details.ewayDate || ''} onChange={(e) => handleChange(e, 'ewayDate', true)} required style={inputStyle} />
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Lot No.</label>
                            <input type="text" value={formData.details.lotNo || ''} onChange={(e) => handleChange(e, 'lotNo', true)} required style={inputStyle} />
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>MTC No.</label>
                            <input type="text" value={formData.details.mtcNo || ''} onChange={(e) => handleChange(e, 'mtcNo', true)} required style={inputStyle} />
                        </div>
                        <div style={groupStyle}>
                            <label style={{ ...labelStyle, color: '#42818c' }}>Total Quantity</label>
                            <input type="number" step="0.001" value={formData.qty} onChange={(e) => handleChange(e, 'qty')} required style={{ ...inputStyle, borderColor: '#42818c' }} />
                        </div>
                    </div>
                );
            case 'sgci-insert':
                return (
                    <div style={gridStyle}>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Grade / Spec</label>
                            <select value={formData.details.grade || 'MK-III Insert'} onChange={(e) => handleChange(e, 'grade', true)} required style={inputStyle}>
                                <option value="MK-III Insert">MK-III Insert</option>
                                <option value="MK-V Insert">MK-V Insert</option>
                            </select>
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Manufacturer</label>
                            <select value={formData.details.manufacturer || 'Adianth'} onChange={(e) => handleChange(e, 'manufacturer', true)} required style={inputStyle}>
                                <option value="Adianth">Adianth</option>
                            </select>
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Eway Bill Number</label>
                            <input type="text" value={formData.details.ewayBillNo || ''} onChange={(e) => handleChange(e, 'ewayBillNo', true)} required style={inputStyle} />
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Eway Date</label>
                            <input type="date" value={formData.details.ewayDate || ''} onChange={(e) => handleChange(e, 'ewayDate', true)} required style={inputStyle} />
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>RITES IC Number</label>
                            <input type="text" value={formData.details.icNo || ''} onChange={(e) => handleChange(e, 'icNo', true)} required style={inputStyle} />
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>RITES IC Date</label>
                            <input type="date" value={formData.details.icDate || ''} onChange={(e) => handleChange(e, 'icDate', true)} required style={inputStyle} />
                        </div>
                        <div style={groupStyle}>
                            <label style={{ ...labelStyle, color: '#42818c' }}>Total Qty Received (Nos.)</label>
                            <input type="number" step="1" value={formData.qty} onChange={(e) => handleChange(e, 'qty')} required style={{ ...inputStyle, borderColor: '#42818c' }} />
                        </div>
                    </div>
                );
            case 'dowel':
                return (
                    <div style={gridStyle}>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Grade / Spec</label>
                            <select value={formData.details.grade || 'Type A'} onChange={(e) => handleChange(e, 'grade', true)} required style={inputStyle}>
                                <option value="Type A">Type A</option>
                                <option value="Type B">Type B</option>
                            </select>
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Manufacturer</label>
                            <select value={formData.details.manufacturer || 'Manufacturer 1'} onChange={(e) => handleChange(e, 'manufacturer', true)} required style={inputStyle}>
                                <option value="Manufacturer 1">Manufacturer 1</option>
                                <option value="Manufacturer 2">Manufacturer 2</option>
                            </select>
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Eway Bill Number</label>
                            <input type="text" value={formData.details.ewayBillNo || ''} onChange={(e) => handleChange(e, 'ewayBillNo', true)} required style={inputStyle} />
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>Eway Date</label>
                            <input type="date" value={formData.details.ewayDate || ''} onChange={(e) => handleChange(e, 'ewayDate', true)} required style={inputStyle} />
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>RITES IC Number</label>
                            <input type="text" value={formData.details.icNo || ''} onChange={(e) => handleChange(e, 'icNo', true)} required style={inputStyle} />
                        </div>
                        <div style={groupStyle}>
                            <label style={labelStyle}>RITES IC Date</label>
                            <input type="date" value={formData.details.icDate || ''} onChange={(e) => handleChange(e, 'icDate', true)} required style={inputStyle} />
                        </div>
                        <div style={groupStyle}>
                            <label style={{ ...labelStyle, color: '#42818c' }}>Total Qty Received (Nos.)</label>
                            <input type="number" step="1" value={formData.qty} onChange={(e) => handleChange(e, 'qty')} required style={{ ...inputStyle, borderColor: '#42818c' }} />
                        </div>
                    </div>
                );
            default:
                return (
                    <div style={groupStyle}>
                        <label style={labelStyle}>Quantity Received</label>
                        <input type="number" value={formData.qty} onChange={(e) => handleChange(e, 'qty')} required style={inputStyle} />
                    </div>
                );
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
            <div className="fade-in" style={{
                background: 'white', borderRadius: '32px', width: '100%', maxWidth: '750px',
                maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex', flexDirection: 'column'
            }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>
                        {initialData ? 'Edit' : 'Add New'} {material.name}
                    </h2>
                    <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>×</button>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
                    <div style={groupStyle}>
                        <label style={labelStyle}>Date of Receipt</label>
                        <input type="date" value={formData.date} onChange={(e) => handleChange(e, 'date')} required style={{ ...inputStyle, padding: '12px', border: '2px solid #f1f5f9' }} />
                    </div>
                    {renderFields()}
                    <div style={{ marginTop: '32px', display: 'flex', gap: '12px', background: 'white', pt: '16px' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', color: '#64748b' }}>Cancel</button>
                        <button type="submit" style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: '#42818c', color: 'white', fontWeight: '700', boxShadow: '0 10px 15px -3px rgba(66, 129, 140, 0.2)' }}>
                            {initialData ? 'Update Inventory' : 'Save Inventory'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InventoryForm;
