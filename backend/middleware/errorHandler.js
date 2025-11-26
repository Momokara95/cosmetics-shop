// backend/middleware/errorHandler.js

// Gestionnaire d'erreurs global (SANS next)
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('❌ Erreur détectée:', err);

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error.message = message;
    error.statusCode = 400;
  }

  // Erreur de duplication (email déjà existant)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field} existe déjà`;
    error.statusCode = 400;
  }

  // Erreur CastError (ID MongoDB invalide)
  if (err.name === 'CastError') {
    error.message = 'Ressource non trouvée';
    error.statusCode = 404;
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Token invalide';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expiré';
    error.statusCode = 401;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erreur serveur',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;