'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Upload, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface SiteContentData {
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
}

const defaultContent: SiteContentData = {
  heroBanner: {
    image: '',
    headline: 'WEAR THE CRAFT',
    subtext: 'Old Loom — Embroidery Redefined',
    ctaText: 'Explore Collection',
    ctaLink: '/collections/all',
    isActive: true,
  },
  announcementBar: {
    text: '🧵 Free shipping on orders above ₹999 · Use code OLDLOOM10 for 10% off',
    bgColor: '#C9A84C',
    textColor: '#1A1612',
    isActive: true,
  },
};

export default function AdminContentPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<SiteContentData>(defaultContent);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-content'],
    queryFn: () => api.get('/admin/content').then((r) => r.data.data),
  });

  useEffect(() => {
    if (data) {
      setForm({
        heroBanner: { ...defaultContent.heroBanner, ...data.heroBanner },
        announcementBar: { ...defaultContent.announcementBar, ...data.announcementBar },
      });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (payload: SiteContentData) => api.put('/admin/content', payload),
    onSuccess: () => {
      toast.success('Content saved');
      qc.invalidateQueries({ queryKey: ['admin-content'] });
    },
    onError: () => toast.error('Failed to save'),
  });

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || 'oldloom');
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        setForm((f) => ({ ...f, heroBanner: { ...f.heroBanner, image: data.secure_url } }));
        toast.success('Image uploaded');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-[#1A1612] rounded-xl animate-pulse border border-[#C9A84C]/10" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F0E8] font-mono">Content</h1>
          <p className="text-[#F5F0E8]/40 text-sm font-mono mt-1">
            Edit homepage banners and announcement bar
          </p>
        </div>
        <button
          onClick={() => saveMutation.mutate(form)}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 bg-[#C9A84C] text-[#1A1612] px-4 py-2 rounded-lg text-sm font-bold font-mono hover:bg-[#C9A84C]/90 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Announcement Bar */}
      <div className="bg-[#1A1612] border border-[#C9A84C]/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-mono text-[#C9A84C] tracking-widest">ANNOUNCEMENT BAR</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.announcementBar.isActive}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  announcementBar: { ...f.announcementBar, isActive: e.target.checked },
                }))
              }
              className="accent-[#C9A84C] w-4 h-4"
            />
            <span className="text-xs text-[#F5F0E8]/50 font-mono">Active</span>
          </label>
        </div>

        {/* Preview */}
        <div
          className="rounded-lg px-4 py-2 text-center text-sm font-mono mb-4 transition-all"
          style={{
            backgroundColor: form.announcementBar.bgColor,
            color: form.announcementBar.textColor,
          }}
        >
          {form.announcementBar.text || 'Announcement text preview'}
        </div>

        <div className="space-y-3">
          <div>
            <label className={LabelClass}>Announcement Text</label>
            <input
              value={form.announcementBar.text}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  announcementBar: { ...f.announcementBar, text: e.target.value },
                }))
              }
              className={InputClass}
              placeholder="Free shipping on orders above ₹999"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LabelClass}>Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.announcementBar.bgColor}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      announcementBar: { ...f.announcementBar, bgColor: e.target.value },
                    }))
                  }
                  className="w-10 h-9 rounded cursor-pointer bg-transparent border-0"
                />
                <input
                  value={form.announcementBar.bgColor}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      announcementBar: { ...f.announcementBar, bgColor: e.target.value },
                    }))
                  }
                  className={`${InputClass} flex-1`}
                  placeholder="#C9A84C"
                />
              </div>
            </div>
            <div>
              <label className={LabelClass}>Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.announcementBar.textColor}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      announcementBar: { ...f.announcementBar, textColor: e.target.value },
                    }))
                  }
                  className="w-10 h-9 rounded cursor-pointer bg-transparent border-0"
                />
                <input
                  value={form.announcementBar.textColor}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      announcementBar: { ...f.announcementBar, textColor: e.target.value },
                    }))
                  }
                  className={`${InputClass} flex-1`}
                  placeholder="#1A1612"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-[#1A1612] border border-[#C9A84C]/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-mono text-[#C9A84C] tracking-widest">HERO BANNER</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.heroBanner.isActive}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  heroBanner: { ...f.heroBanner, isActive: e.target.checked },
                }))
              }
              className="accent-[#C9A84C] w-4 h-4"
            />
            <span className="text-xs text-[#F5F0E8]/50 font-mono">Active</span>
          </label>
        </div>

        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className={LabelClass}>Banner Image</label>
            <div
              className="border-2 border-dashed border-[#C9A84C]/20 rounded-xl overflow-hidden cursor-pointer hover:border-[#C9A84C]/40 transition-colors"
              onClick={() => document.getElementById('banner-upload')?.click()}
            >
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              />
              {form.heroBanner.image ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.heroBanner.image}
                    alt="Hero banner"
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white font-mono text-sm">Click to replace</p>
                  </div>
                </div>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center">
                  <Upload className="w-8 h-8 text-[#C9A84C]/30 mb-2" />
                  <p className="text-sm text-[#F5F0E8]/30 font-mono">
                    {uploading ? 'Uploading...' : 'Click to upload banner image'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className={LabelClass}>Headline</label>
            <input
              value={form.heroBanner.headline}
              onChange={(e) =>
                setForm((f) => ({ ...f, heroBanner: { ...f.heroBanner, headline: e.target.value } }))
              }
              className={InputClass}
              placeholder="WEAR THE CRAFT"
            />
          </div>

          <div>
            <label className={LabelClass}>Subtext</label>
            <input
              value={form.heroBanner.subtext}
              onChange={(e) =>
                setForm((f) => ({ ...f, heroBanner: { ...f.heroBanner, subtext: e.target.value } }))
              }
              className={InputClass}
              placeholder="Old Loom — Embroidery Redefined"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LabelClass}>CTA Button Text</label>
              <input
                value={form.heroBanner.ctaText}
                onChange={(e) =>
                  setForm((f) => ({ ...f, heroBanner: { ...f.heroBanner, ctaText: e.target.value } }))
                }
                className={InputClass}
                placeholder="Explore Collection"
              />
            </div>
            <div>
              <label className={LabelClass}>CTA Link</label>
              <input
                value={form.heroBanner.ctaLink}
                onChange={(e) =>
                  setForm((f) => ({ ...f, heroBanner: { ...f.heroBanner, ctaLink: e.target.value } }))
                }
                className={InputClass}
                placeholder="/collections/all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const InputClass = 'w-full bg-[#0F0D0B] border border-[#C9A84C]/10 rounded-lg px-3 py-2 text-sm text-[#F5F0E8] font-mono placeholder:text-[#F5F0E8]/20 focus:outline-none focus:border-[#C9A84C]/30 transition-colors';
const LabelClass = 'block text-xs text-[#F5F0E8]/40 font-mono uppercase tracking-widest mb-1.5';
