import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import dns from 'dns';
import { Product } from '../models/Product';

// Override default DNS servers to use Google's public DNS to ensure Atlas SRV resolution works
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function importShopifyProducts() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI is not set in backend/.env');
      process.exit(1);
    }

    const csvPath = path.join(__dirname, '..', '..', '..', 'shopify_products_clean_multimage.csv');
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ CSV file not found at: ${csvPath}`);
      process.exit(1);
    }

    console.log(`📖 Reading CSV from: ${csvPath}`);
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    const dataLines = lines.slice(1);
    
    console.log(`Found ${dataLines.length} rows in CSV.`);

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas');

    const productsMap = new Map<string, any>();

    for (const line of dataLines) {
      const parts = parseCSVLine(line);
      const handle = parts[0]?.trim();
      let image = parts[8]?.trim() || '';
      
      if (!handle) continue;

      // Enhance image resolution by changing /w/448/ to /w/800/
      if (image && image.includes('/w/448/')) {
        image = image.replace('/w/448/', '/w/800/');
      } else if (image && image.includes('&w=330')) {
        image = image.replace('&w=330', '&w=800');
      }

      if (!productsMap.has(handle)) {
        const title = parts[1]?.trim() || '';
        let bodyHtml = parts[2]?.trim() || '';
        const vendor = parts[3]?.trim() || 'Old Loom';
        const type = parts[4]?.trim() || '';
        const tags = parts[5]?.split(',').map(t => t.trim()).filter(Boolean) || [];
        const published = parts[6]?.toUpperCase() === 'TRUE';
        const price = parseFloat(parts[7]) || 1999;

        // Clean HTML tags from description if needed, or keep it basic
        const cleanDescription = bodyHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || `Premium fashion item handcrafted with exceptional quality.`;

        // Category mapping
        let category: 'men' | 'women' | 'couples' = 'men';
        const textToMatch = `${title} ${type} ${tags.join(' ')}`.toLowerCase();
        
        if (textToMatch.includes('women') || textToMatch.includes('woman') || textToMatch.includes('girl') || textToMatch.includes('lady') || textToMatch.includes('dress') || textToMatch.includes('skirt') || textToMatch.includes('blouse') || textToMatch.includes('heels')) {
          category = 'women';
        } else if (textToMatch.includes('couples') || textToMatch.includes('unisex') || textToMatch.includes('perfume') || textToMatch.includes('oud') || textToMatch.includes('leather edp') || textToMatch.includes('scent')) {
          category = 'couples';
        } else {
          category = 'men';
        }

        // Subcategory mapping
        let subCategory: 'tshirt' | 'hoodie' | 'cap' | 'jogger' | 'trouser' | 'short' | 'coord-set' = 'tshirt';
        if (textToMatch.includes('tshirt') || textToMatch.includes('t-shirt') || textToMatch.includes('tee') || textToMatch.includes('polo') || textToMatch.includes('shirt')) {
          subCategory = 'tshirt';
        } else if (textToMatch.includes('hoodie') || textToMatch.includes('sweatshirt') || textToMatch.includes('jacket') || textToMatch.includes('sweater') || textToMatch.includes('pullover') || textToMatch.includes('fleece') || textToMatch.includes('cardigan') || textToMatch.includes('coat') || textToMatch.includes('blazer')) {
          subCategory = 'hoodie';
        } else if (textToMatch.includes('cap') || textToMatch.includes('hat') || textToMatch.includes('beanie') || textToMatch.includes('visor') || textToMatch.includes('sunglasses') || textToMatch.includes('belt') || textToMatch.includes('socks') || textToMatch.includes('backpack') || textToMatch.includes('bag') || textToMatch.includes('briefcase') || textToMatch.includes('toiletry') || textToMatch.includes('wallet') || textToMatch.includes('purse') || textToMatch.includes('card holder') || textToMatch.includes('ring') || textToMatch.includes('chain') || textToMatch.includes('bracelet') || textToMatch.includes('earrings') || textToMatch.includes('accessory') || textToMatch.includes('accessories') || textToMatch.includes('perfume') || textToMatch.includes('edp')) {
          subCategory = 'cap';
        } else if (textToMatch.includes('jogger') || textToMatch.includes('sweatpants') || textToMatch.includes('trackpants')) {
          subCategory = 'jogger';
        } else if (textToMatch.includes('trouser') || textToMatch.includes('jeans') || textToMatch.includes('pants') || textToMatch.includes('denim')) {
          subCategory = 'trouser';
        } else if (textToMatch.includes('short') || textToMatch.includes('shorts') || textToMatch.includes('trunks') || textToMatch.includes('boxers') || textToMatch.includes('briefs') || textToMatch.includes('boxer')) {
          subCategory = 'short';
        } else if (textToMatch.includes('set') || textToMatch.includes('coord') || textToMatch.includes('co-ord') || textToMatch.includes('suit')) {
          subCategory = 'coord-set';
        }

        // Variants generation (Required by Schema)
        const timestamp = Date.now();
        const cleanHandle = handle.toUpperCase();
        let variants = [];

        if (subCategory === 'cap') {
          // One size for accessories
          variants = [
            { size: 'Free Size', color: 'Default Black', colorHex: '#1A1612', stock: 35, sku: `OL-${cleanHandle}-FS` }
          ];
        } else {
          // standard sizes for apparel
          variants = [
            { size: 'S', color: 'Onyx Black', colorHex: '#1A1612', stock: 15, sku: `OL-${cleanHandle}-S` },
            { size: 'M', color: 'Onyx Black', colorHex: '#1A1612', stock: 25, sku: `OL-${cleanHandle}-M` },
            { size: 'L', color: 'Onyx Black', colorHex: '#1A1612', stock: 20, sku: `OL-${cleanHandle}-L` },
            { size: 'XL', color: 'Onyx Black', colorHex: '#1A1612', stock: 10, sku: `OL-${cleanHandle}-XL` }
          ];
        }

        productsMap.set(handle, {
          name: title || handle.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          slug: handle.toLowerCase(),
          description: cleanDescription,
          category,
          subCategory,
          price,
          comparePrice: price + 1000,
          images: image ? [image] : [],
          variants,
          tags: [...tags, 'zara', 'imported'],
          isPublished: published,
          isFeatured: Math.random() > 0.85, // randomly feature some items
          metaTitle: `${title || handle} | Old Loom`,
          metaDescription: cleanDescription.substring(0, 150),
          totalSold: Math.floor(Math.random() * 80) + 5,
          averageRating: parseFloat((4.2 + Math.random() * 0.8).toFixed(1)),
          reviewCount: Math.floor(Math.random() * 35) + 3
        });
      } else {
        const existing = productsMap.get(handle);
        if (image && !existing.images.includes(image)) {
          existing.images.push(image);
        }
      }
    }

    console.log(`Mapped ${productsMap.size} unique products. Starting upload...`);

    const bulkOps = [];
    for (const [slug, productData] of productsMap.entries()) {
      bulkOps.push({
        updateOne: {
          filter: { slug },
          update: { $set: productData },
          upsert: true
        }
      });
    }

    console.log('Sending bulk write request to Atlas...');
    const result = await Product.bulkWrite(bulkOps);
    console.log(`📦 Bulk write completed:`);
    console.log(`   - Matched: ${result.matchedCount}`);
    console.log(`   - Modified: ${result.modifiedCount}`);
    console.log(`   - Upserted: ${result.upsertedCount}`);
    console.log('🎉 Successfully imported all Shopify products!');

  } catch (error: any) {
    console.error('❌ Importing failed!');
    if (error.writeErrors && error.writeErrors.length > 0) {
      console.error('First 5 write errors:');
      error.writeErrors.slice(0, 5).forEach((e: any, i: number) => {
        console.error(`  [Error ${i + 1}] Index ${e.index}: ${e.errmsg || e.message}`);
      });
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

importShopifyProducts();
