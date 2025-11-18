import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});


function generateReceiptHtml(orderData) {
  const { user, cart, finalTotal, orderId } = orderData;
  
 
  return `
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2 style="color: #0070f3;">¡Confirmación de Orden, ${user.nombre}!</h2>
        <p>Gracias por tu compra. Adjuntamos los detalles de tu boleta.</p>
        <p><strong>Orden ID:</strong> ${orderId}</p>
        <p><strong>Email:</strong> ${user.email}</p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          ${cart.map(item => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.name} (x${item.quantity})</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        
        <h3 style="text-align: right;">Total Pagado: $${finalTotal.toFixed(2)}</h3>
        <p>Equipo de Mi Tienda</p>
      </body>
    </html>
  `;
}

// 3. Manejador de la API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { orderData } = req.body;

  try {
    await transporter.sendMail({
      from: `"Mi Tienda" <${process.env.EMAIL_USER}>`,
      to: orderData.user.email, // El correo del usuario vinculado
      subject: `Comprobante de Pago - Orden #${orderData.orderId}`,
      html: generateReceiptHtml(orderData),
    });

    res.status(200).json({ success: true, message: 'Correo enviado' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    // Retorna éxito 202 o 200 en cliente para no detener la compra, pero loguea el error
    res.status(500).json({ success: false, message: 'Fallo al enviar el correo' });
  }
}