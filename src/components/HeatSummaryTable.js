// src/components/HeatSummaryTable.js
// Heat Summary Table Component for Process Inspection Call
// Displays heat-wise summary with accepted quantity, max ERC, manufactured, offered, and future balance

import React from 'react';
import '../styles/heatSummaryTable.css';

const HeatSummaryTable = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <p>Loading heat summary data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        <p>Select RM IC Numbers to view heat summary</p>
      </div>
    );
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Critical':
        return '#ef4444'; // Red
      case 'Good':
        return '#10b981'; // Green
      case 'Exhausted':
        return '#f59e0b'; // Amber
      default:
        return '#6b7280'; // Gray
    }
  };

  // Helper function to format numeric values as integers (no decimals)
  const formatAsInteger = (value) => {
    if (value === null || value === undefined) {
      return '0';
    }
    // Convert to number and round down to nearest integer
    return Math.floor(parseFloat(value)).toString();
  };

  return (
    <div className="heat-summary-container">
      <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
        Heat Summary
      </h3>
      
      <div className="heat-summary-table-wrapper">
        <table className="heat-summary-table">
          <thead>
            <tr>
              <th>Heat No.</th>
              <th>Accepted (MT)</th>
              <th>Max ERC</th>
              <th>Manufactured</th>
              <th>Offered Now</th>
              <th>Future Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td className="heat-no-cell">{row.heatNo}</td>
                <td className="numeric-cell">{formatAsInteger(row.acceptedMt)}</td>
                <td className="numeric-cell">{formatAsInteger(row.maxErc)}</td>
                <td className="numeric-cell">{formatAsInteger(row.manufactured)}</td>
                <td className="numeric-cell">{formatAsInteger(row.offeredNow)}</td>
                <td className={`numeric-cell ${row.futureBalance < 0 ? 'negative' : ''}`}>
                  {formatAsInteger(row.futureBalance)}
                </td>
                <td className="status-cell">
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusBadgeColor(row.status),
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      display: 'inline-block'
                    }}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HeatSummaryTable;

