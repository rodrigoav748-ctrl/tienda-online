
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
              {/* ... resto igual ... */}
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="account-form">
              {/* ... resto igual ... */}
            </form>
          )}
        </div>
      </div>
    </>
  );
}
