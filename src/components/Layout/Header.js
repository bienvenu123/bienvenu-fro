import { useLocation } from 'react-router-dom';
import { Search, Download, User, Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

function Header({ onMenuToggle, sidebarOpen }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);
  
  // Get page title and breadcrumb from path
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/countries' || path === '/') {
      return { title: 'Countries', breadcrumb: 'Core → Countries' };
    }
    // Add more mappings as needed
    const pathMap = {
      '/teams': { title: 'Teams', breadcrumb: 'Core → Teams' },
      '/players': { title: 'Players', breadcrumb: 'People → Players' },
      '/matches': { title: 'Matches', breadcrumb: 'Matches → Matches' },
      '/reports': { title: 'Reports', breadcrumb: 'Analytics → Reports' },
    };
    return pathMap[path] || { title: 'Dashboard', breadcrumb: 'Home' };
  };

  const { title, breadcrumb } = getPageInfo();
  const path = location.pathname;

  return (
    <header className="header">
      <button className="header-menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      <div className="header-left">
        <div className="header-breadcrumb">{breadcrumb}</div>
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-center">
        <div className="header-search">
          <Search size={18} strokeWidth={2} />
          <input 
            type="text" 
            placeholder={`Search ${title.toLowerCase()}...`} 
            className="header-search-input" 
          />
        </div>
      </div>

      <div className="header-right">
        {path !== '/reports' && (
          <>
            <button className="header-btn header-btn-secondary">
              <Download size={18} strokeWidth={2} />
              Export
            </button>
            <button 
              className="header-btn header-btn-primary"
              onClick={() => {
                // Dispatch custom event that pages can listen to
                window.dispatchEvent(new CustomEvent('header-add-click', { detail: { path } }));
              }}
            >
              + Add {title === 'Countries' ? 'Country' : title.slice(0, -1)}
            </button>
          </>
        )}
        <div className="header-user-menu" ref={menuRef}>
          <button
            className="header-avatar"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User menu"
          >
            <User size={20} strokeWidth={2} />
          </button>
          {showUserMenu && (
            <div className="header-user-dropdown">
              <div className="header-user-info">
                <div className="header-user-name">{user?.name || 'User'}</div>
                <div className="header-user-email">{user?.email || user?.username || ''}</div>
                <div className="header-user-role">{user?.role || ''}</div>
              </div>
              <button className="header-logout-btn" onClick={logout}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
