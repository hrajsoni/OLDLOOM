import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { SiteContent } from '../models/SiteContent';

dotenv.config();

// ── Seed Users ──────────────────────────────────────────────────────────────────
const users = [
  {
    name: 'Old Loom Admin',
    email: 'admin@oldloom.in',
    password: 'OldLoom@Admin2025',
    role: 'super_admin' as const,
    isActive: true,
    isEmailVerified: true,
  },
  {
    name: 'Priya Sharma',
    email: 'manager@oldloom.in',
    password: 'OldLoom@Mgr2025',
    role: 'manager' as const,
    isActive: true,
    isEmailVerified: true,
  },
  {
    name: 'Arjun Mehta',
    email: 'editor@oldloom.in',
    password: 'OldLoom@Edit2025',
    role: 'content_editor' as const,
    isActive: true,
    isEmailVerified: true,
  },
  {
    name: 'Neha Patel',
    email: 'support@oldloom.in',
    password: 'OldLoom@Sup2025',
    role: 'support_staff' as const,
    isActive: true,
    isEmailVerified: true,
  },
  {
    name: 'Rahul Kumar',
    email: 'customer@oldloom.in',
    password: 'OldLoom@Cust2025',
    role: 'customer' as const,
    isActive: true,
    isEmailVerified: true,
    storeCredit: 500,
    addresses: [
      {
        label: 'Home',
        name: 'Rahul Kumar',
        phone: '9876543210',
        addressLine1: '123 Marine Drive',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        isDefault: true,
      },
    ],
  },
];

// ── Seed Products ───────────────────────────────────────────────────────────────
// Using picsum.photos for consistent, beautiful placeholder fashion images
const IMG = (id: number) => `https://picsum.photos/id/${id}/600/800`;

const products = [
  // ─── MEN ─────────────────────────────────────────────────────────────────────
  {
    name: 'Heritage Weave Classic Tee',
    slug: 'heritage-weave-classic-tee',
    description:
      'A timeless classic featuring intricate hand-woven embroidery on premium 240 GSM cotton. The thread-work takes 8 hours per garment, with a minimal chest motif inspired by ancient Indian textile patterns. Preshrunk and colourfast.',
    price: 1299,
    comparePrice: 1599,
    category: 'men',
    subCategory: 'tshirt',
    tags: ['heritage', 'classic', 'cotton', 'bestseller'],
    isFeatured: true,
    isPublished: true,
    totalSold: 482,
    averageRating: 4.8,
    reviewCount: 134,
    variants: [
      { size: 'S',  color: 'Midnight Black', colorHex: '#1A1A1A', stock: 25, sku: 'OL-MEN-TS-S-BLK' },
      { size: 'M',  color: 'Midnight Black', colorHex: '#1A1A1A', stock: 50, sku: 'OL-MEN-TS-M-BLK' },
      { size: 'L',  color: 'Midnight Black', colorHex: '#1A1A1A', stock: 30, sku: 'OL-MEN-TS-L-BLK' },
      { size: 'XL', color: 'Ivory White',    colorHex: '#F5F5F5', stock: 20, sku: 'OL-MEN-TS-XL-WHT' },
      { size: 'M',  color: 'Ivory White',    colorHex: '#F5F5F5', stock: 15, sku: 'OL-MEN-TS-M-WHT' },
    ],
    images: [IMG(1012), IMG(1035)],
    metaTitle: 'Heritage Weave Classic Tee — Hand-embroidered | Old Loom',
    metaDescription: 'Hand-embroidered classic tee in premium cotton. 8 hours of artisan craftsmanship per piece. Shop Men\'s Heritage Collection at Old Loom.',
  },
  {
    name: 'Golden Thread Polo',
    slug: 'golden-thread-polo',
    description:
      'Elevate your casual wear with this polo shirt, detailed with golden thread embroidery on the collar and cuffs. Made from premium pique cotton with a subtle texture that complements the gold threadwork beautifully.',
    price: 1499,
    category: 'men',
    subCategory: 'tshirt',
    tags: ['polo', 'gold', 'casual', 'premium'],
    isPublished: true,
    totalSold: 201,
    averageRating: 4.6,
    reviewCount: 58,
    variants: [
      { size: 'S',  color: 'Navy',         colorHex: '#1B2A4A', stock: 15, sku: 'OL-MEN-PL-S-NVY' },
      { size: 'M',  color: 'Navy',         colorHex: '#1B2A4A', stock: 25, sku: 'OL-MEN-PL-M-NVY' },
      { size: 'L',  color: 'Navy',         colorHex: '#1B2A4A', stock: 10, sku: 'OL-MEN-PL-L-NVY' },
      { size: 'M',  color: 'Forest Green', colorHex: '#2D5016', stock: 12, sku: 'OL-MEN-PL-M-GRN' },
      { size: 'L',  color: 'Forest Green', colorHex: '#2D5016', stock: 8,  sku: 'OL-MEN-PL-L-GRN' },
    ],
    images: [IMG(1062), IMG(1080)],
  },
  {
    name: 'Embroidered Luxe Hoodie',
    slug: 'embroidered-luxe-hoodie',
    description:
      'Supreme comfort meets artistic flair. This 480 GSM French terry hoodie features a large embroidered loom motif on the back, with a subtle chest logo. The embroidery takes 12 hours per garment by our Lucknow artisans.',
    price: 2499,
    comparePrice: 2999,
    category: 'men',
    subCategory: 'hoodie',
    tags: ['luxe', 'hoodie', 'winter', 'bestseller'],
    isFeatured: true,
    isPublished: true,
    totalSold: 374,
    averageRating: 4.9,
    reviewCount: 98,
    variants: [
      { size: 'S',  color: 'Charcoal', colorHex: '#36454F', stock: 20, sku: 'OL-MEN-HD-S-CHR' },
      { size: 'M',  color: 'Charcoal', colorHex: '#36454F', stock: 40, sku: 'OL-MEN-HD-M-CHR' },
      { size: 'L',  color: 'Charcoal', colorHex: '#36454F', stock: 20, sku: 'OL-MEN-HD-L-CHR' },
      { size: 'XL', color: 'Oatmeal',  colorHex: '#E3D9C6', stock: 15, sku: 'OL-MEN-HD-XL-OAT' },
      { size: 'M',  color: 'Oatmeal',  colorHex: '#E3D9C6', stock: 12, sku: 'OL-MEN-HD-M-OAT' },
    ],
    images: [IMG(1025), IMG(1040)],
    metaTitle: 'Embroidered Luxe Hoodie — Premium Embroidery | Old Loom',
    metaDescription: 'Premium 480 GSM French terry hoodie with 12 hours of hand-embroidery by Lucknow artisans. The Old Loom signature piece.',
  },
  {
    name: 'Artisan Stitch Joggers',
    slug: 'artisan-stitch-joggers',
    description:
      'Relax in style. These 360 GSM cotton-blend joggers feature artisan stitching along the side seams and a subtle embroidered ankle cuff detail. Tapered fit with adjustable drawstring waist.',
    price: 1799,
    category: 'men',
    subCategory: 'jogger',
    tags: ['jogger', 'artisan', 'comfy', 'streetwear'],
    isPublished: true,
    totalSold: 156,
    averageRating: 4.5,
    reviewCount: 41,
    variants: [
      { size: 'S',  color: 'Black', colorHex: '#000000', stock: 15, sku: 'OL-MEN-JG-S-BLK' },
      { size: 'M',  color: 'Black', colorHex: '#000000', stock: 30, sku: 'OL-MEN-JG-M-BLK' },
      { size: 'L',  color: 'Black', colorHex: '#000000', stock: 25, sku: 'OL-MEN-JG-L-BLK' },
      { size: 'S',  color: 'Sand',  colorHex: '#C2B280', stock: 10, sku: 'OL-MEN-JG-S-SND' },
      { size: 'M',  color: 'Sand',  colorHex: '#C2B280', stock: 18, sku: 'OL-MEN-JG-M-SND' },
    ],
    images: [IMG(1043), IMG(1044)],
  },
  {
    name: 'Loom Signature Cap',
    slug: 'loom-signature-cap',
    description:
      'A classic 6-panel dad-cap with our signature loom logo embroidered in high-density thread on the front. Adjustable brass buckle at the back. One size fits most. Available in 4 colourways.',
    price: 799,
    category: 'men',
    subCategory: 'cap',
    tags: ['cap', 'signature', 'accessory', 'unisex'],
    isPublished: true,
    totalSold: 621,
    averageRating: 4.7,
    reviewCount: 203,
    variants: [
      { size: 'Free Size', color: 'Black',  colorHex: '#000000', stock: 100, sku: 'OL-ACC-CP-FS-BLK' },
      { size: 'Free Size', color: 'Cream',  colorHex: '#F5F0E8', stock: 50,  sku: 'OL-ACC-CP-FS-CRM' },
      { size: 'Free Size', color: 'Burgundy',colorHex: '#800020', stock: 30, sku: 'OL-ACC-CP-FS-BRG' },
      { size: 'Free Size', color: 'Navy',   colorHex: '#1B2A4A', stock: 40,  sku: 'OL-ACC-CP-FS-NVY' },
    ],
    images: [IMG(1050), IMG(1054)],
  },

  // ─── WOMEN ───────────────────────────────────────────────────────────────────
  {
    name: 'Silk Thread Embroidered Tee',
    slug: 'silk-thread-embroidered-tee',
    description:
      'Elegance redefined. This premium cotton tee uses real silk threads for a shimmering embroidery effect on the chest — a floral motif inspired by Chikankari traditions from Lucknow. Lightweight and breathable.',
    price: 1399,
    comparePrice: 1699,
    category: 'women',
    subCategory: 'tshirt',
    tags: ['silk', 'elegant', 'tee', 'floral', 'bestseller'],
    isFeatured: true,
    isPublished: true,
    totalSold: 534,
    averageRating: 4.9,
    reviewCount: 167,
    variants: [
      { size: 'XS', color: 'Blush Pink', colorHex: '#FFB6C1', stock: 10, sku: 'OL-WOM-TS-XS-PNK' },
      { size: 'S',  color: 'Blush Pink', colorHex: '#FFB6C1', stock: 20, sku: 'OL-WOM-TS-S-PNK' },
      { size: 'M',  color: 'Blush Pink', colorHex: '#FFB6C1', stock: 35, sku: 'OL-WOM-TS-M-PNK' },
      { size: 'S',  color: 'White',      colorHex: '#FFFFFF', stock: 18, sku: 'OL-WOM-TS-S-WHT' },
      { size: 'M',  color: 'White',      colorHex: '#FFFFFF', stock: 15, sku: 'OL-WOM-TS-M-WHT' },
    ],
    images: [IMG(1036), IMG(1048)],
    metaTitle: 'Silk Thread Embroidered Tee — Women\'s | Old Loom',
    metaDescription: 'Premium cotton tee with real silk thread Chikankari-inspired embroidery. Lightweight and breathable. Women\'s collection at Old Loom.',
  },
  {
    name: 'Pastel Weave Crop Tee',
    slug: 'pastel-weave-crop-tee',
    description:
      'A modern silhouette meets traditional weaving. This crop tee is light, breathable, and beautifully embroidered with a subtle geometric weave pattern. Pairs perfectly with high-waisted bottoms.',
    price: 1199,
    category: 'women',
    subCategory: 'tshirt',
    tags: ['pastel', 'crop', 'summer', 'geometric'],
    isPublished: true,
    totalSold: 289,
    averageRating: 4.6,
    reviewCount: 74,
    variants: [
      { size: 'XS', color: 'Lavender',    colorHex: '#E6E6FA', stock: 10, sku: 'OL-WOM-CT-XS-LAV' },
      { size: 'S',  color: 'Lavender',    colorHex: '#E6E6FA', stock: 25, sku: 'OL-WOM-CT-S-LAV' },
      { size: 'M',  color: 'Lavender',    colorHex: '#E6E6FA', stock: 20, sku: 'OL-WOM-CT-M-LAV' },
      { size: 'S',  color: 'Rust',        colorHex: '#B5451B', stock: 8,  sku: 'OL-WOM-CT-S-RST' },
      { size: 'M',  color: 'Rust',        colorHex: '#B5451B', stock: 12, sku: 'OL-WOM-CT-M-RST' },
    ],
    images: [IMG(1052), IMG(1058)],
  },
  {
    name: 'Heritage Bloom Hoodie',
    slug: 'heritage-bloom-hoodie',
    description:
      'Floral motifs inspired by Indian heritage, hand-embroidered on a soft, cozy 400 GSM cotton-fleece hoodie. The embroidery covers the full front panel, making this a statement piece that tells a story.',
    price: 2599,
    category: 'women',
    subCategory: 'hoodie',
    tags: ['bloom', 'floral', 'hoodie', 'heritage'],
    isPublished: true,
    totalSold: 198,
    averageRating: 4.8,
    reviewCount: 53,
    variants: [
      { size: 'XS', color: 'Cream', colorHex: '#F5F0E8', stock: 8,  sku: 'OL-WOM-HD-XS-CRM' },
      { size: 'S',  color: 'Cream', colorHex: '#F5F0E8', stock: 15, sku: 'OL-WOM-HD-S-CRM' },
      { size: 'M',  color: 'Cream', colorHex: '#F5F0E8', stock: 25, sku: 'OL-WOM-HD-M-CRM' },
      { size: 'S',  color: 'Navy',  colorHex: '#1B2A4A', stock: 10, sku: 'OL-WOM-HD-S-NVY' },
      { size: 'M',  color: 'Navy',  colorHex: '#1B2A4A', stock: 10, sku: 'OL-WOM-HD-M-NVY' },
    ],
    images: [IMG(1029), IMG(1031)],
  },
  {
    name: 'Craft Flow Palazzo',
    slug: 'craft-flow-palazzo',
    description:
      'Flowy and artistic. These wide-leg palazzos feature a continuous embroidered pattern along the hem, inspired by the border patterns of traditional Indian dupattas. Made from premium rayon with a silky drape.',
    price: 1999,
    category: 'women',
    subCategory: 'trouser',
    tags: ['palazzo', 'craft', 'ethnic', 'wide-leg'],
    isPublished: true,
    totalSold: 143,
    averageRating: 4.5,
    reviewCount: 37,
    variants: [
      { size: 'XS', color: 'Earth Brown', colorHex: '#964B00', stock: 8,  sku: 'OL-WOM-PL-XS-BRW' },
      { size: 'S',  color: 'Earth Brown', colorHex: '#964B00', stock: 12, sku: 'OL-WOM-PL-S-BRW' },
      { size: 'M',  color: 'Earth Brown', colorHex: '#964B00', stock: 18, sku: 'OL-WOM-PL-M-BRW' },
      { size: 'S',  color: 'Black',       colorHex: '#000000', stock: 10, sku: 'OL-WOM-PL-S-BLK' },
      { size: 'M',  color: 'Black',       colorHex: '#000000', stock: 10, sku: 'OL-WOM-PL-M-BLK' },
    ],
    images: [IMG(1055), IMG(1060)],
  },

  // ─── COUPLES ─────────────────────────────────────────────────────────────────
  {
    name: 'Twin Thread Coord Set',
    slug: 'twin-thread-coord-set',
    description:
      'Celebrate your connection with our bestselling matching coord sets. Each set contains two coordinated pieces — one for him, one for her — with interlocking thread designs that complete each other when you stand together. The ultimate couple outfit.',
    price: 3299,
    comparePrice: 3999,
    category: 'couples',
    subCategory: 'coord-set',
    tags: ['twin', 'matching', 'coord', 'bestseller', 'gift'],
    isFeatured: true,
    isPublished: true,
    totalSold: 312,
    averageRating: 4.9,
    reviewCount: 89,
    variants: [
      { size: 'S',  color: 'Sand',  colorHex: '#C2B280', stock: 12, sku: 'OL-CP-CS-S-SND' },
      { size: 'M',  color: 'Sand',  colorHex: '#C2B280', stock: 18, sku: 'OL-CP-CS-M-SND' },
      { size: 'L',  color: 'Sand',  colorHex: '#C2B280', stock: 15, sku: 'OL-CP-CS-L-SND' },
      { size: 'M',  color: 'Black', colorHex: '#000000', stock: 10, sku: 'OL-CP-CS-M-BLK' },
      { size: 'L',  color: 'Black', colorHex: '#000000', stock: 8,  sku: 'OL-CP-CS-L-BLK' },
    ],
    images: [IMG(1019), IMG(1066)],
    metaTitle: 'Twin Thread Coord Set — Matching Couple Outfit | Old Loom',
    metaDescription: 'Bestselling matching coord sets for couples. Interlocking embroidery designs. Perfect anniversary or wedding gift. Shop Couples Collection at Old Loom.',
  },
  {
    name: 'Mirror Weave Couple Hoodies',
    slug: 'mirror-weave-couple-hoodies',
    description:
      'Reflect each other\'s style. This set of two hoodies features mirrored embroidery patterns that complete when you are together. Each hoodie has half a design — left and right halves of an intricate loom motif.',
    price: 3499,
    category: 'couples',
    subCategory: 'hoodie',
    tags: ['mirror', 'couple', 'hoodie', 'matching'],
    isPublished: true,
    totalSold: 187,
    averageRating: 4.8,
    reviewCount: 62,
    variants: [
      { size: 'S',  color: 'Black', colorHex: '#000000', stock: 8,  sku: 'OL-CP-HD-S-BLK' },
      { size: 'M',  color: 'Black', colorHex: '#000000', stock: 12, sku: 'OL-CP-HD-M-BLK' },
      { size: 'L',  color: 'Black', colorHex: '#000000', stock: 10, sku: 'OL-CP-HD-L-BLK' },
      { size: 'M',  color: 'Cream', colorHex: '#F5F0E8', stock: 8,  sku: 'OL-CP-HD-M-CRM' },
      { size: 'L',  color: 'Cream', colorHex: '#F5F0E8', stock: 6,  sku: 'OL-CP-HD-L-CRM' },
    ],
    images: [IMG(1072), IMG(1074)],
  },
  {
    name: 'Loom Love Matching Tees',
    slug: 'loom-love-matching-tees',
    description:
      'Spread the love with our signature matching tees. Set includes two premium cotton tees with complementary embroidery — one says "Warp" and the other "Weft", the two threads that make a fabric whole.',
    price: 2499,
    category: 'couples',
    subCategory: 'tshirt',
    tags: ['love', 'matching', 'tees', 'gift'],
    isPublished: true,
    totalSold: 241,
    averageRating: 4.7,
    reviewCount: 71,
    variants: [
      { size: 'S',  color: 'White', colorHex: '#FFFFFF', stock: 10, sku: 'OL-CP-TS-S-WHT' },
      { size: 'M',  color: 'White', colorHex: '#FFFFFF', stock: 15, sku: 'OL-CP-TS-M-WHT' },
      { size: 'L',  color: 'White', colorHex: '#FFFFFF', stock: 10, sku: 'OL-CP-TS-L-WHT' },
      { size: 'S',  color: 'Black', colorHex: '#000000', stock: 8,  sku: 'OL-CP-TS-S-BLK' },
      { size: 'M',  color: 'Black', colorHex: '#000000', stock: 12, sku: 'OL-CP-TS-M-BLK' },
    ],
    images: [IMG(1076), IMG(1082)],
  },
];

// ── Seed Coupons ───────────────────────────────────────────────────────────────
const coupons = [
  {
    code: 'OLDLOOM10',
    type: 'percent' as const,
    value: 10,
    minOrderValue: 999,
    maxUses: 200,
    expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: 'FIRST20',
    type: 'percent' as const,
    value: 20,
    minOrderValue: 1499,
    maxUses: 500,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: 'FLAT200',
    type: 'flat' as const,
    value: 200,
    minOrderValue: 1999,
    maxUses: 100,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
];

// ── Seed Site Content ──────────────────────────────────────────────────────────
const siteContent = {
  heroBanner: {
    headline: 'Wear The Craft',
    subheadline: 'Premium hand-embroidered clothing from India — Men, Women & Couples',
    ctaText: 'Shop Now',
    ctaLink: '/collections/all',
    isActive: true,
  },
  announcementBar: {
    text: '🧵 Free shipping on orders above ₹5,000 — Crafted in India',
    bgColor: '#1A1612',
    textColor: '#C9A84C',
    isActive: true,
  },
};

// ── Runner ─────────────────────────────────────────────────────────────────────
async function seed() {
  try {
    const uri = process.env.MONGODB_URI || '';
    if (!uri) {
      console.error('❌  MONGODB_URI is not set in .env');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅  Connected to MongoDB\n');

    // Clear existing
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
      SiteContent.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data\n');

    // Seed users
    for (const u of users) {
      const { password, ...rest } = u;
      const hash = await bcrypt.hash(password, 12);
      await User.create({ ...rest, password: hash });
    }
    console.log(`👤  Seeded ${users.length} users`);

    // Seed products
    await Product.create(products);
    console.log(`📦  Seeded ${products.length} products`);

    // Seed coupons
    await Coupon.create(coupons);
    console.log(`🎟️   Seeded ${coupons.length} coupons`);

    // Seed site content
    await SiteContent.create(siteContent);
    console.log('🎨  Seeded site content\n');

    // Credentials table
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  OLD LOOM — SEED CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  Role           Email                     Password');
    console.log('───────────────────────────────────────────────────────────');
    users.forEach(u => {
      const role    = u.role.padEnd(15);
      const email   = u.email.padEnd(28);
      console.log(`  ${role} ${email} ${u.password}`);
    });
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  Coupons: OLDLOOM10 (10%) · FIRST20 (20%) · FLAT200 (₹200)');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('🎉  Seeding complete!\n');

    process.exit(0);
  } catch (err) {
    console.error('❌  Seeding failed:', err);
    process.exit(1);
  }
}

seed();
