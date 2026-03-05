import { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp, Users, Trophy } from 'lucide-react';
import { getCountries } from '../services/countryService';
import { getTeams } from '../services/teamService';
import { getPlayers } from '../services/playerService';
import { getMatches } from '../services/matchService';
import { getLeagues } from '../services/leagueService';
import { getTransfers } from '../services/transferService';
import './Reports.css';

function Reports() {
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [filterEntity, setFilterEntity] = useState('all');
  const [filterValue, setFilterValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [countries, setCountries] = useState([]);
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);

  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [countriesData, teamsData, leaguesData] = await Promise.all([
          getCountries().catch(() => []),
          getTeams().catch(() => []),
          getLeagues().catch(() => []),
        ]);
        setCountries(countriesData);
        setTeams(teamsData);
        setLeagues(leaguesData);
      } catch (err) {
        console.error('Failed to load filter data:', err);
      }
    };
    loadFilterData();
  }, []);

  useEffect(() => {
    // Set default dates based on report type
    const today = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];

    if (reportType === 'daily') {
      setSelectedDate(formatDate(today));
      setStartDate('');
      setEndDate('');
    } else if (reportType === 'weekly') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
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
      // Only set defaults if dates are empty (use functional update to avoid dependency)
      setStartDate(prev => {
        if (!prev) {
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          return formatDate(monthStart);
        }
        return prev;
      });
      setEndDate(prev => {
        if (!prev) {
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          return formatDate(monthEnd);
        }
        return prev;
      });
      setSelectedDate('');
    }
    // Intentionally omit startDate/endDate to avoid resetting user-selected dates when reportType changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]);

  const generateReport = async () => {
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

      // Fetch data based on filters
      const [matchesData, transfersData, playersData, teamsData] = await Promise.all([
        getMatches().catch(() => []),
        getTransfers().catch(() => []),
        getPlayers().catch(() => []),
        getTeams().catch(() => []),
      ]);

      // Filter data by date range
      const filterByDate = (item, dateField = 'created_at') => {
        if (!item[dateField]) return false;
        const itemDate = new Date(item[dateField]).toISOString().split('T')[0];
        return itemDate >= dateFrom && itemDate <= dateTo;
      };

      const filteredMatches = matchesData.filter(m => {
        if (!m.match_date) return false;
        const matchDate = new Date(m.match_date).toISOString().split('T')[0];
        return matchDate >= dateFrom && matchDate <= dateTo;
      });

      const filteredTransfers = transfersData.filter(t => filterByDate(t, 'transfer_date'));

      // Apply entity filter if selected
      let filteredByEntity = {
        matches: filteredMatches,
        transfers: filteredTransfers,
        players: playersData,
        teams: teamsData,
      };

      if (filterEntity !== 'all' && filterValue) {
        if (filterEntity === 'country') {
          const countryId = parseInt(filterValue);
          filteredByEntity.teams = teamsData.filter(t => t.country_id === countryId);
          filteredByEntity.players = playersData.filter(p => {
            const playerTeam = teamsData.find(t => t.team_id === p.team_id);
            return playerTeam && playerTeam.country_id === countryId;
          });
        } else if (filterEntity === 'team') {
          const teamId = parseInt(filterValue);
          filteredByEntity.players = playersData.filter(p => p.team_id === teamId);
        } else if (filterEntity === 'league') {
          const leagueId = parseInt(filterValue);
          // Filter matches by league
          filteredByEntity.matches = filteredMatches.filter(m => m.league_id === leagueId);
        }
      }

      // Calculate statistics
      const stats = {
        dateRange: {
          from: dateFrom,
          to: dateTo,
          type: reportType,
        },
        matches: {
          total: filteredByEntity.matches.length,
          data: filteredByEntity.matches,
        },
        transfers: {
          total: filteredByEntity.transfers.length,
          data: filteredByEntity.transfers,
        },
        players: {
          total: filteredByEntity.players.length,
          data: filteredByEntity.players,
        },
        teams: {
          total: filteredByEntity.teams.length,
          data: filteredByEntity.teams,
        },
      };

      setReportData(stats);
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
      link.download = `report-${reportData.dateRange.from}-${reportData.dateRange.to}.json`;
      link.click();
    } else if (format === 'csv') {
      // Simple CSV export for matches
      const csvRows = [];
      csvRows.push('Report Type,Date From,Date To,Matches,Transfers,Players,Teams');
      csvRows.push(
        `${reportData.dateRange.type},${reportData.dateRange.from},${reportData.dateRange.to},${reportData.matches.total},${reportData.transfers.total},${reportData.players.total},${reportData.teams.total}`
      );
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportData.dateRange.from}-${reportData.dateRange.to}.csv`;
      link.click();
    }
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1 className="reports-title">Reports</h1>
        <p className="reports-subtitle">Generate and export reports for your football database</p>
      </div>

      <div className="reports-content">
        <div className="reports-controls">
          <div className="report-card">
            <h3 className="report-card-title">Report Configuration</h3>

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

            <div className="report-field">
              <label>Filter By</label>
              <select
                value={filterEntity}
                onChange={(e) => {
                  setFilterEntity(e.target.value);
                  setFilterValue('');
                }}
                className="report-select"
              >
                <option value="all">All Data</option>
                <option value="country">Country</option>
                <option value="team">Team</option>
                <option value="league">League</option>
              </select>
            </div>

            {filterEntity !== 'all' && (
              <div className="report-field">
                <label>
                  {filterEntity === 'country' ? 'Select Country' :
                   filterEntity === 'team' ? 'Select Team' :
                   'Select League'}
                </label>
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="report-select"
                >
                  <option value="">Select...</option>
                  {filterEntity === 'country' && countries.map((c) => (
                    <option key={c.country_id} value={c.country_id}>
                      {c.name}
                    </option>
                  ))}
                  {filterEntity === 'team' && teams.map((t) => (
                    <option key={t.team_id} value={t.team_id}>
                      {t.name}
                    </option>
                  ))}
                  {filterEntity === 'league' && leagues.map((l) => (
                    <option key={l.league_id} value={l.league_id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              className="report-generate-btn"
              onClick={generateReport}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {reportData && (
          <div className="reports-results">
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
              </div>

              <div className="summary-stats">
                <div className="stat-box">
                  <div className="stat-icon" style={{ background: '#7c3aed' }}>
                    <Calendar size={20} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{reportData.matches.total}</div>
                    <div className="stat-label">Matches</div>
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-icon" style={{ background: '#10b981' }}>
                    <TrendingUp size={20} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{reportData.transfers.total}</div>
                    <div className="stat-label">Transfers</div>
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-icon" style={{ background: '#3b82f6' }}>
                    <Users size={20} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{reportData.players.total}</div>
                    <div className="stat-label">Players</div>
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-icon" style={{ background: '#f59e0b' }}>
                    <Trophy size={20} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{reportData.teams.total}</div>
                    <div className="stat-label">Teams</div>
                  </div>
                </div>
              </div>
            </div>

            {reportData.matches.data.length > 0 && (
              <div className="report-section">
                <h4 className="report-section-title">Matches ({reportData.matches.total})</h4>
                <div className="report-table-wrapper">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Home Team</th>
                        <th>Away Team</th>
                        <th>Score</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.matches.data.slice(0, 10).map((match) => (
                        <tr key={match.match_id}>
                          <td>{match.match_id}</td>
                          <td>{new Date(match.match_date).toLocaleDateString()}</td>
                          <td>{match.home_team_id}</td>
                          <td>{match.away_team_id}</td>
                          <td>
                            {match.home_score !== null && match.away_score !== null
                              ? `${match.home_score} - ${match.away_score}`
                              : '—'}
                          </td>
                          <td>{match.status || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reportData.matches.data.length > 10 && (
                    <div className="report-more">
                      + {reportData.matches.data.length - 10} more matches (see exported file)
                    </div>
                  )}
                </div>
              </div>
            )}

            {reportData.transfers.data.length > 0 && (
              <div className="report-section">
                <h4 className="report-section-title">Transfers ({reportData.transfers.total})</h4>
                <div className="report-table-wrapper">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Player</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.transfers.data.slice(0, 10).map((transfer) => (
                        <tr key={transfer.transfer_id}>
                          <td>{transfer.transfer_id}</td>
                          <td>{new Date(transfer.transfer_date).toLocaleDateString()}</td>
                          <td>{transfer.player_id}</td>
                          <td>{transfer.from_team_id}</td>
                          <td>{transfer.to_team_id}</td>
                          <td>{transfer.transfer_type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reportData.transfers.data.length > 10 && (
                    <div className="report-more">
                      + {reportData.transfers.data.length - 10} more transfers (see exported file)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;
