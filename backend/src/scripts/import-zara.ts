import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import dns from 'dns';
import { Product } from '../models/Product';

// Override default DNS servers to use Google's public DNS to ensure Atlas SRV resolution works
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

// Custom CSV parser that handles basic comma separation and URL cleaning
function parseZaraCSV(filePath: string): Array<{ image: string; url: string }> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  
  // Skip the header
  const dataLines = lines.slice(1);
  const results: Array<{ image: string; url: string }> = [];

  for (const line of dataLines) {
    // Columns are split by commas.
    // Line format: ImageURL,,ProductURL
    const parts = line.split(',');
    const image = parts[0]?.trim();
    const url = parts[parts.length - 1]?.trim();

    if (image && url) {
      results.push({ image, url });
    }
  }

  return results;
}

async function importProducts() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI is not set in backend/.env');
      process.exit(1);
    }

    const csvPath = path.join(__dirname, '..', '..', '..', 'simplescraper-www-zara-com-2026-06-04T20-26-05.csv');
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ CSV file not found at: ${csvPath}`);
      process.exit(1);
    }

    console.log(`📖 Reading CSV from: ${csvPath}`);
    const scrapedProducts = parseZaraCSV(csvPath);
    console.log(`Found ${scrapedProducts.length} products to map.\n`);

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas');

    const productsToInsert = [];

    for (const p of scrapedProducts) {
      // Extract the name/id from URL
      // Example: https://www.zara.com/in/en/cotton-linen-polo-shirt-p07545132.html
      const urlParts = p.url.split('/');
      const filename = urlParts[urlParts.length - 1]; // e.g. cotton-linen-polo-shirt-p07545132.html
      const cleanSlug = filename.replace('.html', ''); // e.g. cotton-linen-polo-shirt-p07545132
      const baseName = cleanSlug.replace(/-p\d+$/, ''); // e.g. cotton-linen-polo-shirt
      
      let name = '';
      let description = '';
      let category: 'men' | 'women' | 'couples' = 'men';
      let subCategory: 'tshirt' | 'hoodie' | 'cap' | 'jogger' | 'trouser' | 'short' | 'coord-set' = 'tshirt';
      let price = 2990;
      let tags: string[] = ['zara', 'imported'];
      let variants: any[] = [];

      // High-quality image mapping (adjust width parameter from 330 to 600 or 800)
      const highResImage = p.image.replace('&w=330', '&w=600');

      if (baseName.includes('polo')) {
        name = 'Cotton Linen Polo Shirt';
        description = 'A lightweight and breathable polo shirt crafted from a premium cotton and linen blend. Features a classic polo collar, short sleeves, and a clean buttoned placket. A perfect addition to a smart-casual wardrobe.';
        category = 'men';
        subCategory = 'tshirt';
        price = 2290;
        tags.push('linen', 'polo', 'shirt');
        variants = [
          { size: 'S', color: 'Midnight Blue', colorHex: '#1B2A4A', stock: 20, sku: `OL-ZARA-POLO-S-${Date.now()}` },
          { size: 'M', color: 'Midnight Blue', colorHex: '#1B2A4A', stock: 25, sku: `OL-ZARA-POLO-M-${Date.now()}` },
          { size: 'L', color: 'Midnight Blue', colorHex: '#1B2A4A', stock: 15, sku: `OL-ZARA-POLO-L-${Date.now()}` },
          { size: 'XL', color: 'Midnight Blue', colorHex: '#1B2A4A', stock: 10, sku: `OL-ZARA-POLO-XL-${Date.now()}` },
        ];
      } else if (baseName.includes('jeans')) {
        name = 'Straight Fit Jeans';
        description = 'Straight fit jeans made of rigid cotton denim. Features a five-pocket design, faded wash effect, and button-up front closure. A classic, everyday silhouette designed for longevity.';
        category = 'men';
        subCategory = 'trouser';
        price = 3990;
        tags.push('denim', 'jeans', 'pants');
        variants = [
          { size: 'S', color: 'Light Blue', colorHex: '#A4C3DF', stock: 15, sku: `OL-ZARA-JEAN-S-${Date.now()}` },
          { size: 'M', color: 'Light Blue', colorHex: '#A4C3DF', stock: 30, sku: `OL-ZARA-JEAN-M-${Date.now()}` },
          { size: 'L', color: 'Light Blue', colorHex: '#A4C3DF', stock: 20, sku: `OL-ZARA-JEAN-L-${Date.now()}` },
          { size: 'XL', color: 'Light Blue', colorHex: '#A4C3DF', stock: 12, sku: `OL-ZARA-JEAN-XL-${Date.now()}` },
        ];
      } else if (baseName.includes('linen')) {
        name = '100% Linen Regular Fit Shirt';
        description = 'Regular-fit shirt crafted from 100% linen fabric. Structured with a classic button-down collar, long sleeves with buttoned cuffs, and a breast patch pocket. Ideal for warm weather styling.';
        category = 'men';
        subCategory = 'tshirt'; // Shirts mapped to tshirt subcategory for UI display
        price = 3290;
        tags.push('linen', 'shirt', 'regular-fit');
        variants = [
          { size: 'S', color: 'Pure White', colorHex: '#FFFFFF', stock: 22, sku: `OL-ZARA-SHRT-S-${Date.now()}` },
          { size: 'M', color: 'Pure White', colorHex: '#FFFFFF', stock: 28, sku: `OL-ZARA-SHRT-M-${Date.now()}` },
          { size: 'L', color: 'Pure White', colorHex: '#FFFFFF', stock: 18, sku: `OL-ZARA-SHRT-L-${Date.now()}` },
          { size: 'XL', color: 'Pure White', colorHex: '#FFFFFF', stock: 14, sku: `OL-ZARA-SHRT-XL-${Date.now()}` },
        ];
      } else if (baseName.includes('leather') || baseName.includes('oud')) {
        name = 'Oud Vibrant Leather EDP';
        description = 'An elegant, long-lasting Eau De Parfum featuring woody oud notes blended with rich, warm vibrant leather. A sophisticated and modern fragrance suitable for any occasion. 100 ml / 3.38 oz.';
        category = 'couples'; // Perfumes mapped as unisex/couples
        subCategory = 'cap'; // Mapped to cap/accessories subcategory
        price = 2990;
        tags.push('fragrance', 'perfume', 'accessory');
        variants = [
          { size: 'Free Size', color: 'Amber Gold', colorHex: '#D4AF37', stock: 50, sku: `OL-ZARA-OUD-FS-${Date.now()}` },
        ];
      } else {
        // Fallback for any unknown products
        name = baseName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        description = `Premium fashion product. High-quality construction and details from Zara.`;
        category = 'men';
        subCategory = 'tshirt';
        price = 1999;
        variants = [
          { size: 'Free Size', color: 'Default', colorHex: '#000000', stock: 50, sku: `OL-ZARA-GEN-FS-${Date.now()}` }
        ];
      }

      const productData = {
        name,
        slug: cleanSlug,
        description,
        category,
        subCategory,
        price,
        comparePrice: price + 1000, // add a mock comparison price for sale view
        images: [highResImage],
        variants,
        tags,
        isPublished: true,
        isFeatured: true,
        metaTitle: `${name} | Old Loom`,
        metaDescription: description.substring(0, 150),
        totalSold: Math.floor(Math.random() * 50) + 10,
        averageRating: parseFloat((4.0 + Math.random()).toFixed(1)),
        reviewCount: Math.floor(Math.random() * 20) + 5
      };

      // Check if product already exists to avoid duplicates
      const existing = await Product.findOne({ slug: cleanSlug });
      if (existing) {
        console.log(`⚠️ Product already exists, updating: "${name}"`);
        await Product.updateOne({ slug: cleanSlug }, { $set: productData });
      } else {
        productsToInsert.push(productData);
      }
    }

    if (productsToInsert.length > 0) {
      await Product.create(productsToInsert);
      console.log(`📦 Successfully imported ${productsToInsert.length} new Zara products into the database!`);
    } else {
      console.log('ℹ️ No new products to insert, all were updated.');
    }

    console.log('\nImport Summary:');
    const dbProducts = await Product.find({ tags: 'zara' });
    dbProducts.forEach((p, idx) => {
      console.log(`${idx + 1}. [${p.category} / ${p.subCategory}] ${p.name} - ₹${p.price} (Slug: ${p.slug})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Importing failed:', error);
    process.exit(1);
  }
}

importProducts();
