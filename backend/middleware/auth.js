// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protection des routes - vérifie si l'utilisateur est connecté
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Récupère le token du header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé - Veuillez vous connecter'
      });
    }

    // Vérifie le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupère l'utilisateur sans le mot de passe
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
};

// Vérifie si l'utilisateur est admin
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Accès refusé - Droits administrateur requis'
    });
  }
};

// Génère un token JWT
exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};