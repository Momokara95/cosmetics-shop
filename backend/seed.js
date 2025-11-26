// backend/seed.js
require('dotenv').config(); // ⚠️ doit être tout en haut
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const sampleProducts = [
  {
    name: 'Crème Hydratante Bio Intense',
    description: 'Crème ultra-hydratante pour tous types de peaux. Enrichie en acide hyaluronique et beurre de karité. Formule 100% naturelle et vegan.',
    price: 29.99,
    compareAtPrice: 39.99,
    category: 'visage',
    brand: 'BeautéNature',
    stock: 50,
    featured: true,
    ingredients: ['Acide Hyaluronique', 'Beurre de Karité', 'Vitamine E', 'Aloe Vera'],
    benefits: ['Hydratation 24h', 'Anti-âge', 'Apaise les rougeurs', 'Texture légère'],
    howToUse: 'Appliquer matin et soir sur une peau propre et sèche. Masser délicatement jusqu\'à absorption complète.',
    images: [{ url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', alt: 'Crème hydratante bio' }],
    seoTitle: 'Crème Hydratante Bio | Soin Visage Naturel',
    seoDescription: 'Découvrez notre crème hydratante bio à l\'acide hyaluronique. Hydratation intense 24h. Livraison gratuite.',
    seoKeywords: ['crème hydratante', 'bio', 'acide hyaluronique', 'soin visage']
  },
  // ... tes autres produits ici
];

const seedDatabase = async () => {
  try {
    // ✅ Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // 🗑️ Supprimer les anciennes données
    await Product.deleteMany();
    console.log('🗑️  Anciennes données supprimées');

    // ➕ Ajouter les nouveaux produits
    await Product.insertMany(sampleProducts);
    console.log(`✅ ${sampleProducts.length} produits ajoutés avec succès`);

    // 👤 Créer un compte admin si inexistant
    const adminExists = await User.findOne({ email: 'admin@beauteshop.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin BeauteShop',
        email: 'admin@beauteshop.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Compte admin créé');
      console.log('📧 Email: admin@beauteshop.com');
      console.log('🔑 Mot de passe: admin123');
    }

    console.log('\n🎉 Base de données initialisée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

seedDatabase();
