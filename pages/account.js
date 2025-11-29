import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Account() {
  const { user, updateProfile, changePassword, logout, isAuthenticated, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [profileData, setProfileData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: {
      calle: '',
      ciudad: '',
      pais: '',
      codigo_postal: ''
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        nombre: user.nombre || '',
        email: user.email || '',
        telefono: user.telefono || '',
        direccion: {
          calle: user.direccion?.calle || '',
          ciudad: user.direccion?.ciudad || '',
          pais: user.direccion?.pais || '',
          codigo_postal: user.direccion?.codigo_postal || ''
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const result = await updateProfile(profileData);
    
    if (result.success) {
      setMessage('✅ Perfil actualizado exitosamente');
    } else {
      setMessage(`❌ ${result.message}`);
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('❌ Las contraseñas no coinciden');
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('❌ La contraseña debe tener al menos 6 caracteres');
      setSaving(false);
      return;
    }

    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    
    if (result.success) {
      setMessage('✅ Contraseña actualizada exitosamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      setMessage(`❌ ${result.message}`);
    }
    setSaving(false);
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="loading-full">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Mi Cuenta - Mi Tienda</title>
      </Head>

      <div className="admin-container">
        <header className="admin-header-compact">
          <div className="admin-header-content-compact">
            <h1>👤 Mi Cuenta</h1>
            
            <div className="admin-tabs-inline">
              <button 
                className={`admin-tab-inline ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                📝 Perfil
              </button>
              <button 
                className={`admin-tab-inline ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                🔒 Contraseña
              </button>
              <button 
                className="admin-tab-inline logout-tab"
                onClick={logout}
              >
                🚪 Cerrar Sesión
              </button>
            </div>

            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => router.push('/products')}
            >
              ← Tienda
            </button>
          </div>
        </header>

        <div className="admin-content">
          {message && (
            <div className={`admin-message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="account-card">
            <div className="account-info-header">
              <div className="user-avatar-large">👤</div>
              <div className="user-info">
                <h2>{user.nombre}</h2>
                <p className="user-email">{user.email}</p>
                <span className={`role-badge role-${user.rol}`}>{user.rol}</span>
              </div>
            </div>

            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="admin-form">
                <h3>Información Personal</h3>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nombre Completo *</label>
                    <input
                      type="text"
                      value={profileData.nombre}
                      onChange={(e) => setProfileData({...profileData, nombre: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="tel"
                      value={profileData.telefono}
                      onChange={(e) => setProfileData({...profileData, telefono: e.target.value})}
                      className="form-input"
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                </div>

                <h3 style={{marginTop: '2rem'}}>📮 Dirección</h3>
                
                <div className="form-grid">
                  <div className="form-group" style={{gridColumn: '1 / -1'}}>
                    <label className="form-label">Calle</label>
                    <input
                      type="text"
                      value={profileData.direccion.calle}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        direccion: {...profileData.direccion, calle: e.target.value}
                      })}
                      className="form-input"
                      placeholder="Av. Principal 123"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ciudad</label>
                    <input
                      type="text"
                      value={profileData.direccion.ciudad}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        direccion: {...profileData.direccion, ciudad: e.target.value}
                      })}
                      className="form-input"
                      placeholder="Santiago"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">País</label>
                    <input
                      type="text"
                      value={profileData.direccion.pais}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        direccion: {...profileData.direccion, pais: e.target.value}
                      })}
                      className="form-input"
                      placeholder="Chile"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Código Postal</label>
                    <input
                      type="text"
                      value={profileData.direccion.codigo_postal}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        direccion: {...profileData.direccion, codigo_postal: e.target.value}
                      })}
                      className="form-input"
                      placeholder="8320000"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Guardando...' : '💾 Guardar Cambios'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handlePasswordChange} className="admin-form">
                <h3>Cambiar Contraseña</h3>
                
                <div className="form-grid">
                  <div className="form-group" style={{gridColumn: '1 / -1'}}>
                    <label className="form-label">Contraseña Actual *</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="form-input"
                      required
                      placeholder="Tu contraseña actual"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nueva Contraseña *</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="form-input"
                      required
                      minLength="6"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirmar Nueva Contraseña *</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="form-input"
                      required
                      placeholder="Repite la nueva contraseña"
                    />
                  </div>
                </div>

                <div className="password-requirements">
                  <h4>Requisitos de contraseña:</h4>
                  <ul>
                    <li className={passwordData.newPassword.length >= 6 ? 'valid' : ''}>
                      Mínimo 6 caracteres
                    </li>
                    <li className={passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword ? 'valid' : ''}>
                      Las contraseñas coinciden
                    </li>
                  </ul>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Cambiando...' : '🔒 Cambiar Contraseña'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Deshabilitar SSR
Account.getInitialProps = () => {
  return {};
};