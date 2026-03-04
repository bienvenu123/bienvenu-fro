import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Globe, Trophy, Award, Medal, Activity, Layers, Users, UserCheck, Calendar, Zap, Grid, List, User, BarChart, FileText, TrendingUp, LineChart, MapPin, CalendarCheck, Target, Flag, CalendarRange, Building2, BarChart3, Briefcase, BarChart2, ActivitySquare, ArrowRightLeft, ChevronDown, ChevronRight, FileBarChart, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const coreItems = [
  { to: '/countries', icon: Globe, label: 'Countries', badge: null },
  { to: '/teams', icon: Trophy, label: 'Teams', badge: null },
  { to: '/awards', icon: Award, label: 'Awards', badge: null },
  { to: '/award-winners', icon: Medal, label: 'Award Winners', badge: null },
];

const peopleItems = [
  { to: '/managers', icon: UserCheck, label: 'Managers', badge: null },
  { to: '/players', icon: User, label: 'Players', badge: null },
  { to: '/referees', icon: Flag, label: 'Referees', badge: null },
];

const competitionsItems = [
  { to: '/leagues', icon: Trophy, label: 'Leagues', badge: null },
  { to: '/league-teams', icon: Users, label: 'League Teams', badge: null },
  { to: '/seasons', icon: CalendarRange, label: 'Seasons', badge: null },
  { to: '/standings', icon: BarChart3, label: 'Standings', badge: null },
];

const matchesItems = [
  { to: '/matches', icon: Calendar, label: 'Matches', badge: null },
  { to: '/match-events', icon: Zap, label: 'Match Events', badge: null },
  { to: '/match-formations', icon: Grid, label: 'Match Formations', badge: null },
  { to: '/match-lineups', icon: List, label: 'Match Lineups', badge: null },
  { to: '/team-match-stats', icon: BarChart2, label: 'Match Stats', badge: null },
];

const playerDataItems = [
  { to: '/player-attributes', icon: BarChart, label: 'Player Attributes', badge: null },
  { to: '/player-contracts', icon: FileText, label: 'Player Contracts', badge: null },
  { to: '/player-positions', icon: MapPin, label: 'Player Positions', badge: null },
  { to: '/injuries', icon: Activity, label: 'Injuries', badge: null },
];

const analyticsItems = [
  { to: '/player-market-values', icon: TrendingUp, label: 'Market Values', badge: null },
  { to: '/positions', icon: Target, label: 'Positions', badge: null },
  { to: '/stadiums', icon: Building2, label: 'Stadiums', badge: null },
  { to: '/reports', icon: FileBarChart, label: 'Reports', badge: null },
];

const systemItems = [
  { to: '/users', icon: Shield, label: 'Users', badge: null },
];

const otherItems = [
  { to: '/team-managers', icon: Briefcase, label: 'Team Managers', badge: null },
  { to: '/team-season-stats', icon: ActivitySquare, label: 'Team Season Stats', badge: null },
  { to: '/player-match-stats', icon: LineChart, label: 'Player Match Stats', badge: null },
  { to: '/player-season-stats', icon: CalendarCheck, label: 'Player Season Stats', badge: null },
  { to: '/transfers', icon: ArrowRightLeft, label: 'Transfers', badge: null },
];

function Sidebar({ className = '' }) {
  const location = useLocation();
  const { canManageUsers } = useAuth();
  const [expandedSections, setExpandedSections] = useState({
    core: true,
    people: true,
    competitions: true,
    matches: true,
    playerData: true,
    analytics: true,
    system: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isActiveInSection = (items) => {
    return items.some(item => location.pathname === item.to || location.pathname.startsWith(item.to + '/'));
  };

  const renderSection = (title, items, sectionKey) => {
    const isActive = isActiveInSection(items);
    const isExpanded = expandedSections[sectionKey];

    return (
      <div className="sidebar-section" key={sectionKey}>
        <button
          className={`sidebar-section-header ${isActive ? 'active' : ''}`}
          onClick={() => toggleSection(sectionKey)}
        >
          <span className="sidebar-section-title">{title}</span>
          {isExpanded ? (
            <ChevronDown size={14} className="sidebar-chevron" />
          ) : (
            <ChevronRight size={14} className="sidebar-chevron" />
          )}
        </button>
        {isExpanded && (
          <div className="sidebar-submenu">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-link sidebar-submenu-link ${isActive ? 'active' : ''}`
                }
              >
                <item.icon size={18} strokeWidth={2} />
                <span>{item.label}</span>
                {item.badge && <span className="sidebar-badge">{item.badge}</span>}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`sidebar ${className}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">F</div>
        <span className="logo-text">FootballDB</span>
      </div>

      <nav className="sidebar-nav">
        {renderSection('CORE', coreItems, 'core')}
        {renderSection('PEOPLE', peopleItems, 'people')}
        {renderSection('COMPETITIONS', competitionsItems, 'competitions')}
        {renderSection('MATCHES', matchesItems, 'matches')}
        {renderSection('PLAYER DATA', playerDataItems, 'playerData')}
        {renderSection('ANALYTICS', analyticsItems, 'analytics')}
        {canManageUsers() && renderSection('SYSTEM', systemItems, 'system')}
        
        {otherItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={20} strokeWidth={2} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
