import React, { useState } from 'react';
import PlantDeclarationDashboard from './plantDeclaration/PlantDeclarationDashboard';
import ProductionDeclarationDashboard from './ProductionDeclarationDashboard';
import InventoryManagementDashboard from './inventoryManagement/InventoryManagementDashboard';
import PoAssignedDashboard from './PoAssignedDashboard';
import CallsRequestedDashboard from './CallsRequestedDashboard';
import CallsCompletedDashboard from './CallsCompletedDashboard';
import FinanceDashboard from './FinanceDashboard';
import MasterUpdatingDashboard from './MasterUpdatingDashboard';

const VendorDashboard = () => {
    const [selectedModule, setSelectedModule] = useState('inventory-management');

    const modules = [
        { id: 'plant-declaration', title: 'Plant Declaration', subtitle: 'Plant setup & masters', icon: '🏗️' },
        { id: 'inventory-management', title: 'Inventory Management System', subtitle: 'Stock & consumption', icon: '📦' },
        { id: 'production-declaration', title: 'Production Declaration', subtitle: 'Daily production logs', icon: '📝' },
        { id: 'calibration-approval', title: 'Calibration & Approval', subtitle: 'Equipment validation', icon: '⚖️' },
        { id: 'po-assigned', title: 'PO Assigned', subtitle: 'POs assigned to vendor with status', count: 1 },
        { id: 'calls-requested', title: 'Requested Calls', subtitle: 'Request Inspection Call Status', count: 0 },
        { id: 'calls-completed', title: 'Completed Calls', subtitle: 'Inspection Calls & IC Download', count: 4 },
        { id: 'finance', title: 'Finance', subtitle: 'Payments & Billings', count: 2 },
        { id: 'master-updating', title: 'Master Updating', subtitle: 'Resource masters', count: 3 }
    ];

    const quickOverviewModules = modules.slice(4);
    const plantManagementModules = modules.slice(0, 4);

    const renderContent = () => {
        switch (selectedModule) {
            case 'plant-declaration':
                return <PlantDeclarationDashboard />;
            case 'production-declaration':
                return <ProductionDeclarationDashboard />;
            case 'inventory-management':
                return <InventoryManagementDashboard />;
            case 'po-assigned':
                return <PoAssignedDashboard />;
            case 'calls-requested':
                return <CallsRequestedDashboard />;
            case 'calls-completed':
                return <CallsCompletedDashboard />;
            case 'finance':
                return <FinanceDashboard />;
            case 'master-updating':
                return <MasterUpdatingDashboard />;
            default:
                return (
                    <div style={{ textAlign: 'center', padding: '100px 0', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🏗️</div>
                        <h3>{modules.find(m => m.id === selectedModule)?.title}</h3>
                        <p>This module is currently under development.</p>
                    </div>
                );
        }
    };

    return (
        <div className="dashboard-container" style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
            <header style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: '800',
                            color: '#1e293b',
                            margin: '0 0 4px 0',
                            letterSpacing: '-0.025em'
                        }}>
                            Sleeper Vendor Dashboard
                        </h1>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                            Quality assurance and production management system
                        </p>
                    </div>
                </div>
            </header>

            {/* Quick Overview Section */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '32px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>Quick Overview</h2>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Monitor your POs and inspection calls at a glance</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px'
                }}>
                    {quickOverviewModules.map(mod => (
                        <div
                            key={mod.id}
                            onClick={() => setSelectedModule(mod.id)}
                            style={{
                                background: selectedModule === mod.id ? '#eff6ff' : 'white',
                                border: `1.5px solid ${selectedModule === mod.id ? '#2563eb' : '#e2e8f0'}`,
                                borderRadius: '16px',
                                padding: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: selectedModule === mod.id ? '0 4px 12px rgba(37, 99, 235, 0.1)' : 'none'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{
                                    fontWeight: '700',
                                    fontSize: '16px',
                                    color: selectedModule === mod.id ? '#1e40af' : '#1e293b'
                                }}>
                                    {mod.title}
                                </span>
                                <span style={{
                                    fontSize: '12px',
                                    color: selectedModule === mod.id ? '#3b82f6' : '#64748b',
                                    fontWeight: '500'
                                }}>
                                    {mod.subtitle}
                                </span>
                            </div>
                            <span style={{
                                fontSize: '32px',
                                fontWeight: '800',
                                color: selectedModule === mod.id ? '#2563eb' : '#0f172a',
                                opacity: selectedModule === mod.id ? 1 : 0.8
                            }}>
                                {mod.count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Plant Management Section */}
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Plant Management</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px'
                }}>
                    {plantManagementModules.map(mod => (
                        <div
                            key={mod.id}
                            onClick={() => setSelectedModule(mod.id)}
                            style={{
                                background: selectedModule === mod.id ? '#f0f9fa' : 'white',
                                border: `2px solid ${selectedModule === mod.id ? '#42818c' : '#e2e8f0'}`,
                                borderRadius: '24px',
                                padding: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                gap: '8px'
                            }}
                        >
                            <div style={{ fontSize: '24px' }}>{mod.icon}</div>
                            <span style={{
                                fontWeight: '700',
                                fontSize: '14px',
                                color: '#42818c'
                            }}>
                                {mod.title}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>{mod.subtitle}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="fade-in" style={{ marginTop: '20px' }}>
                {renderContent()}
            </div>
        </div>
    );
};

export default VendorDashboard;
