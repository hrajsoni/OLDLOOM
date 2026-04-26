'use client';

interface OrderTimelineProps {
  status: 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  updatedAt: string;
}

export function OrderTimeline({ status, updatedAt }: OrderTimelineProps) {
  const steps = [
    { key: 'placed', label: 'Order Placed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ];

  if (status === 'cancelled') {
    return <div style={{ color: 'var(--rust)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>ORDER CANCELLED</div>;
  }

  const currentIdx = steps.findIndex(s => s.key === status);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '2rem', marginBottom: '2rem' }}>
      {/* Background Line */}
      <div style={{ position: 'absolute', top: '10px', left: '0', right: '0', height: '2px', background: 'rgba(201,168,76,0.1)', zIndex: 0 }} />
      
      {steps.map((step, i) => {
        const isCompleted = i < currentIdx || status === 'delivered';
        const isActive = i === currentIdx;

        return (
          <div key={step.key} style={{ zIndex: 1, textAlign: 'center', flex: 1 }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: isCompleted ? '#34A853' : isActive ? 'var(--gold)' : 'var(--dark)',
              border: `2px solid ${isCompleted ? '#34A853' : 'var(--gold)'}`,
              margin: '0 auto',
              transition: 'all 0.3s'
            }} />
            <p style={{
              fontSize: '0.65rem',
              fontFamily: 'var(--font-mono)',
              marginTop: '0.75rem',
              color: isCompleted || isActive ? 'var(--cream)' : 'var(--cream-50)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {step.label}
            </p>
            {isActive && (
              <p style={{ fontSize: '0.55rem', color: 'var(--gold)', marginTop: '0.25rem' }}>
                {new Date(updatedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
