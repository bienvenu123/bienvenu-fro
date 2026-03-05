import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Trophy, Layers, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getCountries } from '../services/countryService';
import { getTeams } from '../services/teamService';
import { getLeagues } from '../services/leagueService';
import { getPlayers } from '../services/playerService';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    countries: 0,
    teams: 0,
    leagues: 0,
    players: 0,
  });
  const [, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [countriesData, teamsData, leaguesData, playersData] = await Promise.all([
          getCountries().catch(() => []),
          getTeams().catch(() => []),
          getLeagues().catch(() => []),
          getPlayers().catch(() => []),
        ]);
        setStats({
          countries: countriesData.length || 0,
          teams: teamsData.length || 0,
          leagues: leaguesData.length || 0,
          players: playersData.length || 0,
        });
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const statCards = [
    {
      title: 'TOTAL COUNTRIES',
      value: stats.countries.toLocaleString(),
      change: '+3 added this month',
      trend: 'up',
      icon: Users,
      color: '#7c3aed',
    },
    {
      title: 'ACTIVE TEAMS',
      value: stats.teams.toLocaleString(),
      change: '+128 new this season',
      trend: 'up',
      icon: Trophy,
      color: '#10b981',
    },
    {
      title: 'LEAGUES TRACKED',
      value: stats.leagues.toLocaleString(),
      change: `across ${stats.countries} countries`,
      trend: 'up',
      icon: Layers,
      color: '#3b82f6',
    },
    {
      title: 'REGISTERED PLAYERS',
      value: stats.players >= 1000 ? `${(stats.players / 1000).toFixed(1)}K` : stats.players.toLocaleString(),
      change: '-0.3% from last season',
      trend: 'down',
      icon: User,
      color: '#f59e0b',
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-stats">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-title">{card.title}</span>
              <card.icon size={20} strokeWidth={2} style={{ color: card.color }} />
            </div>
            <div className="stat-card-value">{card.value}</div>
            <div className={`stat-card-change ${card.trend}`}>
              {card.trend === 'up' ? (
                <TrendingUp size={14} strokeWidth={2} />
              ) : (
                <TrendingDown size={14} strokeWidth={2} />
              )}
              <span>{card.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="dashboard-section">
            <h2 className="dashboard-section-title">
              Welcome{user?.name ? `, ${user.name}` : ''} to FootballDB
            </h2>
            <p className="dashboard-section-subtitle">
              {user?.role === 'ADMIN' 
                ? 'Your comprehensive football database management system - Full Access'
                : user?.role === 'EDITOR'
                ? 'Your comprehensive football database management system - Editor Access (All features except user management)'
                : 'Your comprehensive football database management system - Viewer Access'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
