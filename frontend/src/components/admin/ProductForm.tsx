'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Plus, Upload, GripVertical } from 'lucide-react';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'] as const;
const COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy', hex: '#1B2A4A' },
  { name: 'Rust', hex: '#B5451B' },
  { name: 'Cream', hex: '#F5F0E8' },
  { name: 'Forest Green', hex: '#2D5016' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Sand', hex: '#C2B280' },
];

const variantSchema = z.object({
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']),
  color: z.string().min(1),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  stock: z.number().min(0),
  sku: z.string().min(1),
});

const productSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  description: z.string().min(10, 'Description too short'),
  category: z.enum(['men', 'women', 'couples']),
  subCategory: z.enum(['tshirt', 'hoodie', 'cap', 'jogger', 'trouser', 'short', 'coord-set']),
  price: z.number().min(1, 'Price required'),
  comparePrice: z.number().optional(),
  images: z.array(z.string()).min(1, 'At least 1 image required'),
  glbModel: z.string().optional(),
  variants: z.array(variantSchema).min(1, 'At least 1 variant required'),
  tags: z.array(z.string()),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  productId?: string;
  defaultValues?: Partial<ProductFormData>;
}

export function ProductForm({ productId, defaultValues }: ProductFormProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const isEditing = !!productId;

  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'men',
      subCategory: 'tshirt',
      price: 0,
      images: [],
      variants: [],
      tags: [],
      isPublished: false,
      isFeatured: false,
      ...defaultValues,
    },
  });

  const watchName = watch('name');
  const watchImages = watch('images');
  const watchVariants = watch('variants');
  const watchTags = watch('tags');

  // Auto-generate slug from name
  const slug = (watchName || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const mutation = useMutation({
    mutationFn: (data: ProductFormData) =>
      isEditing
        ? api.put(`/admin/products/${productId}`, data)
        : api.post('/admin/products', data),
    onSuccess: () => {
      toast.success(isEditing ? 'Product updated' : 'Product created');
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      router.push('/admin/products');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save product');
    },
  });

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || 'oldloom');
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/upload`,
          { method: 'POST', body: formData }
        );
        const data = await res.json();
        if (data.secure_url) urls.push(data.secure_url);
      }
      setValue('images', [...watchImages, ...urls]);
      toast.success(`${urls.length} image(s) uploaded`);
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const addVariant = () => {
    setValue('variants', [
      ...watchVariants,
      { size: 'M', color: 'Black', colorHex: '#000000', stock: 0, sku: `${slug}-M-BLK-${Date.now()}` },
    ]);
  };

  const removeVariant = (i: number) => {
    setValue('variants', watchVariants.filter((_, idx) => idx !== i));
  };

  const addTag = () => {
    if (tagInput.trim() && !watchTags.includes(tagInput.trim())) {
      setValue('tags', [...watchTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const onSubmit = (data: ProductFormData) => mutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      {/* Basic Info */}
      <Section title="Basic Information">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Product Name *</Label>
            <input
              {...register('name')}
              className={Input}
              placeholder="Embroidered Heritage Kurta"
            />
            {errors.name && <Error>{errors.name.message}</Error>}
            {slug && <p className="text-xs text-[#F5F0E8]/30 font-mono mt-1">Slug: {slug}</p>}
          </div>

          <div>
            <Label>Category *</Label>
            <select {...register('category')} className={Input}>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="couples">Couples</option>
            </select>
          </div>

          <div>
            <Label>Sub-Category *</Label>
            <select {...register('subCategory')} className={Input}>
              {['tshirt', 'hoodie', 'cap', 'jogger', 'trouser', 'short', 'coord-set'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Price (₹) *</Label>
            <input
              {...register('price', { valueAsNumber: true })}
              type="number"
              className={Input}
              placeholder="1499"
            />
            {errors.price && <Error>{errors.price.message}</Error>}
          </div>

          <div>
            <Label>Compare Price (₹)</Label>
            <input
              {...register('comparePrice', { valueAsNumber: true })}
              type="number"
              className={Input}
              placeholder="1999"
            />
          </div>

          <div className="md:col-span-2">
            <Label>Description *</Label>
            <textarea
              {...register('description')}
              rows={5}
              className={`${Input} resize-none`}
              placeholder="Describe the product, embroidery details, fabric..."
            />
            {errors.description && <Error>{errors.description.message}</Error>}
          </div>
        </div>
      </Section>

      {/* Images */}
      <Section title="Images">
        <div
          className="border-2 border-dashed border-[#C9A84C]/20 rounded-xl p-8 text-center cursor-pointer hover:border-[#C9A84C]/40 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleImageUpload(e.dataTransfer.files); }}
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          <input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e.target.files)}
          />
          <Upload className="w-8 h-8 text-[#C9A84C]/40 mx-auto mb-2" />
          <p className="text-sm text-[#F5F0E8]/40 font-mono">
            {uploading ? 'Uploading...' : 'Drop images here or click to upload'}
          </p>
        </div>

        {watchImages.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-4">
            {watchImages.map((url, i) => (
              <div key={url} className="relative group aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => setValue('images', watchImages.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 w-5 h-5 bg-[#B5451B] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 text-[9px] bg-[#C9A84C] text-[#1A1612] px-1 rounded font-mono">
                    MAIN
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        {errors.images && <Error>{errors.images.message}</Error>}
      </Section>

      {/* Variants */}
      <Section title="Variants (Size × Colour)">
        <div className="space-y-3">
          {watchVariants.map((_, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end bg-[#0F0D0B] rounded-lg p-3">
              <div>
                <Label>Size</Label>
                <Controller
                  control={control}
                  name={`variants.${i}.size`}
                  render={({ field }) => (
                    <select {...field} className={Input}>
                      {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                />
              </div>
              <div>
                <Label>Color</Label>
                <Controller
                  control={control}
                  name={`variants.${i}.color`}
                  render={({ field }) => (
                    <select
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        const c = COLORS.find((c) => c.name === e.target.value);
                        if (c) setValue(`variants.${i}.colorHex`, c.hex);
                      }}
                      className={Input}
                    >
                      {COLORS.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  )}
                />
              </div>
              <div>
                <Label>Stock</Label>
                <input
                  {...register(`variants.${i}.stock`, { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className={Input}
                />
              </div>
              <div>
                <Label>SKU</Label>
                <input
                  {...register(`variants.${i}.sku`)}
                  className={Input}
                  placeholder="OL-TS-M-BLK"
                />
              </div>
              <button
                type="button"
                onClick={() => removeVariant(i)}
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-[#B5451B]/30 text-[#B5451B] hover:bg-[#B5451B]/10 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-2 text-sm text-[#C9A84C] font-mono hover:text-[#C9A84C]/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Variant
          </button>
          {errors.variants && <Error>At least one variant required</Error>}
        </div>
      </Section>

      {/* Tags */}
      <Section title="Tags">
        <div className="flex gap-2 flex-wrap mb-3">
          {watchTags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 text-xs bg-[#C9A84C]/10 text-[#C9A84C] px-2 py-1 rounded-full font-mono">
              {tag}
              <button type="button" onClick={() => setValue('tags', watchTags.filter((t) => t !== tag))}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            className={`${Input} flex-1`}
            placeholder="embroidery, premium, gifting..."
          />
          <button type="button" onClick={addTag} className="px-3 py-2 bg-[#C9A84C]/20 text-[#C9A84C] rounded-lg text-sm font-mono">
            Add
          </button>
        </div>
      </Section>

      {/* SEO */}
      <Section title="SEO">
        <div className="space-y-4">
          <div>
            <Label>Meta Title</Label>
            <input {...register('metaTitle')} className={Input} placeholder="SEO title (60 chars)" />
          </div>
          <div>
            <Label>Meta Description</Label>
            <textarea {...register('metaDescription')} rows={3} className={`${Input} resize-none`} placeholder="SEO description (160 chars)" />
          </div>
        </div>
      </Section>

      {/* Publish */}
      <Section title="Visibility">
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <Controller
              control={control}
              name="isPublished"
              render={({ field }) => (
                <input type="checkbox" {...field} value={undefined} checked={field.value} className="accent-[#C9A84C] w-4 h-4" />
              )}
            />
            <span className="text-sm text-[#F5F0E8]/80 font-mono">Published (visible on store)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Controller
              control={control}
              name="isFeatured"
              render={({ field }) => (
                <input type="checkbox" {...field} value={undefined} checked={field.value} className="accent-[#C9A84C] w-4 h-4" />
              )}
            />
            <span className="text-sm text-[#F5F0E8]/80 font-mono">Featured (show on homepage)</span>
          </label>
        </div>
      </Section>

      {/* Submit */}
      <div className="flex items-center gap-4 pt-4 border-t border-[#C9A84C]/10">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#C9A84C] text-[#1A1612] px-8 py-2.5 rounded-lg font-bold font-mono text-sm hover:bg-[#C9A84C]/90 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="px-6 py-2.5 rounded-lg font-mono text-sm text-[#F5F0E8]/50 hover:text-[#F5F0E8] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Shared style helpers
const Input = 'w-full bg-[#0F0D0B] border border-[#C9A84C]/10 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono placeholder:text-[#F5F0E8]/20 focus:outline-none focus:border-[#C9A84C]/30 transition-colors';
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs text-[#F5F0E8]/50 font-mono uppercase tracking-widest mb-1.5">{children}</label>
);
const Error = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs text-[#B5451B] font-mono mt-1">{children}</p>
);
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-[#1A1612] border border-[#C9A84C]/10 rounded-xl p-6">
    <h2 className="text-xs font-mono text-[#C9A84C] tracking-widest uppercase mb-5">{title}</h2>
    {children}
  </div>
);
