const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // TLS si 465, sinon false pour 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });
    console.log("📧 Email envoyé à :", to);
  } catch (error) {
    console.error("❌ Erreur envoi email :", error);
  }
}

exports.sendOrderConfirmationToClient = async (order, user) => {
  const html = `
    <h2>Bonjour ${user.name},</h2>
    <p>Votre commande <strong>${order.orderNumber}</strong> a été confirmée.</p>
    <p>Total : <strong>${order.totalPrice} CFA</strong></p>
    <p>Merci pour votre confiance !</p>
  `;
  await sendEmail(user.email, "Confirmation de commande", html);
};

exports.sendOrderNotificationToAdmin = async (order, user) => {
  const html = `
    <h2>Nouvelle commande reçue</h2>
    <p>Client : <strong>${user.name} (${user.email})</strong></p>
    <p>Commande : <strong>${order.orderNumber}</strong></p>
    <p>Total : <strong>${order.totalPrice} CFA</strong></p>
  `;
  await sendEmail(process.env.ADMIN_EMAIL, "Nouvelle commande sur BeautyShop", html);
};

exports.sendOrderStatusUpdate = async (order, user, oldStatus, newStatus) => {
  const html = `
    <h2>Bonjour ${user.name},</h2>
    <p>Le statut de votre commande <strong>${order.orderNumber}</strong> a été mis à jour.</p>
    <p><strong>${oldStatus} ➝ ${newStatus}</strong></p>
  `;
  await sendEmail(user.email, "Mise à jour de votre commande", html);
};
