import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const router = useRouter();

  // --- 1. Cálculos de la Orden ---
  
  // Obtener el carrito y verificar autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=checkout');
      return;
    }

    const savedCart = localStorage.getItem('cart');
    if (!savedCart || JSON.parse(savedCart).length === 0) {
      router.push('/products');
      return;
    }
    setCart(JSON.parse(savedCart));
  }, [isAuthenticated, router]);

  // Totales de la compra
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  const subtotalSinDescuento = cart.reduce((total, item) => {
    const precioOriginal = item.originalPrice || item.price;
    return total + (precioOriginal * item.quantity);
  }, 0);
  
  const ahorroTotal = subtotalSinDescuento - cartTotal;
  
  // Asumiendo IGV (IVA) del 18%
  const tax = cartTotal * 0.18;
  const finalTotal = cartTotal + tax;

  // --- 2. Acciones de la Orden ---

  const cancelOrder = () => {
    localStorage.removeItem('cart');
    router.push('/products');
  };

  const processPayment = async () => {
    if (!user) return; // Si no hay usuario, salir
    
    setProcessing(true);
    
    // Generar datos necesarios para la boleta
    const orderId = (Date.now()).toString().slice(-8); // Un ID simple y temporal
    const orderDate = new Date().toLocaleDateString();

    const orderData = {
        orderId,
        orderDate,
        user: { 
            nombre: user.nombre, 
            email: user.email // ¡El email para enviar la boleta!
        },
        cart,
        cartTotal, // Subtotal con descuento
        subtotalSinDescuento,
        ahorroTotal,
        tax,
        finalTotal
    };

    try {
      // Simulación de procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 1. Actualización de Stock
      const updatePromises = cart.map(item => 
        fetch('/api/products/update-stock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: item.id,
            quantity: item.quantity
          }),
        })
      );

      await Promise.all(updatePromises);
      
      // 2. Envío de Boleta por Correo
      try {
        const emailResponse = await fetch('/api/email/send-receipt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderData }),
        });
        
        if (emailResponse.ok) {
            console.log('Boleta enviada por correo exitosamente.');
        } else {
            console.warn('Advertencia: El API de envío de correo retornó un error, pero la compra se completó.');
        }
      } catch (emailError) {
          // No detenemos la redirección si el envío de correo falla
          console.error('Error FATAL al contactar el API de envío de correo:', emailError);
      }
      
      // 3. Finalización de la Orden en el cliente
      localStorage.removeItem('cart');
      setOrderComplete(true);
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        router.push('/products');
      }, 3000);
      
    } catch (error) {
      console.error('Error processing payment or stock update:', error);
      alert('Error al procesar el pago o actualizar stock. Intenta nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  // --- 3. Renderizado de la Vista ---

  if (orderComplete) {
    return (
      <div className="checkout-container">
        <Head>
          <title>Pago Completado - Mi Tienda</title>
        </Head>
        
        <div className="order-complete">
          <div className="success-icon">✅</div>
          <h1>¡Pago Completado Exitosamente!</h1>
          <p>Tu orden ha sido procesada y el stock actualizado. La boleta se ha enviado a tu correo electrónico (**{user?.email}**).</p>
          <p>Serás redirigido a la tienda en unos segundos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Checkout - Mi Tienda</title>
      </Head>

      <div className="checkout-container">
        <div className="checkout-card">
          <h1>📄 Boleta de Venta</h1>
          
          <div className="order-details">
            <div className="order-header">
              <div>Orden #{(Date.now()).toString().slice(-6)}</div>
              <div>{new Date().toLocaleDateString()}</div>
            </div>

            <div className="order-items">
              <h3>Productos:</h3>
              {cart.map(item => (
                <div key={item.id} className="order-item">
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                    {item.discount > 0 && (
                      <span className="item-discount">
                        -{item.discount}% descuento
                      </span>
                    )}
                  </div>
                  <div className="item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                    {item.discount > 0 && (
                      <div className="item-original-price">
                        <s>${((item.originalPrice || item.price) * item.quantity).toFixed(2)}</s>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${subtotalSinDescuento.toFixed(2)}</span>
              </div>
              
              {ahorroTotal > 0 && (
                <div className="total-row discount-row">
                  <span>Descuentos:</span>
                  <span className="discount-amount">-${ahorroTotal.toFixed(2)}</span>
                </div>
              )}
              
              <div className="total-row">
                <span>Subtotal con descuento:</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="total-row">
                <span>IGV (18%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              
              <div className="total-row final-total">
                <span>Total a Pagar:</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>

              {ahorroTotal > 0 && (
                <div className="savings-message">
                  🎉 ¡Ahorraste ${ahorroTotal.toFixed(2)} en esta compra!
                </div>
              )}
            </div>
          </div>

          <div className="checkout-actions">
            <button 
              className="btn btn-secondary"
              onClick={cancelOrder}
              disabled={processing}
            >
              ❌ Cancelar Orden
            </button>
            <button 
              className="btn btn-primary"
              onClick={processPayment}
              disabled={processing || cart.length === 0}
            >
              {processing ? 'Procesando...' : '✅ Aceptar Pago y Enviar Boleta'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}