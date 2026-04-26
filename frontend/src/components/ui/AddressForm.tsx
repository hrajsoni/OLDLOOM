'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const addressSchema = z.object({
  label: z.string().min(1, 'Label is required (e.g. Home)'),
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone required'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().length(6, '6-digit pincode'),
  isDefault: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  initialData?: any;
  onSubmit: (data: AddressFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AddressForm({ initialData, onSubmit, onCancel, isLoading }: AddressFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData || { label: 'Home', isDefault: false },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--cream-50)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Label</label>
          <input {...register('label')} placeholder="Home / Work" style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }} />
          {errors.label && <span style={{ color: 'var(--rust)', fontSize: '0.65rem' }}>{errors.label.message}</span>}
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--cream-50)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Receiver Name</label>
          <input {...register('name')} placeholder="Full Name" style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }} />
          {errors.name && <span style={{ color: 'var(--rust)', fontSize: '0.65rem' }}>{errors.name.message}</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--cream-50)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Phone</label>
          <input {...register('phone')} placeholder="10-digit number" style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }} />
          {errors.phone && <span style={{ color: 'var(--rust', fontSize: '0.65rem' }}>{errors.phone.message}</span>}
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--cream-50)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Pincode</label>
          <input {...register('pincode')} placeholder="400001" style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }} />
          {errors.pincode && <span style={{ color: 'var(--rust)', fontSize: '0.65rem' }}>{errors.pincode.message}</span>}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--cream-50)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Address Line 1</label>
        <input {...register('addressLine1')} placeholder="Flat / House No / Street" style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }} />
        {errors.addressLine1 && <span style={{ color: 'var(--rust)', fontSize: '0.65rem' }}>{errors.addressLine1.message}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--cream-50)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>City</label>
          <input {...register('city')} placeholder="Mumbai" style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }} />
          {errors.city && <span style={{ color: 'var(--rust)', fontSize: '0.65rem' }}>{errors.city.message}</span>}
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--cream-50)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>State</label>
          <input {...register('state')} placeholder="Maharashtra" style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }} />
          {errors.state && <span style={{ color: 'var(--rust)', fontSize: '0.65rem' }}>{errors.state.message}</span>}
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', width: 'fit-content' }}>
        <input type="checkbox" {...register('isDefault')} style={{ accentColor: 'var(--gold)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--cream)' }}>Set as default address</span>
      </label>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button type="button" onClick={onCancel} style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: '1px solid rgba(245,240,232,0.2)', color: 'var(--cream)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
        <button type="submit" disabled={isLoading} style={{ flex: 1, padding: '0.8rem', background: 'var(--gold)', border: 'none', color: 'var(--dark)', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>{isLoading ? 'Saving...' : 'Save Address'}</button>
      </div>
    </form>
  );
}
