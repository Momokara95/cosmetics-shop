const nodemailer = require("nodemailer");

// Transporter SMTP Render
const transporter = nodemailer.createTransport({
  host: process.env.RENDER_SMTP_HOST, // smtp.render.com
  port: process.env.RENDER_SMTP_PORT, // 587
  secure: false,
  auth: {
    user: process.env.RENDER_SMTP_USER,
    pass: process.env.RENDER_SMTP_PASSWORD,
  },
});

/**
 * Envoi email générique
 */
async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"Beauty Shop" <${process.env.RENDER_SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📧 Email envoyé à :", to);
  } catch (error) {
    console.error("❌ Erreur envoi email :", error);
  }
}

/**
 * Email confirmation de commande (client)
 */
exports.sendOrderConfirmationToClient = async (order, user) => {
  const html = `
    <h2>Bonjour ${user.name},</h2>
    <p>Votre commande <strong>${order.orderNumber}</strong> est confirmée.</p>
    <p>Total : <strong>${order.totalPrice} CFA</strong></p>
    <p>Merci pour votre confiance !</p>
  `;

  await sendEmail(user.email, "Confirmation de commande", html);
};

/**
 * Email notification admin
 */
exports.sendOrderNotificationToAdmin = async (order, user) => {
  const html = `
    <h2>Nouvelle commande</h2>
    <p>Client : <strong>${user.name} (${user.email})</strong></p>
    <p>Commande : <strong>${order.orderNumber}</strong></p>
    <p>Total : <strong>${order.totalPrice} CFA</strong></p>
  `;

  await sendEmail(process.env.ADMIN_EMAIL, "Nouvelle commande reçue", html);
};

/**
 * Email mise à jour du statut
 */
exports.sendOrderStatusUpdate = async (order, user, oldStatus, newStatus) => {
  const html = `
    <h2>Bonjour ${user.name},</h2>
    <p>Le statut de votre commande <strong>${order.orderNumber}</strong> a changé.</p>
    <p><strong>${oldStatus} ➝ ${newStatus}</strong></p>
  `;

  await sendEmail(user.email, "Mise à jour de votre commande", html);
};
