import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';

export default function Sidebar() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const menuItems = [
    { href: '/', icon: '🏠', label: 'Inicio' },
    { href: '/products', icon: '📦', label: 'Productos' },
    { href: '/account', icon: '👤', label: 'Mi Cuenta' },
    ...(isAdmin ? [{ href: '/admin', icon: '⚙️', label: 'Administración' }] : [])
  ];

  const isActive = (path) => {
    return router.pathname === path;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="user-info">
          <div className="user-avatar">👤</div>
          <div className="user-details">
            <div className="user-name">{user?.nombre}</div>
            <div className="user-role">{user?.rol}</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-menu">
          {menuItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-stats">
          <div className="stat">
            <span className="stat-label">Miembro desde</span>
            <span className="stat-value">
              {new Date(user?.fecha_registro).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}