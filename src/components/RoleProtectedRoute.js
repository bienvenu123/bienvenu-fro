import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * RoleProtectedRoute - Protects routes based on user role
 * @param {Object} props
 * @param {ReactNode} props.children - The component to render if access is granted
 * @param {Array<string>} props.allowedRoles - Array of roles that can access this route (e.g., ['ADMIN'])
 */
function RoleProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#1a1d29',
        color: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(124, 58, 237, 0.3)',
            borderTopColor: '#7c3aed',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check access using allowedRoles array
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#1a1d29',
        color: '#ffffff',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <h2 style={{ margin: 0 }}>Access Denied</h2>
        <p style={{ color: '#9ca3af' }}>You don't have permission to access this page.</p>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '10px 20px',
            background: '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return children;
}

export default RoleProtectedRoute;
