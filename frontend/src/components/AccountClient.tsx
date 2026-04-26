'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useMe, useUpdateMe, useOrders, useWishlist, useAddresses } from '@/hooks/useUser';
import { OrderTimeline } from './ui/OrderTimeline';
import { EmptyState } from './ui/EmptyState';
import { AddressForm } from './ui/AddressForm';
import { ProductCard } from './ui/ProductCard';

export function AccountClient({ user: initialUser }: { user: any }) {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'addresses'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const { data: user = initialUser, isLoading: userLoading } = useMe();
  const updateMe = useUpdateMe();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { wishlist, isLoading: wishlistLoading, removeFromWishlist } = useWishlist();
  const { addresses, isLoading: addressesLoading, addAddress, updateAddress, deleteAddress } = useAddresses();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
    toast.success('Logged out');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'oldloom_avatars'); // Replace with your actual preset

    toast.loading('Uploading avatar...');
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      updateMe.mutate({ avatar: data.secure_url });
      toast.dismiss();
    } catch (err) {
      toast.error('Upload failed');
      toast.dismiss();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', paddingTop: '6rem', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--section-px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', borderBottom: '1px solid rgba(201,168,76,0.1)', paddingBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--cream)', fontWeight: 300 }}>My Account</h1>
            <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              Welcome back, {user.name.split(' ')[0]}
            </p>
          </div>
          <button onClick={handleLogout} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Logout
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '4rem' }}>
          {/* Navigation */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {['profile', 'orders', 'wishlist', 'addresses'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                style={{
                  textAlign: 'left',
                  padding: '1.25rem',
                  background: activeTab === tab ? 'rgba(201,168,76,0.05)' : 'transparent',
                  border: 'none',
                  borderLeft: `2px solid ${activeTab === tab ? 'var(--gold)' : 'transparent'}`,
                  color: activeTab === tab ? 'var(--gold)' : 'var(--cream-50)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  fontFamily: 'var(--font-body)',
                  textTransform: 'uppercase',
                  fontSize: '0.8rem',
                  letterSpacing: '0.1em'
                }}
              >
                {tab}
              </button>
            ))}
          </aside>

          {/* Tab Content */}
          <main style={{ minHeight: '500px' }}>
            {activeTab === 'profile' && (
              <div style={{ maxWidth: '600px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
                  <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(201,168,76,0.1)', border: '2px solid var(--gold)' }}>
                      {user.avatar ? (
                        <Image src={user.avatar} alt={user.name} width={100} height={100} style={{ objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--gold)', fontWeight: 300 }}>
                          {user.name[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <label style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--gold)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--dark)' }}>
                      <input type="file" hidden onChange={handleAvatarUpload} accept="image/*" />
                      <span style={{ fontSize: '1rem' }}>📷</span>
                    </label>
                  </div>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--cream)', fontWeight: 300 }}>{user.name}</h2>
                    <p style={{ color: 'var(--cream-50)', fontSize: '0.9rem' }}>{user.email}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '2rem' }}>
                  <div style={{ background: 'rgba(61,43,31,0.2)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Personal Details</h3>
                      {!isEditingProfile && <button onClick={() => setIsEditingProfile(true)} style={{ background: 'none', border: 'none', color: 'var(--cream-50)', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}>Edit</button>}
                    </div>

                    {isEditingProfile ? (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const data = new FormData(e.currentTarget);
                        updateMe.mutate({ name: data.get('name'), phone: data.get('phone') });
                        setIsEditingProfile(false);
                      }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input name="name" defaultValue={user.name} placeholder="Full Name" style={{ width: '100%', padding: '0.8rem', background: 'rgba(26,22,18,0.5)', border: '1px solid var(--gold)', color: 'var(--cream)', borderRadius: '4px' }} />
                        <input name="phone" defaultValue={user.phone} placeholder="Phone Number" style={{ width: '100%', padding: '0.8rem', background: 'rgba(26,22,18,0.5)', border: '1px solid var(--gold)', color: 'var(--cream)', borderRadius: '4px' }} />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <button type="button" onClick={() => setIsEditingProfile(false)} style={{ flex: 1, padding: '0.5rem', background: 'transparent', border: '1px solid var(--cream-50)', color: 'var(--cream)' }}>Cancel</button>
                          <button type="submit" style={{ flex: 1, padding: '0.5rem', background: 'var(--gold)', color: 'var(--dark)' }}>Save</button>
                        </div>
                      </form>
                    ) : (
                      <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                          <p style={{ fontSize: '0.65rem', color: 'var(--cream-50)', textTransform: 'uppercase' }}>Phone</p>
                          <p style={{ color: 'var(--cream)', fontSize: '0.9rem' }}>{user.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.65rem', color: 'var(--cream-50)', textTransform: 'uppercase' }}>Store Credit</p>
                          <p style={{ color: 'var(--gold)', fontSize: '1.1rem', fontWeight: 600 }}>₹{user.storeCredit || 0}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {ordersLoading ? <div style={{ color: 'var(--cream-50)' }}>Loading history...</div> : 
                 orders.length === 0 ? <EmptyState title="No orders yet" description="Your orders will appear here once you make a purchase." ctaText="Explore Collections" ctaHref="/collections/men" /> : (
                  orders.map((order: any) => (
                    <div key={order._id} style={{ background: 'rgba(61,43,31,0.2)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ padding: '1.5rem', background: 'rgba(201,168,76,0.03)', borderBottom: '1px solid rgba(201,168,76,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontSize: '0.7rem', color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>#{order.razorpayOrderId.slice(-8)}</p>
                          <p style={{ fontSize: '0.6rem', color: 'var(--cream-50)' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ color: 'var(--cream)', fontSize: '0.9rem', fontWeight: 600 }}>₹{order.total.toLocaleString('en-IN')}</p>
                          <p style={{ fontSize: '0.6rem', color: order.paymentStatus === 'paid' ? '#34A853' : 'var(--rust)', textTransform: 'uppercase' }}>{order.paymentStatus}</p>
                        </div>
                      </div>
                      <div style={{ padding: '1.5rem' }}>
                        <OrderTimeline status={order.fulfilmentStatus} updatedAt={order.updatedAt} />
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                          {order.items.map((item: any) => (
                            <div key={item.sku} style={{ width: '60px', height: '80px', position: 'relative', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                              <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                {wishlistLoading ? <div style={{ color: 'var(--cream-50)' }}>Loading favorites...</div> :
                 wishlist.length === 0 ? <EmptyState icon="♥" title="Wishlist is empty" description="Save items you love and they will appear here." ctaText="Start Shopping" ctaHref="/collections/men" /> : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2rem' }}>
                    {wishlist.map((product: any) => (
                      <div key={product._id} style={{ position: 'relative' }}>
                        <ProductCard product={product} />
                        <button 
                          onClick={() => removeFromWishlist(product._id)}
                          style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(26,22,18,0.8)', border: 'none', color: 'var(--rust)', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div>
                {isAddingAddress ? (
                  <div style={{ maxWidth: '600px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--cream)', marginBottom: '2rem' }}>Add New Address</h3>
                    <AddressForm 
                      onCancel={() => setIsAddingAddress(false)} 
                      onSubmit={(data) => {
                        addAddress(data);
                        setIsAddingAddress(false);
                      }}
                    />
                  </div>
                ) : editingAddressId ? (
                  <div style={{ maxWidth: '600px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--cream)', marginBottom: '2rem' }}>Edit Address</h3>
                    <AddressForm 
                      initialData={addresses.find((a: any) => a._id === editingAddressId)}
                      onCancel={() => setEditingAddressId(null)} 
                      onSubmit={(data) => {
                        updateAddress({ id: editingAddressId, address: data });
                        setEditingAddressId(null);
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <button 
                      onClick={() => setIsAddingAddress(true)}
                      style={{ height: '200px', background: 'transparent', border: '2px dashed rgba(201,168,76,0.2)', color: 'var(--gold)', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', transition: 'all 0.3s' }}
                    >
                      <span style={{ fontSize: '2rem' }}>+</span>
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Add New Address</span>
                    </button>
                    {addresses.map((addr: any) => (
                      <div key={addr._id} style={{ height: '200px', background: 'rgba(61,43,31,0.2)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '8px', padding: '1.5rem', position: 'relative' }}>
                        {addr.isDefault && <span style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', fontSize: '0.6rem', color: 'var(--gold)', border: '1px solid var(--gold)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Default</span>}
                        <h4 style={{ color: 'var(--cream)', fontSize: '1rem', marginBottom: '0.5rem' }}>{addr.label}</h4>
                        <p style={{ color: 'var(--cream-50)', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                          {addr.name}<br/>
                          {addr.addressLine1}, {addr.city}<br/>
                          {addr.state} - {addr.pincode}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <button onClick={() => setEditingAddressId(addr._id)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>Edit</button>
                          <button onClick={() => deleteAddress(addr._id)} style={{ background: 'none', border: 'none', color: 'var(--rust)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
