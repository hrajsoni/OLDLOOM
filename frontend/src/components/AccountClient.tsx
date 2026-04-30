'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useMe, useUpdateMe, useOrders, useWishlist, useAddresses } from '@/hooks/useUser';
import { OrderTimeline } from './ui/OrderTimeline';
import { EmptyState } from './ui/EmptyState';
import { AddressForm } from './ui/AddressForm';

type Tab = 'profile' | 'orders' | 'wishlist' | 'addresses';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'profile',   label: 'Profile',    icon: '👤' },
  { id: 'orders',    label: 'Orders',     icon: '📦' },
  { id: 'wishlist',  label: 'Wishlist',   icon: '♥' },
  { id: 'addresses', label: 'Addresses',  icon: '📍' },
];

const INPUT = {
  width: '100%', padding: '0.8rem 1rem',
  background: 'rgba(61,43,31,0.3)',
  border: '1px solid rgba(201,168,76,0.2)',
  color: 'var(--cream)', borderRadius: '6px',
  fontFamily: 'var(--font-body)', fontSize: '0.85rem', outline: 'none',
} as React.CSSProperties;

export function AccountClient({ user: _initial }: { user: any }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [tab, setTab] = useState<Tab>('profile');
  const [editingProfile, setEditingProfile] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login?callbackUrl=/account');
  }, [status, router]);

  const { data: user, isLoading: userLoading } = useMe();
  const updateMe = useUpdateMe();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { wishlist, isLoading: wishlistLoading, removeFromWishlist } = useWishlist();
  const { addresses, isLoading: addressesLoading, addAddress, updateAddress, deleteAddress } = useAddresses();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.next.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${(session as any)?.accessToken}` },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      const data = await res.json();
      if (res.ok) { toast.success('Password changed'); setChangingPassword(false); setPwForm({ current: '', next: '', confirm: '' }); }
      else toast.error(data.message || 'Failed');
    } catch { toast.error('Error changing password'); }
  };

  if (status === 'loading' || userLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', fontSize: '0.7rem' }}>LOADING…</p>
      </div>
    );
  }

  if (!session?.user) return null;

  const displayUser = user || session.user;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', paddingTop: '5rem', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 var(--section-px)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', borderBottom: '1px solid rgba(201,168,76,0.1)', paddingBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3rem)', color: 'var(--cream)', fontWeight: 300 }}>My Account</h1>
            <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
              Welcome back, {displayUser.name?.split(' ')[0]}
            </p>
          </div>
          <button onClick={handleLogout} style={{ padding: '0.6rem 1.4rem', background: 'transparent', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Sign Out
          </button>
        </div>

        {/* Mobile Tabs (horizontal scroll) */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '2.5rem', scrollbarWidth: 'none' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flexShrink: 0, padding: '0.6rem 1.2rem', background: tab === t.id ? 'rgba(201,168,76,0.1)' : 'transparent',
              border: tab === t.id ? '1px solid rgba(201,168,76,0.5)' : '1px solid rgba(201,168,76,0.15)',
              borderRadius: '100px', color: tab === t.id ? 'var(--gold)' : 'var(--cream-50)',
              cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
              letterSpacing: '0.1em', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* ─── PROFILE TAB ─── */}
        {tab === 'profile' && (
          <div style={{ maxWidth: '560px' }}>
            {/* Avatar + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(201,168,76,0.1)', border: '2px solid var(--gold)' }}>
                  {displayUser.image || displayUser.avatar ? (
                    <Image src={displayUser.image || displayUser.avatar} alt={displayUser.name} width={80} height={80} style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'var(--gold)' }}>
                      {displayUser.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--cream)', fontWeight: 300 }}>{displayUser.name}</h2>
                <p style={{ color: 'var(--cream-50)', fontSize: '0.8rem' }}>{displayUser.email}</p>
              </div>
            </div>

            {/* Personal Details Card */}
            <div style={{ background: 'rgba(61,43,31,0.2)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <h3 style={{ fontSize: '0.7rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Personal Details</h3>
                {!editingProfile && <button onClick={() => setEditingProfile(true)} style={{ background: 'none', border: 'none', color: 'var(--cream-50)', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}>Edit</button>}
              </div>
              {editingProfile ? (
                <form onSubmit={(e) => { e.preventDefault(); const d = new FormData(e.currentTarget); updateMe.mutate({ name: d.get('name'), phone: d.get('phone') }); setEditingProfile(false); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input name="name" defaultValue={displayUser.name} placeholder="Full Name" style={INPUT} />
                  <input name="phone" defaultValue={user?.phone} placeholder="Phone Number" style={INPUT} />
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" onClick={() => setEditingProfile(false)} style={{ flex: 1, padding: '0.6rem', background: 'transparent', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream-50)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Cancel</button>
                    <button type="submit" style={{ flex: 1, padding: '0.6rem', background: 'var(--gold)', color: 'var(--dark)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Save</button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'grid', gap: '0.8rem' }}>
                  <div><p style={{ fontSize: '0.6rem', color: 'var(--cream-50)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Phone</p><p style={{ color: 'var(--cream)', fontSize: '0.9rem' }}>{user?.phone || '—'}</p></div>
                  <div><p style={{ fontSize: '0.6rem', color: 'var(--cream-50)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Store Credit</p><p style={{ color: 'var(--gold)', fontSize: '1rem', fontWeight: 600 }}>₹{user?.storeCredit || 0}</p></div>
                </div>
              )}
            </div>

            {/* Change Password Card */}
            <div style={{ background: 'rgba(61,43,31,0.2)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: changingPassword ? '1.2rem' : 0 }}>
                <h3 style={{ fontSize: '0.7rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Password</h3>
                <button onClick={() => setChangingPassword(v => !v)} style={{ background: 'none', border: 'none', color: 'var(--cream-50)', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}>{changingPassword ? 'Cancel' : 'Change Password'}</button>
              </div>
              {changingPassword && (
                <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <input type="password" placeholder="Current Password" value={pwForm.current} onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} style={INPUT} />
                  <input type="password" placeholder="New Password" value={pwForm.next} onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} style={INPUT} />
                  <input type="password" placeholder="Confirm New Password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} style={INPUT} />
                  <button type="submit" style={{ padding: '0.7rem', background: 'var(--gold)', color: 'var(--dark)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Update Password</button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ─── ORDERS TAB ─── */}
        {tab === 'orders' && (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {ordersLoading ? (
              <p style={{ color: 'var(--cream-50)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Loading orders…</p>
            ) : orders.length === 0 ? (
              <EmptyState icon="📦" title="No orders yet" description="Your orders will appear here once you make a purchase." ctaText="Explore Collections" ctaHref="/collections/men" />
            ) : orders.map((order: any) => (
              <div key={order._id} style={{ background: 'rgba(61,43,31,0.2)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '1.2rem 1.5rem', background: 'rgba(201,168,76,0.03)', borderBottom: '1px solid rgba(201,168,76,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>#{order.razorpayOrderId?.slice(-8) || order._id?.slice(-8)}</p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--cream-50)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'var(--cream)', fontSize: '1rem', fontWeight: 600 }}>₹{order.total?.toLocaleString('en-IN')}</p>
                    <p style={{ fontSize: '0.6rem', color: order.paymentStatus === 'paid' ? '#34A853' : 'var(--rust)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{order.paymentStatus}</p>
                  </div>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <OrderTimeline status={order.fulfilmentStatus} updatedAt={order.updatedAt} />
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                    {order.items?.map((item: any) => (
                      <div key={item.sku} style={{ width: '56px', height: '72px', position: 'relative', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, background: 'rgba(201,168,76,0.05)' }}>
                        <Image src={item.image || '/placeholder.jpg'} alt={item.name} fill style={{ objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── WISHLIST TAB ─── */}
        {tab === 'wishlist' && (
          <div>
            {wishlistLoading ? (
              <p style={{ color: 'var(--cream-50)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Loading wishlist…</p>
            ) : wishlist.length === 0 ? (
              <EmptyState icon="♥" title="Wishlist is empty" description="Save items you love by tapping the heart on any product." ctaText="Start Shopping" ctaHref="/collections/men" />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
                {wishlist.map((product: any) => (
                  <div key={product._id} style={{ position: 'relative', background: 'rgba(61,43,31,0.3)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(201,168,76,0.1)' }}>
                    <div style={{ aspectRatio: '3/4', position: 'relative' }}>
                      <Image src={product.images?.[0] || '/placeholder.jpg'} alt={product.name} fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '0.75rem' }}>
                      <p style={{ fontFamily: 'var(--font-display)', color: 'var(--cream)', fontSize: '0.9rem' }}>{product.name}</p>
                      <p style={{ color: 'var(--gold)', fontSize: '0.8rem', marginTop: '0.25rem' }}>₹{product.price?.toLocaleString('en-IN')}</p>
                    </div>
                    <button onClick={() => removeFromWishlist(product._id)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(26,22,18,0.8)', border: 'none', color: 'var(--rust)', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── ADDRESSES TAB ─── */}
        {tab === 'addresses' && (
          <div>
            {addingAddress ? (
              <div style={{ maxWidth: '560px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--cream)', marginBottom: '2rem' }}>Add New Address</h3>
                <AddressForm onCancel={() => setAddingAddress(false)} onSubmit={(d: any) => { addAddress(d); setAddingAddress(false); }} />
              </div>
            ) : editingAddressId ? (
              <div style={{ maxWidth: '560px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--cream)', marginBottom: '2rem' }}>Edit Address</h3>
                <AddressForm initialData={addresses.find((a: any) => a._id === editingAddressId)} onCancel={() => setEditingAddressId(null)} onSubmit={(d: any) => { updateAddress({ id: editingAddressId!, address: d }); setEditingAddressId(null); }} />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                <button onClick={() => setAddingAddress(true)} style={{ minHeight: '180px', background: 'transparent', border: '2px dashed rgba(201,168,76,0.2)', color: 'var(--gold)', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', transition: 'border-color 0.2s' }}>
                  <span style={{ fontSize: '2rem' }}>+</span>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>Add Address</span>
                </button>
                {addressesLoading ? null : addresses.map((addr: any) => (
                  <div key={addr._id} style={{ background: 'rgba(61,43,31,0.2)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '8px', padding: '1.5rem', position: 'relative' }}>
                    {addr.isDefault && <span style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '0.55rem', color: 'var(--gold)', border: '1px solid var(--gold)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>Default</span>}
                    <h4 style={{ color: 'var(--cream)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{addr.label || 'Address'}</h4>
                    <p style={{ color: 'var(--cream-50)', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>{addr.name}<br />{addr.addressLine1}, {addr.city}<br />{addr.state} – {addr.pincode}</p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button onClick={() => setEditingAddressId(addr._id)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}>Edit</button>
                      <button onClick={() => deleteAddress(addr._id)} style={{ background: 'none', border: 'none', color: 'var(--rust)', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
