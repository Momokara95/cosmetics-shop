// backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true,
    maxlength: [200, 'Le nom ne doit pas dépasser 200 caractères']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: [2000, 'Description trop longue']
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  compareAtPrice: {
    type: Number,
    min: [0, 'Le prix comparatif ne peut pas être négatif']
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: ['visage', 'corps', 'cheveux', 'maquillage', 'parfum', 'soins']
  },
  brand: {
    type: String,
    required: [true, 'La marque est requise']
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Le stock ne peut pas être négatif'],
    default: 0
  },

  // ✅ IMAGES MIXTES (URL ou chemin fichier upload)
  images: [
    {
      type: mongoose.Schema.Types.Mixed,
      validate: {
        validator: function (val) {
          return (
            typeof val === "string" ||
            (typeof val === "object" && val.url && typeof val.url === "string")
          );
        },
        message: "Format d'image invalide (URL string ou objet {url, alt})"
      }
    }
  ],

  ingredients: [String],
  benefits: [String],
  howToUse: String,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String]
}, {
  timestamps: true
});

// Index pour la recherche
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

// Slug auto
productSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
});

module.exports = mongoose.model('Product', productSchema);
