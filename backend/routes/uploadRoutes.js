// backend/routes/uploadRoutes.js

const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware'); // Importe l'instance de Multer configurée

const { protect, admin } = require('../middleware/auth'); // Assurez-vous d'importer vos middlewares d'authentification

// @route   POST /api/upload
// @desc    Upload une image vers Cloudinary et renvoie l'URL
// @access  Privé/Admin
router.post(
  '/',
  protect, // Vérifie si l'utilisateur est connecté
  admin, // Vérifie si l'utilisateur est admin
  upload.single('image'), // Middleware Multer pour uploader une seule image avec le champ 'image'
  (req, res) => {
    // Si l'upload Cloudinary est réussi, le fichier est dans req.file
    if (req.file) {
      // Cloudinary renvoie l'URL dans req.file.path
      res.json({
        success: true,
        message: 'Image uploadée sur Cloudinary',
        url: req.file.path, // C'est cette URL permanente que votre frontend va enregistrer
      });
    } else {
      res.status(400).json({ success: false, message: 'Erreur lors de l\'upload de l\'image' });
    }
  }
);

module.exports = router;