import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Head from 'next/head';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push('/products');
      } else {
        router.push('/catalog');
      }
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
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
        <title>Mi Tienda Online</title>
      </Head>
      <div className="loading-full">
        <div className="spinner"></div>
        <p>Redirigiendo...</p>
      </div>
    </>
  );
}