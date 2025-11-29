const { Resend } = require('resend');
const { render } = require('@react-email/render');

const resend = new Resend(process.env.RESEND_API_KEY);

// Convertit ton HTML direct en JSX sûr pour React Email
const wrapHtml = (html) => `
  <div dangerouslySetInnerHTML={{__html: \`${html.replace(/`/g, "\\`")}\`}} />
`;

/* ----------------------
   EMAIL CONFIRMATION CLIENT
----------------------- */
const sendOrderConfirmationToClient = async (order, user) => {
  try {
    const itemsList = order.items.map(
      (item) => `
        <tr>
          <td style="padding: 10px;">${item.name}</td>
          <td style="padding: 10px; text-align:center;">${item.quantity}</td>
          <td style="padding: 10px; text-align:right;">${item.price}€</td>
          <td style="padding: 10px; text-align:right; font-weight:bold;">
            ${(item.price * item.quantity).toFixed(2)}€
          </td>
        </tr>
      `
    ).join("");

    const emailHTML = `<!DOCTYPE html>
    <html><body>
      <h2>Confirmation de commande</h2>
      <p>Bonjour ${user.name}, merci pour votre commande.</p>

      <h3>Détails :</h3>
      <p><strong>Commande :</strong> ${order.orderNumber}</p>

      <table style="width:100%; border-collapse:collapse; margin-top:20px;">
        <thead>
          <tr style="background:#f0f0f0;">
            <th style="padding:10px;">Produit</th>
            <th style="padding:10px;">Qté</th>
            <th style="padding:10px;">Prix</th>
            <th style="padding:10px;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsList}</tbody>
      </table>

      <p><strong>Total :</strong> ${order.totalPrice.toFixed(2)}€</p>
    </body></html>`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Votre commande ${order.orderNumber}`,
      html: render(wrapHtml(emailHTML))
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Email client erreur:", error);
    return { success: false, error: error.message };
  }
};

/* ----------------------
   EMAIL ADMIN
----------------------- */
const sendOrderNotificationToAdmin = async (order, user) => {
  try {
    const items = order.items.map(
      (i) => `<li>${i.name} - ${i.quantity} × ${i.price}€</li>`
    ).join("");

    const emailHTML = `
      <h2>Nouvelle commande</h2>
      <p>Client : ${user.name} - ${user.email}</p>
      <p>Commande : <strong>${order.orderNumber}</strong></p>
      <ul>${items}</ul>
      <p>Total : ${order.totalPrice.toFixed(2)}€</p>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: `Nouvelle commande - ${order.orderNumber}`,
      html: render(wrapHtml(emailHTML))
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Email admin erreur:", error);
    return { success: false, error: error.message };
  }
};

/* ----------------------
   EMAIL CHANGEMENT STATUT
----------------------- */
const sendOrderStatusUpdate = async (order, user, oldStatus, newStatus) => {
  try {
    const emailHTML = `
      <h2>Mise à jour de votre commande</h2>
      <p>Bonjour ${user.name},</p>
      <p>Votre commande <strong>${order.orderNumber}</strong> est passée de 
      <strong>${oldStatus}</strong> à <strong>${newStatus}</strong>.</p>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Mise à jour : ${order.orderNumber}`,
      html: render(wrapHtml(emailHTML))
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Email statut erreur:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmationToClient,
  sendOrderNotificationToAdmin,
  sendOrderStatusUpdate,
};
