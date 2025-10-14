import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const goToLogin = () => {
    router.push('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="navbar">
          <div className="navbar-brand">
            <a href="/" className="logo">
              🛍️ Mi Tienda Online
            </a>
          </div>

          <div className="navbar-actions">
            {user ? (
              <div className="user-menu">
                <button 
                  className="user-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span className="user-avatar-small">👤</span>
                  <span className="user-name">{user.nombre}</span>
                  {isAdmin && <span className="admin-badge">ADMIN</span>}
                </button>
                
                {showDropdown && (
                  <div className="dropdown-menu">
                    <a href="/account" className="dropdown-item">
                      👤 Mi Cuenta
                    </a>
                    {isAdmin && (
                      <a href="/admin" className="dropdown-item">
                        ⚙️ Administración
                      </a>
                    )}
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item">
                      🚪 Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <button onClick={goToLogin} className="btn btn-outline">
                  Iniciar Sesión
                </button>
                <a href="/register" className="btn btn-primary">
                  Registrarse
                </a>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}