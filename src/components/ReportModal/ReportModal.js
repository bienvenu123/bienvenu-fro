import { useState, useEffect } from 'react';
import { X, Download, Calendar } from 'lucide-react';
import './ReportModal.css';

function ReportModal({ isOpen, onClose, entityType, entityName, data, dateField = 'created_at' }) {
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setReportData(null);
      return;
    }

    // Set default dates based on report type
    const today = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];

    if (reportType === 'daily') {
      setSelectedDate(formatDate(today));
      setStartDate('');
      setEndDate('');
    } else if (reportType === 'weekly') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      setStartDate(formatDate(weekStart));
      setEndDate(formatDate(weekEnd));
      setSelectedDate('');
    } else if (reportType === 'monthly') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(formatDate(monthStart));
      setEndDate(formatDate(monthEnd));
      setSelectedDate('');
    } else if (reportType === 'custom') {
      if (!startDate || !endDate) {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setStartDate(formatDate(monthStart));
        setEndDate(formatDate(monthEnd));
      }
      setSelectedDate('');
    }
  }, [reportType, isOpen]);

  const generateReport = () => {
    if (!data || data.length === 0) {
      alert('No data available to generate report');
      return;
    }

    setLoading(true);
    try {
      // Determine date range
      let dateFrom, dateTo;
      if (reportType === 'daily') {
        dateFrom = selectedDate;
        dateTo = selectedDate;
      } else {
        dateFrom = startDate;
        dateTo = endDate;
      }

      if (!dateFrom || !dateTo) {
        alert('Please select dates');
        setLoading(false);
        return;
      }

      // Filter data by date range
      const filtered = data.filter((item) => {
        const itemDate = item[dateField];
        if (!itemDate) return false;
        const itemDateStr = new Date(itemDate).toISOString().split('T')[0];
        return itemDateStr >= dateFrom && itemDateStr <= dateTo;
      });

      setReportData({
        entityType,
        entityName,
        dateRange: {
          from: dateFrom,
          to: dateTo,
          type: reportType,
        },
        total: filtered.length,
        data: filtered,
      });
    } catch (err) {
      alert('Failed to generate report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format = 'json') => {
    if (!reportData) {
      alert('Please generate a report first');
      return;
    }

    if (format === 'json') {
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${entityName.toLowerCase()}-report-${reportData.dateRange.from}-${reportData.dateRange.to}.json`;
      link.click();
    } else if (format === 'csv') {
      if (reportData.data.length === 0) {
        alert('No data to export');
        return;
      }

      // Get all unique keys from the data
      const keys = Object.keys(reportData.data[0]);
      const csvRows = [];
      
      // Header row
      csvRows.push(keys.join(','));
      
      // Data rows
      reportData.data.forEach((item) => {
        const values = keys.map(key => {
          const value = item[key];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value).replace(/,/g, ';');
        });
        csvRows.push(values.join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${entityName.toLowerCase()}-report-${reportData.dateRange.from}-${reportData.dateRange.to}.csv`;
      link.click();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal-header">
          <h2>Generate {entityName} Report</h2>
          <button className="report-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="report-modal-content">
          <div className="report-config">
            <div className="report-field">
              <label>Report Type *</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="report-select"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>

            {reportType === 'daily' && (
              <div className="report-field">
                <label>Select Date *</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="report-input"
                  required
                />
              </div>
            )}

            {(reportType === 'weekly' || reportType === 'monthly' || reportType === 'custom') && (
              <>
                <div className="report-field">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="report-input"
                    required
                  />
                </div>
                <div className="report-field">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="report-input"
                    required
                  />
                </div>
              </>
            )}

            <button
              className="report-generate-btn"
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>

          {reportData && (
            <div className="report-results">
              <div className="report-summary">
                <div className="summary-header">
                  <h3>Report Summary</h3>
                  <div className="export-btns">
                    <button
                      className="export-btn"
                      onClick={() => exportReport('json')}
                      title="Export as JSON"
                    >
                      <Download size={16} />
                      JSON
                    </button>
                    <button
                      className="export-btn"
                      onClick={() => exportReport('csv')}
                      title="Export as CSV"
                    >
                      <Download size={16} />
                      CSV
                    </button>
                  </div>
                </div>

                <div className="summary-info">
                  <div className="summary-item">
                    <span className="summary-label">Report Type:</span>
                    <span className="summary-value">{reportData.dateRange.type.toUpperCase()}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Date Range:</span>
                    <span className="summary-value">
                      {reportData.dateRange.from} to {reportData.dateRange.to}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Total Records:</span>
                    <span className="summary-value">{reportData.total}</span>
                  </div>
                </div>
              </div>

              {reportData.data.length > 0 && (
                <div className="report-preview">
                  <h4>Preview (showing first 10 records)</h4>
                  <div className="report-table-wrapper">
                    <table className="report-table">
                      <thead>
                        <tr>
                          {Object.keys(reportData.data[0]).slice(0, 6).map((key) => (
                            <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.data.slice(0, 10).map((item, idx) => (
                          <tr key={idx}>
                            {Object.keys(item).slice(0, 6).map((key) => (
                              <td key={key}>
                                {item[key] === null || item[key] === undefined
                                  ? '—'
                                  : typeof item[key] === 'object'
                                  ? JSON.stringify(item[key])
                                  : String(item[key]).length > 50
                                  ? String(item[key]).substring(0, 50) + '...'
                                  : String(item[key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {reportData.data.length > 10 && (
                    <div className="report-more">
                      + {reportData.data.length - 10} more records (see exported file)
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportModal;
