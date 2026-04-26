import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';

dotenv.config();

const users = [
  { name: 'Old Loom Admin', email: 'admin@oldloom.in', password: 'OldLoom@Admin2025', role: 'super_admin' },
  { name: 'Priya Sharma', email: 'manager@oldloom.in', password: 'OldLoom@Mgr2025', role: 'manager' },
  { name: 'Arjun Mehta', email: 'editor@oldloom.in', password: 'OldLoom@Edit2025', role: 'content_editor' },
  { name: 'Neha Patel', email: 'support@oldloom.in', password: 'OldLoom@Sup2025', role: 'support_staff' },
  { name: 'Rahul Kumar', email: 'customer@oldloom.in', password: 'OldLoom@Cust2025', role: 'customer', storeCredit: 500, addresses: [{
    label: 'Home',
    name: 'Rahul Kumar',
    phone: '9876543210',
    addressLine1: '123 Marine Drive',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    isDefault: true
  }] },
];

const products = [
  // Men
  {
    name: 'Heritage Weave Classic Tee',
    description: 'A timeless classic featuring intricate hand-woven embroidery on premium cotton. Perfect for a heritage-inspired look.',
    price: 1299,
    comparePrice: 1599,
    category: 'men',
    subCategory: 'tshirt',
    tags: ['heritage', 'classic', 'cotton'],
    isFeatured: true,
    isPublished: true,
    variants: [
      { size: 'M', color: 'Midnight Black', colorHex: '#1A1A1A', stock: 50, sku: 'OL-MEN-TS-M-BLK' },
      { size: 'L', color: 'Midnight Black', colorHex: '#1A1A1A', stock: 30, sku: 'OL-MEN-TS-L-BLK' },
      { size: 'XL', color: 'Ivory White', colorHex: '#F5F5F5', stock: 20, sku: 'OL-MEN-TS-XL-WHT' },
    ],
    images: ['https://placehold.co/600x800/1A1612/C9A84C?text=Heritage+Weave+Classic+Tee']
  },
  {
    name: 'Golden Thread Polo',
    description: 'Elevate your casual wear with this polo, detailed with golden thread embroidery on the collar and cuffs.',
    price: 1499,
    category: 'men',
    subCategory: 'tshirt',
    tags: ['polo', 'gold', 'casual'],
    isPublished: true,
    variants: [
      { size: 'S', color: 'Navy', colorHex: '#000080', stock: 15, sku: 'OL-MEN-PL-S-NVY' },
      { size: 'M', color: 'Navy', colorHex: '#000080', stock: 25, sku: 'OL-MEN-PL-M-NVY' },
      { size: 'L', color: 'Forest Green', colorHex: '#228B22', stock: 10, sku: 'OL-MEN-PL-L-GRN' },
    ],
    images: ['https://placehold.co/600x800/1A1612/C9A84C?text=Golden+Thread+Polo']
  },
  {
    name: 'Embroidered Luxe Hoodie',
    description: 'Supreme comfort meets artistic flair. This heavyweight hoodie features a large embroidered loom motif on the back.',
    price: 2499,
    comparePrice: 2999,
    category: 'men',
    subCategory: 'hoodie',
    tags: ['luxe', 'hoodie', 'winter'],
    isFeatured: true,
    isPublished: true,
    variants: [
      { size: 'M', color: 'Charcoal', colorHex: '#36454F', stock: 40, sku: 'OL-MEN-HD-M-CHR' },
      { size: 'L', color: 'Charcoal', colorHex: '#36454F', stock: 20, sku: 'OL-MEN-HD-L-CHR' },
      { size: 'XL', color: 'Oatmeal', colorHex: '#E3D9C6', stock: 15, sku: 'OL-MEN-HD-XL-OAT' },
    ],
    images: ['https://placehold.co/600x800/1A1612/C9A84C?text=Embroidered+Luxe+Hoodie']
  },
  {
    name: 'Artisan Stitch Joggers',
    description: 'Relax in style. These joggers are subtly detailed with artisan stitching along the side seams.',
    price: 1799,
    category: 'men',
    subCategory: 'jogger',
    tags: ['jogger', 'artisan', 'comfy'],
    isPublished: true,
    variants: [
      { size: 'M', color: 'Black', colorHex: '#000000', stock: 30, sku: 'OL-MEN-JG-M-BLK' },
      { size: 'L', color: 'Black', colorHex: '#000000', stock: 25, sku: 'OL-MEN-JG-L-BLK' },
      { size: 'S', color: 'Grey', colorHex: '#808080', stock: 10, sku: 'OL-MEN-JG-S-GRY' },
    ],
    images: ['https://placehold.co/600x800/1A1612/C9A84C?text=Artisan+Stitch+Joggers']
  },
  {
    name: 'Loom Signature Cap',
    description: 'A classic dad-cap with our signature loom logo embroidered in high-density thread.',
    price: 799,
    category: 'men',
    subCategory: 'cap',
    tags: ['cap', 'signature', 'accessory'],
    isPublished: true,
    variants: [
      { size: 'Free Size', color: 'Black', colorHex: '#000000', stock: 100, sku: 'OL-ACC-CP-FS-BLK' },
      { size: 'Free Size', color: 'Beige', colorHex: '#F5F5DC', stock: 50, sku: 'OL-ACC-CP-FS-BGE' },
      { size: 'Free Size', color: 'Maroon', colorHex: '#800000', stock: 30, sku: 'OL-ACC-CP-FS-MAR' },
      { size: 'Free Size', color: 'Olive', colorHex: '#808000', stock: 40, sku: 'OL-ACC-CP-FS-OLV' },
    ],
    images: ['https://placehold.co/600x800/1A1612/C9A84C?text=Loom+Signature+Cap']
  },
  // Women
  {
    name: 'Silk Thread Embroidered Tee',
    description: 'Elegance redefined. This tee uses fine silk threads for a shimmering embroidery effect on the chest.',
    price: 1399,
    comparePrice: 1699,
    category: 'women',
    subCategory: 'tshirt',
    tags: ['silk', 'elegant', 'tee'],
    isFeatured: true,
    isPublished: true,
    variants: [
      { size: 'S', color: 'Blush Pink', colorHex: '#FFB6C1', stock: 20, sku: 'OL-WOM-TS-S-PNK' },
      { size: 'M', color: 'Blush Pink', colorHex: '#FFB6C1', stock: 35, sku: 'OL-WOM-TS-M-PNK' },
      { size: 'L', color: 'White', colorHex: '#FFFFFF', stock: 15, sku: 'OL-WOM-TS-L-WHT' },
    ],
    images: ['https://placehold.co/600x800/1A1612/C9A84C?text=Silk+Thread+Embroidered+Tee']
  },
  {
    name: 'Pastel Weave Crop Tee',
    description: 'A modern silhouette meets traditional weaving. This crop tee is light, breathable, and beautifully embroidered.',
    price: 1199,
    category: 'women',
    subCategory: 'tshirt',
    tags: ['pastel', 'crop', 'summer'],
    isPublished: true,
    variants: [
      { size: 'XS', color: 'Lavender', colorHex: '#E6E6FA', stock: 10, sku: 'OL-WOM-CT-XS-LAV' },
      { size: 'S', color: 'Lavender', colorHex: '#E6E6FA', stock: 25, sku: 'OL-WOM-CT-S-LAV' },
      { size: 'M', color: 'Mint', colorHex: '#98FF98', stock: 20, sku: 'OL-WOM-CT-M-MNT' },
    ],
    images: ['https://placehold.co/600x800/1A1612/C9A84C?text=Pastel+Weave+Crop+Tee']
  },
  {
    name: 'Heritage Bloom Hoodie',
    description: 'Floral motifs inspired by Indian heritage, hand-embroidered on a soft, cozy hoodie.',
    price: 2599,
    category: 'women',
    subCategory: 'hoodie',
    tags: ['bloom', 'floral', 'hoodie'],
    isPublished: true,
    variants: [
      { size: 'S', color: 'Cream', colorHex: '#FFFDD0', stock: 15, sku: 'OL-WOM-HD-S-CRM' },
      { size: 'M', color: 'Cream', colorHex: '#FFFDD0', stock: 25, sku: 'OL-WOM-HD-M-CRM' },
      { size: 'L', color: 'Teal', colorHex: '#008080', stock: 10, sku: 'OL-WOM-HD-L-TEA' },
    ],
    images: ['https://placehold.co/600x800/1A1612/C9A84C?text=Heritage+Bloom+Hoodie']
  },
  {
    name: 'Craft Flow Palazzo',
    description: 'Flowy and artistic. These palazzos feature a continuous embroidered pattern along the hem.',
    price: 1999,
    category: 'women',
    subCategory: 'trouser',
    tags: ['palazzo', 'craft', 'ethnic'],
    isPublished: true,
    variants: [
      { size: 'S', color: 'Earth Brown', colorHex: '#964B00', stock: 12, sku: 'OL-WOM-PL-S-BRW' },
      { size: 'M', color: 'Earth Brown', colorHex: '#964B00', stock: 18, sku: 'OL-WOM-PL-M-BRW' },
      { size: 'L', color: 'Black', colorHex: '#000000', stock: 10, sku: 'OL-WOM-PL-L-BLK' },
    ],
    images: ['https://placehold.co/600x800/1A1612/C9A84C?text=Craft+Flow+Palazzo']
  },
  // Couples
  {
    name: 'Twin Thread Coord Set',
    description: 'Celebrate your connection with matching coord sets. Detailed with interlocking thread designs.',
    price: 3299,
    comparePrice: 3999,
    category: 'couples',
    subCategory: 'coord-set',
    tags: ['twin', 'matching', 'coord'],
    isFeatured: true,
    isPublished: true,
    variants: [
      { size: 'M', color: 'Sand', colorHex: '#C2B280', stock: 10, sku: 'OL-CP-CS-M-SND' },
      { size: 'L', color: 'Sand', colorHex: '#C2B280', stock: 15, sku: 'OL-CP-CS-L-SND' },
      { size: 'XL', color: 'Olive', colorHex: '#808000', stock: 8, sku: 'OL-CP-CS-XL-OLV' },
    ],
    images: ['https://placehold.co/600x800/1A1612/C9A84C?text=Twin+Thread+Coord+Set']
  },
  {
    name: 'Mirror Weave Couple Hoodie',
    description: 'Reflect each other style. These hoodies feature mirrored embroidery patterns that complete when you are together.',
    price: 3499,
    category: 'couples',
    subCategory: 'hoodie',
    tags: ['mirror', 'couple', 'hoodie'],
    isPublished: true,
    variants: [
      { size: 'M', color: 'Black', colorHex: '#000000', stock: 10, sku: 'OL-CP-HD-M-BLK' },
      { size: 'L', color: 'Black', colorHex: '#000000', stock: 12, sku: 'OL-CP-HD-L-BLK' },
    ],
    images: ['https://placehold.co/600x800/1A1612/C9A84C?text=Mirror+Weave+Couple+Hoodie']
  },
  {
    name: 'Loom Love Matching Tees',
    description: 'Spread the love with our signature matching tees. Set includes two tshirts with complementary embroidery.',
    price: 2499,
    category: 'couples',
    subCategory: 'tshirt',
    tags: ['love', 'matching', 'tees'],
    isPublished: true,
    variants: [
      { size: 'S', color: 'White', colorHex: '#FFFFFF', stock: 10, sku: 'OL-CP-TS-S-WHT' },
      { size: 'M', color: 'White', colorHex: '#FFFFFF', stock: 15, sku: 'OL-CP-TS-M-WHT' },
      { size: 'L', color: 'Grey', colorHex: '#808080', stock: 8, sku: 'OL-CP-TS-L-GRY' },
    ],
    images: ['https://placehold.co/600x800/1A1612/C9A84C?text=Loom+Love+Matching+Tees']
  },
];

const coupons = [
  { code: 'OLDLOOM10', type: 'percent', value: 10, minOrderValue: 999, maxUses: 200, expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) },
  { code: 'FIRST20', type: 'percent', value: 20, minOrderValue: 1499, maxUses: 500, expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
  { code: 'FLAT200', type: 'flat', value: 200, minOrderValue: 1999, maxUses: 100, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});

    // Seed Users
    for (const u of users) {
      const { password, ...rest } = u;
      const hashedPassword = await bcrypt.hash(password, 12);
      await User.create({ ...rest, password: hashedPassword, isActive: true, isEmailVerified: true });
    }
    console.log('Users seeded.');

    // Seed Products
    await Product.create(products);
    console.log('Products seeded.');

    // Seed Coupons
    await Coupon.create(coupons);
    console.log('Coupons seeded.');

    console.log('Seeding complete! 🧵');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
