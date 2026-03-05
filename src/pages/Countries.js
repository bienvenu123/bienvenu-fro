import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { getCountries, createCountry, updateCountry, deleteCountry } from '../services/countryService';
import { getTeams } from '../services/teamService';
import { getLeagues } from '../services/leagueService';
import { getPlayers } from '../services/playerService';
import './Countries.css';

function Countries() {
  const [countries, setCountries] = useState([]);
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ country_id: '', name: '', code: '', flag_url: '', continent: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [countriesData, teamsData, leaguesData, playersData] = await Promise.all([
        getCountries(),
        getTeams().catch(() => []),
        getLeagues().catch(() => []),
        getPlayers().catch(() => []),
      ]);
      setCountries(countriesData);
      setTeams(teamsData);
      setLeagues(leaguesData);
      setPlayers(playersData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = useCallback(() => {
    setEditing(null);
    setForm({ country_id: '', name: '', code: '', flag_url: '', continent: '' });
    setModalOpen(true);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Listen for header add button click
    const handleHeaderAdd = (e) => {
      if (e.detail.path === '/countries' || e.detail.path === '/') {
        openCreate();
      }
    };
    
    window.addEventListener('header-add-click', handleHeaderAdd);
    return () => window.removeEventListener('header-add-click', handleHeaderAdd);
  }, [openCreate]);

  const getCountryStats = (countryId) => {
    const countryTeams = teams.filter(t => t.country_id === countryId);
    const countryLeagues = leagues.filter(l => l.country_id === countryId);
    return {
      teams: countryTeams.length,
      leagues: countryLeagues.length,
    };
  };

  const openEdit = (country) => {
    setEditing(country);
    setForm({
      country_id: String(country.country_id),
      name: country.name,
      code: country.code || '',
      flag_url: country.flag_url || '',
      continent: country.continent || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (editing) {
        await updateCountry(editing.country_id, {
          name: form.name.trim(),
          code: form.code.trim().toUpperCase(),
          flag_url: form.flag_url.trim() || null,
          continent: form.continent.trim() || null,
        });
      } else {
        const countryId = parseInt(form.country_id, 10);
        if (!countryId || countryId < 1) {
          setError('Country ID must be a positive number');
          return;
        }
        await createCountry({
          country_id: countryId,
          name: form.name.trim(),
          code: form.code.trim().toUpperCase(),
          flag_url: form.flag_url.trim() || null,
          continent: form.continent.trim() || null,
        });
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (country) => {
    if (!window.confirm(`Delete ${country.name}?`)) return;
    try {
      setError(null);
      await deleteCountry(country.country_id);
      loadData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  const getRegionFromContinent = (continent) => {
    if (!continent) return 'Other';
    const continentLower = continent.toLowerCase();
    if (continentLower.includes('europe')) return 'Europe';
    if (continentLower.includes('america') || continentLower.includes('north') || continentLower.includes('south')) return 'Americas';
    if (continentLower.includes('asia')) return 'Asia';
    if (continentLower.includes('africa')) return 'Africa';
    if (continentLower.includes('oceania') || continentLower.includes('australia')) return 'Oceania';
    return 'Other';
  };

  const filtered = countries.filter((c) => {
    const matchesFilter = filter === 'all' || getRegionFromContinent(c.continent) === filter;
    const matchesSearch = !search.trim() || c.name?.toLowerCase().includes(search.toLowerCase()) || c.code?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Sort by teams count (descending)
  const sortedCountries = [...filtered].sort((a, b) => {
    const statsA = getCountryStats(a.country_id);
    const statsB = getCountryStats(b.country_id);
    return statsB.teams - statsA.teams;
  });

  const totalCountries = countries.length;
  const totalLeagues = leagues.length;
  const totalPlayers = players.length;
  const totalTeams = teams.length;

  // Calculate changes based on created_at dates
  const getItemsAddedThisMonth = (items, dateField = 'created_at') => {
    if (!items || items.length === 0) return 0;
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return items.filter(item => {
      if (!item[dateField]) return false;
      const itemDate = new Date(item[dateField]);
      return itemDate >= firstDayOfMonth;
    }).length;
  };

  const countriesAddedThisMonth = getItemsAddedThisMonth(countries);
  const teamsAddedThisMonth = getItemsAddedThisMonth(teams);
  const activeTeams = teams.filter(t => t.is_active !== false).length;

  const statCards = [
    {
      title: 'TOTAL COUNTRIES',
      value: totalCountries.toLocaleString(),
      change: countriesAddedThisMonth > 0 
        ? `+${countriesAddedThisMonth} added this month` 
        : totalCountries > 0 
        ? `${totalCountries} total` 
        : 'No countries yet',
      trend: countriesAddedThisMonth > 0 ? 'up' : 'up',
    },
    {
      title: 'ACTIVE TEAMS',
      value: activeTeams.toLocaleString(),
      change: teamsAddedThisMonth > 0 
        ? `+${teamsAddedThisMonth} new this month` 
        : activeTeams > 0 
        ? `${activeTeams} of ${totalTeams} teams` 
        : 'No teams yet',
      trend: teamsAddedThisMonth > 0 ? 'up' : 'up',
    },
    {
      title: 'LEAGUES TRACKED',
      value: totalLeagues.toLocaleString(),
      change: totalCountries > 0 
        ? `across ${totalCountries} ${totalCountries === 1 ? 'country' : 'countries'}` 
        : 'No leagues yet',
      trend: 'up',
    },
    {
      title: 'REGISTERED PLAYERS',
      value: totalPlayers >= 1000 
        ? `${(totalPlayers / 1000).toFixed(1)}K` 
        : totalPlayers >= 1000000 
        ? `${(totalPlayers / 1000000).toFixed(1)}M` 
        : totalPlayers.toLocaleString(),
      change: totalPlayers > 0 
        ? `${totalPlayers.toLocaleString()} ${totalPlayers === 1 ? 'player' : 'players'}` 
        : 'No players yet',
      trend: totalPlayers > 0 ? 'up' : 'up',
    },
  ];

  const topByLeagueDensity = [...countries]
    .map(c => ({ ...c, leagueCount: getCountryStats(c.country_id).leagues }))
    .sort((a, b) => b.leagueCount - a.leagueCount)
    .slice(0, 5);

  const regionCounts = {
    Europe: countries.filter(c => getRegionFromContinent(c.continent) === 'Europe').length,
    Americas: countries.filter(c => getRegionFromContinent(c.continent) === 'Americas').length,
    Asia: countries.filter(c => getRegionFromContinent(c.continent) === 'Asia').length,
    Africa: countries.filter(c => getRegionFromContinent(c.continent) === 'Africa').length,
    Oceania: countries.filter(c => getRegionFromContinent(c.continent) === 'Oceania').length,
  };

  // Generate real activity feed from actual data
  const generateActivityFeed = () => {
    const activities = [];

    // Get recent countries (sorted by created_at or updated_at)
    const recentCountries = [...countries]
      .filter(c => c.created_at || c.updated_at)
      .sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at);
        const dateB = new Date(b.updated_at || b.created_at);
        return dateB - dateA;
      })
      .slice(0, 3);

    recentCountries.forEach(country => {
      const date = new Date(country.updated_at || country.created_at);
      const region = getRegionFromContinent(country.continent);
      const timeAgo = getTimeAgo(date);
      
      if (country.updated_at && country.updated_at !== country.created_at) {
        activities.push({
          text: `${country.name} updated`,
          time: timeAgo,
          date: date,
        });
      } else {
        activities.push({
          text: `${country.name} added${region ? ` to ${region} region` : ''}`,
          time: timeAgo,
          date: date,
        });
      }
    });

    // Get recent teams
    const recentTeams = [...teams]
      .filter(t => t.created_at || t.updated_at)
      .sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at);
        const dateB = new Date(b.updated_at || b.created_at);
        return dateB - dateA;
      })
      .slice(0, 2);

    recentTeams.forEach(team => {
      const date = new Date(team.updated_at || team.created_at);
      const timeAgo = getTimeAgo(date);
      const country = countries.find(c => c.country_id === team.country_id);
      const countryName = country ? country.name : 'Unknown';
      
      activities.push({
        text: `${countryName} - ${team.name} ${team.is_active !== false ? 'registered' : 'updated'}`,
        time: timeAgo,
        date: date,
      });
    });

    // Sort all activities by date (most recent first) and take top 4
    return activities
      .sort((a, b) => b.date - a.date)
      .slice(0, 4);
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${Math.floor(diffDays / 7) === 1 ? 'week' : 'weeks'} ago`;
    return `${Math.floor(diffDays / 30)} ${Math.floor(diffDays / 30) === 1 ? 'month' : 'months'} ago`;
  };

  const recentActivities = generateActivityFeed();

  return (
    <div className="countries-page">
      <div className="countries-stats">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">{card.title}</span>
            </div>
            <div className="stat-card-value">{card.value}</div>
            <div className={`stat-card-change ${card.trend}`}>
              {card.trend === 'up' ? (
                <TrendingUp size={14} strokeWidth={2} />
              ) : (
                <TrendingUp size={14} strokeWidth={2} style={{ transform: 'rotate(180deg)' }} />
              )}
              <span>{card.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="countries-content">
        <div className="countries-main">
          <div className="countries-section-header">
            <div>
              <h2 className="countries-section-title">All Countries</h2>
              <p className="countries-section-subtitle">
                {totalCountries} countries - sorted by teams
              </p>
            </div>
            <div className="countries-header-actions">
              <input
                type="text"
                placeholder="Search countries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="countries-search-input"
              />
              <button className="countries-add-btn" onClick={openCreate}>
                <Plus size={18} />
                Add Country
              </button>
            </div>
          </div>

          <div className="countries-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'Europe' ? 'active' : ''}`}
              onClick={() => setFilter('Europe')}
            >
              Europe
            </button>
            <button
              className={`filter-btn ${filter === 'Americas' ? 'active' : ''}`}
              onClick={() => setFilter('Americas')}
            >
              Americas
            </button>
            <button
              className={`filter-btn ${filter === 'Asia' ? 'active' : ''}`}
              onClick={() => setFilter('Asia')}
            >
              Asia
            </button>
          </div>

          {error && (
            <div className="data-error" role="alert">
              {error}
            </div>
          )}

          <div className="countries-table-wrapper">
            {loading ? (
              <div className="data-loading">Loading...</div>
            ) : (
              <table className="countries-table">
                <thead>
                  <tr>
                    <th>COUNTRY</th>
                    <th>REGION</th>
                    <th>TEAMS</th>
                    <th>LEAGUES</th>
                    <th>STATUS</th>
                    <th>TREND</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCountries.map((country) => {
                    const stats = getCountryStats(country.country_id);
                    const region = getRegionFromContinent(country.continent);
                    return (
                      <tr key={country.country_id}>
                        <td>
                          <div className="country-cell">
                            {country.flag_url && (
                              <img src={country.flag_url} alt="" className="country-flag" />
                            )}
                            <div>
                              <div className="country-name">{country.name}</div>
                              <div className="country-code">{country.code}</div>
                            </div>
                          </div>
                        </td>
                        <td>{region}</td>
                        <td>{stats.teams}</td>
                        <td>{stats.leagues}</td>
                        <td>
                          <span className="status-badge status-active">Active</span>
                        </td>
                        <td>
                          <TrendingUp size={16} strokeWidth={2} style={{ color: '#10b981' }} />
                        </td>
                        <td>
                          <div className="action-btns">
                            <button className="edit-btn" onClick={() => openEdit(country)}>
                              <Pencil size={14} />
                            </button>
                            <button className="delete-btn" onClick={() => handleDelete(country)} aria-label="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {!loading && sortedCountries.length === 0 && (
              <div className="data-empty">No countries found</div>
            )}
          </div>
        </div>

        <div className="countries-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Top by League Density</h3>
            <p className="sidebar-card-subtitle">leagues per country</p>
            <div className="density-list">
              {topByLeagueDensity.map((country, index) => (
                <div key={country.country_id} className="density-item">
                  <span className="density-rank">#{index + 1}</span>
                  <span className="density-name">{country.name}</span>
                  <span className="density-value">{getCountryStats(country.country_id).leagues}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Teams by Region</h3>
            <div className="region-chart">
              {Object.entries(regionCounts).map(([region, count]) => {
                const maxCount = Math.max(...Object.values(regionCounts));
                const percentage = (count / maxCount) * 100;
                return (
                  <div key={region} className="region-bar-item">
                    <div className="region-label">{region}</div>
                    <div className="region-bar-wrapper">
                      <div
                        className="region-bar"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="region-value">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Recent Activity</h3>
            <div className="activity-list">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-text">{activity.text}</div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                ))
              ) : (
                <div className="activity-item">
                  <div className="activity-text" style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                    No recent activity
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Country' : 'Add Country'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="modal-row">
                <label>Country ID *</label>
                <input
                  type="number"
                  min="1"
                  value={form.country_id}
                  onChange={(e) => setForm({ ...form, country_id: e.target.value })}
                  disabled={!!editing}
                  required
                />
              </div>
              <div className="modal-row">
                <label>Name *</label>
                <input
                  type="text"
                  maxLength="100"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="modal-row">
                <label>Code *</label>
                <input
                  type="text"
                  maxLength="3"
                  placeholder="e.g. FR"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="modal-row">
                <label>Flag URL</label>
                <input
                  type="url"
                  maxLength="255"
                  placeholder="https://..."
                  value={form.flag_url}
                  onChange={(e) => setForm({ ...form, flag_url: e.target.value })}
                />
              </div>
              <div className="modal-row">
                <label>Continent</label>
                <input
                  type="text"
                  maxLength="50"
                  placeholder="e.g. Europe"
                  value={form.continent}
                  onChange={(e) => setForm({ ...form, continent: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="modal-submit">
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Countries;
