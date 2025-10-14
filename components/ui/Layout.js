import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function Layout({ children }) {
  const { user } = useAuth();

  return (
    <div className="app">
      <Header />
      <div className="main-container">
        {user && <Sidebar />}
        <main className="main-content">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}