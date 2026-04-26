'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import { useAddresses } from '@/hooks/useUser';

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

const addressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  pincode: z.string().length(6, 'Pincode must be 6 digits'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  saveAddress: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

export function CheckoutClient() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, total, clearCart, itemCount } = useCartStore();
  const { addresses, isLoading: addressesLoading } = useAddresses();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = total();
  const delivery = subtotal > 5000 ? 0 : 150;
  const grandTotal = subtotal + delivery - discount;
  const gst = Math.round(grandTotal * 0.18);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  const [addressData, setAddressData] = useState<AddressFormData | null>(null);

  // Redirect if guest and trying to checkout (backend requires auth)
  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Please login to continue');
      router.push(`/login?callbackUrl=/checkout`);
    }
  }, [status, router]);

  useEffect(() => {
    if (items.length === 0 && step !== 3) {
      router.push('/');
    }
  }, [items, router, step]);

  // Autofill address if available
  useEffect(() => {
    if (addresses.length > 0) {
      const def = addresses.find((a: any) => a.isDefault) || addresses[0];
      reset({
        name: def.name,
        email: session?.user?.email || '',
        phone: def.phone,
        pincode: def.pincode,
        city: def.city,
        state: def.state,
        addressLine1: def.addressLine1,
        addressLine2: def.addressLine2,
      });
    } else if (session?.user) {
      setValue('name', session.user.name || '');
      setValue('email', session.user.email || '');
    }
  }, [addresses, session, reset, setValue]);

  const onAddressSubmit = (data: AddressFormData) => {
    setAddressData(data);
    setStep(2);
  };

  const handleApplyCoupon = async () => {
    if (!coupon) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/coupons/validate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}` 
        },
        body: JSON.stringify({ code: coupon, orderValue: subtotal })
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setDiscount(data.discountAmount);
        toast.success(`Coupon applied! Saved ₹${data.discountAmount}`);
      } else {
        toast.error(data.message || 'Invalid coupon');
        setDiscount(0);
      }
    } catch (e) {
      toast.error('Error validating coupon');
    }
  };

  const handlePayment = async () => {
    if (!addressData) return;
    setIsProcessing(true);
    setStep(3);

    try {
      // 1. Create Razorpay Order on Backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/orders/create-razorpay-order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        },
        body: JSON.stringify({ total: grandTotal })
      });

      const data = await res.json();
      if (data.status !== 'ok') {
        throw new Error(data.message || 'Failed to create order');
      }

      // 2. Initialize Razorpay
      const options = {
        key: data.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'Old Loom',
        description: 'Premium Embroidered Clothing',
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/orders/verify-payment`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.user?.accessToken}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                address: addressData,
                items,
                subtotal,
                delivery,
                discount,
                couponCode: coupon,
                total: grandTotal
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.status === 'ok') {
              clearCart();
              router.push('/order-success');
            } else {
              toast.error('Payment verification failed');
              setStep(2);
            }
          } catch (e) {
            toast.error('Error verifying payment');
            setStep(2);
          }
        },
        prefill: {
          name: addressData.name,
          email: addressData.email,
          contact: addressData.phone
        },
        theme: {
          color: '#C9A84C'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(response.error.description);
        setStep(2);
      });
      rzp.open();
    } catch (e: any) {
      toast.error(e.message || 'Payment initiation failed');
      setStep(2);
    } finally {
      setIsProcessing(false);
    }
  };

  if (status === 'loading') return (
    <div style={{ height: '100vh', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--gold)', fontFamily: 'monospace' }}>SECURE SESSION INITIALIZING…</p>
    </div>
  );

  if (items.length === 0 && step !== 3) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', paddingTop: '6rem', paddingBottom: '4rem' }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 var(--section-px)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--cream)', marginBottom: '2rem', fontWeight: 300 }}>
          Checkout
        </h1>

        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
          {/* Left Column - Steps */}
          <div style={{ flex: '1 1 500px' }}>
            
            {/* Step 1: Address */}
            <div style={{ marginBottom: '2rem', opacity: step === 1 ? 1 : 0.6, transition: 'opacity 0.3s' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold)', borderBottom: '1px solid rgba(201,168,76,0.2)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                1. Delivery Details
              </h2>
              {step === 1 ? (
                <form onSubmit={handleSubmit(onAddressSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {addresses.length > 0 && (
                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                      {addresses.map((a: any) => (
                        <button
                          key={a._id}
                          type="button"
                          onClick={() => reset({
                            name: a.name,
                            email: session?.user?.email || '',
                            phone: a.phone,
                            pincode: a.pincode,
                            city: a.city,
                            state: a.state,
                            addressLine1: a.addressLine1,
                            addressLine2: a.addressLine2,
                          })}
                          style={{
                            flexShrink: 0,
                            padding: '1rem',
                            background: 'rgba(201,168,76,0.05)',
                            border: '1px solid rgba(201,168,76,0.2)',
                            borderRadius: '8px',
                            color: 'var(--cream-50)',
                            textAlign: 'left',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            minWidth: '150px'
                          }}
                        >
                          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{a.label}</span><br/>
                          {a.city}, {a.pincode}
                        </button>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <input {...register('name')} placeholder="Full Name" style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }} />
                      {errors.name && <span style={{ color: 'var(--rust)', fontSize: '0.7rem' }}>{errors.name.message}</span>}
                    </div>
                    <div>
                      <input {...register('phone')} placeholder="Phone Number" style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }} />
                      {errors.phone && <span style={{ color: 'var(--rust)', fontSize: '0.7rem' }}>{errors.phone.message}</span>}
                    </div>
                  </div>
                  <div>
                    <input {...register('email')} placeholder="Email Address" disabled style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.5)', border: '1px solid rgba(201,168,76,0.1)', color: 'var(--cream-50)', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <input {...register('addressLine1')} placeholder="Address Line 1" style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }} />
                    {errors.addressLine1 && <span style={{ color: 'var(--rust)', fontSize: '0.7rem' }}>{errors.addressLine1.message}</span>}
                  </div>
                  <div>
                    <input {...register('addressLine2')} placeholder="Address Line 2 (Optional)" style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <input {...register('pincode')} placeholder="Pincode" style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }} />
                      {errors.pincode && <span style={{ color: 'var(--rust)', fontSize: '0.7rem' }}>{errors.pincode.message}</span>}
                    </div>
                    <div>
                      <input {...register('city')} placeholder="City" style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }} />
                      {errors.city && <span style={{ color: 'var(--rust)', fontSize: '0.7rem' }}>{errors.city.message}</span>}
                    </div>
                    <div>
                      <input {...register('state')} placeholder="State" style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }} />
                      {errors.state && <span style={{ color: 'var(--rust)', fontSize: '0.7rem' }}>{errors.state.message}</span>}
                    </div>
                  </div>
                  <button type="submit" style={{ padding: '1rem', background: 'var(--gold)', color: 'var(--dark)', border: 'none', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, cursor: 'pointer', marginTop: '1rem' }}>
                    Continue to Order Review
                  </button>
                </form>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-body)', color: 'var(--cream-50)', lineHeight: 1.6 }}>
                    {addressData?.name}<br/>
                    {addressData?.addressLine1}, {addressData?.city}, {addressData?.state} {addressData?.pincode}
                  </p>
                  {step === 2 && <button onClick={() => setStep(1)} style={{ background: 'none', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>}
                </div>
              )}
            </div>

            {/* Step 2: Review */}
            <div style={{ marginBottom: '2rem', opacity: step >= 2 ? 1 : 0.4, transition: 'opacity 0.3s' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold)', borderBottom: '1px solid rgba(201,168,76,0.2)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                2. Order Review
              </h2>
              {step === 2 && (
                <div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Discount Code" style={{ flex: 1, padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }} />
                    <button onClick={handleApplyCoupon} style={{ padding: '0 1.5rem', background: 'rgba(201,168,76,0.1)', color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: '4px', cursor: 'pointer' }}>Apply</button>
                  </div>
                  <button onClick={handlePayment} disabled={isProcessing} style={{ width: '100%', padding: '1rem', background: 'var(--gold)', color: 'var(--dark)', border: 'none', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, cursor: isProcessing ? 'not-allowed' : 'pointer' }}>
                    {isProcessing ? 'Processing...' : `Pay ₹${grandTotal.toLocaleString('en-IN')}`}
                  </button>
                </div>
              )}
            </div>
            
            {/* Step 3: Payment Indicator */}
            {step === 3 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold)', borderBottom: '1px solid rgba(201,168,76,0.2)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                  3. Payment
                </h2>
                <p style={{ color: 'var(--cream)', background: 'rgba(201,168,76,0.1)', padding: '1rem', borderRadius: '4px', border: '1px solid rgba(201,168,76,0.3)' }}>
                  Please complete the payment in the secure Razorpay window.
                </p>
              </div>
            )}

          </div>

          {/* Right Column - Summary */}
          <div style={{ flex: '1 1 350px', background: 'rgba(61,43,31,0.2)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '8px', padding: '2rem', height: 'fit-content', position: 'sticky', top: '7rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--cream)', marginBottom: '1.5rem' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxHeight: '40vh', overflowY: 'auto' }}>
              {items.map(item => (
                <div key={item.sku} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '60px', height: '80px', position: 'relative', borderRadius: '4px', overflow: 'hidden' }}>
                    <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--cream)' }}>{item.name}</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--cream-50)' }}>{item.color} / {item.size} x {item.quantity}</p>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--gold)' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
            
            <div style={{ borderTop: '1px solid rgba(201,168,76,0.2)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', fontFamily: 'var(--font-body)', color: 'var(--cream-50)', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal ({itemCount()} items)</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#B5451B' }}>
                  <span>Discount</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery</span>
                <span>{delivery === 0 ? 'Free' : `₹${delivery}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>GST (18% inc.)</span>
                <span>₹{gst.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(201,168,76,0.2)', color: 'var(--gold)', fontSize: '1.5rem', fontWeight: 600 }}>
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
