import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Account() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [profileData, setProfileData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    direccion: {
      calle: user?.direccion?.calle || '',
      ciudad: user?.direccion?.ciudad || '',
      pais: user?.direccion?.pais || '',
      codigo_postal: user?.direccion?.codigo_postal || ''
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 🚀 Redirección segura en el cliente
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Si aún no hay usuario (mientras se redirige), evita renderizar contenido
  if (!user) return null;

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await updateProfile(profileData);
    
    if (result.success) {
      setMessage('✅ Perfil actualizado exitosamente');
    } else {
      setMessage(`❌ ${result.message}`);
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('❌ Las contraseñas no coinciden');
      setLoading(false);
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
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Mi Cuenta - Mi Tienda</title>
      </Head>

      <div className="account-container">
        <div className="account-header">
          <div className="account-header-top">
            <button className="btn-back" onClick={() => router.push('/products')}>
              ← Volver a Productos
            </button>
            <h1>👤 Mi Cuenta</h1>
          </div>
          
          <div className="account-stats">
            <div className="stat-card">
              <div className="stat-number">{user.rol}</div>
              <div className="stat-label">Rol</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {new Date(user.fecha_registro).toLocaleDateString()}
              </div>
              <div className="stat-label">Miembro desde</div>
            </div>
          </div>
        </div>

        <div className="account-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            📝 Perfil
          </button>
          <button 
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            🔒 Contraseña
          </button>
          <button 
            className="tab-btn logout-btn"
            onClick={logout}
          >
            🚪 Cerrar Sesión
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="account-content">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="account-form">
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
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>📮 Dirección</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Calle</label>
                    <input
                      type="text"
                      value={profileData.direccion.calle}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        direccion: {...profileData.direccion, calle: e.target.value}
                      })}
                      className="form-input"
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
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : '💾 Guardar Cambios'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="account-form">
              <div className="form-group">
                <label className="form-label">Contraseña Actual *</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="form-input"
                  required
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
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Cambiando...' : '🔒 Cambiar Contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}