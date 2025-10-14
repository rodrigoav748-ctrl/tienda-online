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
  const [isClient, setIsClient] = useState(false);

  const [profileData, setProfileData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: { calle: '', ciudad: '', pais: '', codigo_postal: '' }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  // ✅ SOLUCIÓN: Todo en useEffect
  useEffect(() => {
    setIsClient(true);
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

  // ✅ Loading hasta que esté listo
  if (!isClient || !user) {
    return <div className="loading"><div className="spinner"></div><p>Cargando...</p></div>;
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const result = await updateProfile(profileData);
    setMessage(result.success ? '✅ Perfil actualizado' : `❌ ${result.message}`);
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
      setMessage('✅ Contraseña actualizada');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setMessage(`❌ ${result.message}`);
    }
    setLoading(false);
  };

  return (
    <>
      <Head><title>Mi Cuenta - Mi Tienda</title></Head>
      <div className="account-container">
        <div className="account-header">
          <div className="account-header-top">
            <button className="btn-back" onClick={() => router.push('/')}>← Volver</button>
            <h1>👤 Mi Cuenta</h1>
          </div>
          <div className="account-stats">
            <div className="stat-card"><div className="stat-number">{user.rol}</div><div className="stat-label">Rol</div></div>
            <div className="stat-card"><div className="stat-value">{new Date(user.fecha_registro).toLocaleDateString()}</div><div className="stat-label">Miembro desde</div></div>
          </div>
        </div>
        <div className="account-tabs">
          <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>📝 Perfil</button>
          <button className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>🔒 Contraseña</button>
          <button className="tab-btn logout-btn" onClick={logout}>🚪 Cerrar Sesión</button>
        </div>
        {message && <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}
        <div className="account-content">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="account-form">
              <div className="form-grid">
                <div className="form-group"><label>Nombre *</label><input type="text" value={profileData.nombre} onChange={(e) => setProfileData({...profileData, nombre: e.target.value})} required /></div>
                <div className="form-group"><label>Email *</label><input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} required /></div>
                <div className="form-group"><label>Teléfono</label><input type="tel" value={profileData.telefono} onChange={(e) => setProfileData({...profileData, telefono: e.target.value})} /></div>
              </div>
              <div className="form-section"><h3>📮 Dirección</h3>
                <div className="form-grid">
                  <div className="form-group"><label>Calle</label><input type="text" value={profileData.direccion.calle} onChange={(e) => setProfileData({...profileData, direccion: {...profileData.direccion, calle: e.target.value}})} /></div>
                  <div className="form-group"><label>Ciudad</label><input type="text" value={profileData.direccion.ciudad} onChange={(e) => setProfileData({...profileData, direccion: {...profileData.direccion, ciudad: e.target.value}})} /></div>
                  <div className="form-group"><label>País</label><input type="text" value={profileData.direccion.pais} onChange={(e) => setProfileData({...profileData, direccion: {...profileData.direccion, pais: e.target.value}})} /></div>
                  <div className="form-group"><label>Código Postal</label><input type="text" value={profileData.direccion.codigo_postal} onChange={(e) => setProfileData({...profileData, direccion: {...profileData.direccion, codigo_postal: e.target.value}})} /></div>
                </div>
              </div>
              <button type="submit" disabled={loading}>{loading ? 'Guardando...' : '💾 Guardar'}</button>
            </form>
          )}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="account-form">
              <div className="form-group"><label>Contraseña Actual *</label><input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} required /></div>
              <div className="form-group"><label>Nueva Contraseña *</label><input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} required minLength="6" /></div>
              <div className="form-group"><label>Confirmar Contraseña *</label><input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} required /></div>
              <button type="submit" disabled={loading}>{loading ? 'Cambiando...' : '🔒 Cambiar'}</button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
