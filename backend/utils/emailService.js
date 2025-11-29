const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envoi email générique via RESEND
 */
async function sendEmail(to, subject, html) {
  try {
    const send = await resend.emails.send({
      from: process.env.RESEND_FROM, // ex: "Beauty Shop <onboarding@resend.dev>"
      to,
      subject,
      html,
    });

    console.log("📧 Email envoyé :", send);
  } catch (error) {
    console.error("❌ Erreur Resend :", error);
  }
}

/**
 * Email confirmation de commande (client)
 */
exports.sendOrderConfirmationToClient = async (order, user) => {
  const html = `
    <h2>Bonjour ${user.name},</h2>
    <p>Votre commande <strong>${order.orderNumber}</strong> a été confirmée.</p>
    <p>Total : <strong>${order.totalPrice} CFA</strong></p>
    <p>Merci pour votre confiance !</p>
  `;

  await sendEmail(user.email, "Confirmation de votre commande", html);
};

/**
 * Email notification admin
 */
exports.sendOrderNotificationToAdmin = async (order, user) => {
  const html = `
    <h2>Nouvelle commande reçue</h2>
    <p>Client : <strong>${user.name} (${user.email})</strong></p>
    <p>Commande : <strong>${order.orderNumber}</strong></p>
    <p>Total : <strong>${order.totalPrice} CFA</strong></p>
  `;

  await sendEmail(process.env.ADMIN_EMAIL, "Nouvelle commande sur BeautyShop", html);
};

/**
 * Email mise à jour du statut
 */
exports.sendOrderStatusUpdate = async (order, user, oldStatus, newStatus) => {
  const html = `
    <h2>Bonjour ${user.name},</h2>
    <p>Le statut de votre commande <strong>${order.orderNumber}</strong> a été mis à jour.</p>
    <p><strong>${oldStatus} ➝ ${newStatus}</strong></p>
  `;

  await sendEmail(user.email, "Mise à jour du statut de votre commande", html);
};
