// backend/middleware/uploadMiddleware.js

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// 1. Configuration Cloudinary
// Les clés doivent être dans votre fichier .env et configurées sur Railway
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Création du stockage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cosmetics-shop', // Dossier où les images seront stockées sur Cloudinary
    allowed_formats: ['jpeg', 'png', 'jpg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: "limit" }] // Exemple d'optimisation
  },
});

// 3. Fonction de validation de fichier (Optionnel mais recommandé)
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Seules les images (jpeg, jpg, png, webp) sont acceptées!'), false);
};

// 4. Initialisation de Multer
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limite de 5MB
    fileFilter: fileFilter
});

// On exporte l'instance de Multer
module.exports = upload;