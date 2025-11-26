// backend/utils/emailService.js
const nodemailer = require('nodemailer');

// Configuration du transporteur d'email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true pour le port 465, false pour les autres ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// 📧 Email de confirmation au client
const sendOrderConfirmationToClient = async (order, user) => {
  const transporter = createTransporter();

  const itemsList = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.name}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${item.price}€
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">
        ${(item.price * item.quantity).toFixed(2)}€
      </td>
    </tr>
  `).join('');

  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-info { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .total { background: #667eea; color: white; padding: 15px; text-align: center; border-radius: 10px; font-size: 24px; font-weight: bold; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        .status { background: #4CAF50; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ BeautéShop</h1>
          <h2>Confirmation de commande</h2>
        </div>
        
        <div class="content">
          <p>Bonjour <strong>${user.name}</strong>,</p>
          
          <p>Merci pour votre commande ! Nous avons bien reçu votre paiement et nous préparons votre colis avec soin.</p>
          
          <div class="order-info">
            <h3>📦 Détails de votre commande</h3>
            <p><strong>Numéro de commande :</strong> ${order.orderNumber}</p>
            <p><strong>Date :</strong> ${new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
            <p><strong>Statut :</strong> <span class="status">${getStatusText(order.status)}</span></p>
          </div>

          <h3>🛍️ Articles commandés</h3>
          <table>
            <thead>
              <tr style="background: #f0f0f0;">
                <th style="padding: 10px; text-align: left;">Produit</th>
                <th style="padding: 10px; text-align: center;">Qté</th>
                <th style="padding: 10px; text-align: right;">Prix unit.</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>

          <div style="text-align: right; padding: 10px;">
            <p><strong>Sous-total :</strong> ${order.itemsPrice.toFixed(2)}€</p>
            <p><strong>Livraison :</strong> ${order.shippingPrice.toFixed(2)}€</p>
          </div>

          <div class="total">
            Total : ${order.totalPrice.toFixed(2)}€
          </div>

          <div class="order-info" style="margin-top: 20px;">
            <h3>📍 Adresse de livraison</h3>
            <p>
              ${order.shippingAddress.name}<br>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.postalCode} ${order.shippingAddress.city}<br>
              ${order.shippingAddress.country}<br>
              📞 ${order.shippingAddress.phone}
            </p>
          </div>

          <div class="order-info">
            <h3>💳 Mode de paiement</h3>
            <p>${getPaymentMethodText(order.paymentMethod)}</p>
          </div>

          <p style="margin-top: 30px; padding: 15px; background: #e3f2fd; border-radius: 10px;">
            <strong>📬 Suivi de commande :</strong><br>
            Vous recevrez un email à chaque étape de votre commande (préparation, expédition, livraison).
          </p>

          <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
          
          <p>Merci de votre confiance ! 💜</p>
          <p><strong>L'équipe BeautéShop</strong></p>
        </div>

        <div class="footer">
          <p>BeautéShop - Votre beauté au naturel</p>
          <p>📧 contact@beauteshop.com | 📞 +33 1 23 45 67 89</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `✅ Commande confirmée - ${order.orderNumber}`,
    html: emailHTML
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de confirmation envoyé à ${user.email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur envoi email client:', error);
    return { success: false, error: error.message };
  }
};

// 📧 Email de notification au vendeur (admin)
const sendOrderNotificationToAdmin = async (order, user) => {
  const transporter = createTransporter();

  const itemsList = order.items.map(item => `
    <li>${item.name} - Quantité: ${item.quantity} - Prix: ${(item.price * item.quantity).toFixed(2)}€</li>
  `).join('');

  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .header { background: #ff6b6b; color: white; padding: 20px; text-align: center; border-radius: 10px; }
        .content { background: white; padding: 20px; margin-top: 20px; border-radius: 10px; }
        .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
        .info-box { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Nouvelle Commande !</h1>
        </div>
        
        <div class="content">
          <div class="alert">
            <strong>⚡ Action requise :</strong> Une nouvelle commande vient d'être passée sur votre boutique !
          </div>

          <div class="info-box">
            <h3>📋 Informations de la commande</h3>
            <p><strong>Numéro :</strong> ${order.orderNumber}</p>
            <p><strong>Date :</strong> ${new Date(order.createdAt).toLocaleString('fr-FR')}</p>
            <p><strong>Montant total :</strong> <span style="color: #4CAF50; font-size: 20px; font-weight: bold;">${order.totalPrice.toFixed(2)}€</span></p>
            <p><strong>Mode de paiement :</strong> ${getPaymentMethodText(order.paymentMethod)}</p>
          </div>

          <div class="info-box">
            <h3>👤 Client</h3>
            <p><strong>Nom :</strong> ${user.name}</p>
            <p><strong>Email :</strong> ${user.email}</p>
            <p><strong>Téléphone :</strong> ${order.shippingAddress.phone}</p>
          </div>

          <div class="info-box">
            <h3>📍 Adresse de livraison</h3>
            <p>
              ${order.shippingAddress.name}<br>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.postalCode} ${order.shippingAddress.city}<br>
              ${order.shippingAddress.country}
            </p>
          </div>

          <div class="info-box">
            <h3>🛍️ Articles commandés</h3>
            <ul>
              ${itemsList}
            </ul>
            <p><strong>Sous-total :</strong> ${order.itemsPrice.toFixed(2)}€</p>
            <p><strong>Frais de livraison :</strong> ${order.shippingPrice.toFixed(2)}€</p>
            <p style="font-size: 18px; color: #4CAF50;"><strong>TOTAL :</strong> ${order.totalPrice.toFixed(2)}€</p>
          </div>

          <p style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 5px;">
            <strong>📌 À faire :</strong><br>
            1. Préparer la commande<br>
            2. Mettre à jour le statut dans le système<br>
            3. Expédier le colis et ajouter le numéro de suivi
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: `🔔 Nouvelle commande ${order.orderNumber} - ${order.totalPrice.toFixed(2)}€`,
    html: emailHTML
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de notification envoyé à l'admin`);
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur envoi email admin:', error);
    return { success: false, error: error.message };
  }
};

// 📧 Email de mise à jour du statut de commande
const sendOrderStatusUpdate = async (order, user, oldStatus, newStatus) => {
  const transporter = createTransporter();

  const statusMessages = {
    processing: {
      title: '⚙️ Commande en préparation',
      message: 'Bonne nouvelle ! Votre commande est actuellement en cours de préparation dans nos entrepôts.',
      icon: '📦'
    },
    shipped: {
      title: '🚚 Commande expédiée',
      message: 'Votre colis a été expédié ! Vous le recevrez bientôt.',
      icon: '✈️'
    },
    delivered: {
      title: '✅ Commande livrée',
      message: 'Votre commande a été livrée avec succès ! Nous espérons que vous apprécierez vos produits.',
      icon: '🎉'
    },
    cancelled: {
      title: '❌ Commande annulée',
      message: 'Votre commande a été annulée. Si vous avez des questions, n\'hésitez pas à nous contacter.',
      icon: '⚠️'
    }
  };

  const statusInfo = statusMessages[newStatus] || {
    title: 'Mise à jour de commande',
    message: 'Le statut de votre commande a été mis à jour.',
    icon: '📬'
  };

  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
        .content { background: #f9f9f9; padding: 30px; margin-top: 20px; border-radius: 10px; }
        .status-box { background: white; padding: 30px; text-align: center; border-radius: 10px; margin: 20px 0; border: 3px solid #667eea; }
        .icon { font-size: 60px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ BeautéShop</h1>
        </div>
        
        <div class="content">
          <p>Bonjour <strong>${user.name}</strong>,</p>
          
          <div class="status-box">
            <div class="icon">${statusInfo.icon}</div>
            <h2>${statusInfo.title}</h2>
            <p style="font-size: 16px; color: #666;">${statusInfo.message}</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 10px; margin-top: 20px;">
            <p><strong>Numéro de commande :</strong> ${order.orderNumber}</p>
            <p><strong>Nouveau statut :</strong> <span style="color: #667eea; font-weight: bold;">${getStatusText(newStatus)}</span></p>
          </div>

          ${newStatus === 'shipped' ? `
            <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin-top: 20px;">
              <p><strong>📦 Suivi de colis :</strong></p>
              <p>Votre colis sera livré dans les prochains jours. Surveillez votre boîte aux lettres !</p>
            </div>
          ` : ''}

          <p style="margin-top: 30px;">Merci pour votre confiance ! 💜</p>
          <p><strong>L'équipe BeautéShop</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `${statusInfo.icon} ${statusInfo.title} - ${order.orderNumber}`,
    html: emailHTML
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de mise à jour de statut envoyé à ${user.email}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur envoi email statut:', error);
    return { success: false, error: error.message };
  }
};

// Fonctions utilitaires
const getStatusText = (status) => {
  const statusMap = {
    pending: 'En attente',
    processing: 'En préparation',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  };
  return statusMap[status] || status;
};

const getPaymentMethodText = (method) => {
  const methodMap = {
    card: 'Carte bancaire',
    paypal: 'PayPal',
    cash_on_delivery: 'Paiement à la livraison'
  };
  return methodMap[method] || method;
};

module.exports = {
  sendOrderConfirmationToClient,
  sendOrderNotificationToAdmin,
  sendOrderStatusUpdate
};