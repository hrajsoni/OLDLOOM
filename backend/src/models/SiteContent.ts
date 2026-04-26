import mongoose, { Document, Schema } from 'mongoose';

export interface ISiteContent extends Document {
  heroBanner: {
    image: string;
    headline: string;
    subtext: string;
    ctaText: string;
    ctaLink: string;
    isActive: boolean;
  };
  announcementBar: {
    text: string;
    bgColor: string;
    textColor: string;
    isActive: boolean;
  };
  updatedAt: Date;
}

const SiteContentSchema = new Schema<ISiteContent>(
  {
    heroBanner: {
      image: { type: String, default: '' },
      headline: { type: String, default: 'WEAR THE CRAFT' },
      subtext: { type: String, default: 'Old Loom — Embroidery Redefined' },
      ctaText: { type: String, default: 'Explore Collection' },
      ctaLink: { type: String, default: '/collections/all' },
      isActive: { type: Boolean, default: true },
    },
    announcementBar: {
      text: {
        type: String,
        default: '🧵 Free shipping on orders above ₹999 · Use code OLDLOOM10 for 10% off',
      },
      bgColor: { type: String, default: '#C9A84C' },
      textColor: { type: String, default: '#1A1612' },
      isActive: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const SiteContent = mongoose.model<ISiteContent>('SiteContent', SiteContentSchema);
