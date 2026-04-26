'use client';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export function QuantityStepper({ value, onChange, max = 99 }: QuantityStepperProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(245,240,232,0.05)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '4px', width: 'fit-content' }}>
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        style={{ padding: '0.5rem 0.75rem', background: 'none', border: 'none', color: 'var(--cream)', cursor: 'pointer', fontSize: '1.2rem' }}
      >
        −
      </button>
      <span style={{ padding: '0 1rem', color: 'var(--cream)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', minWidth: '40px', textAlign: 'center' }}>
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        style={{ padding: '0.5rem 0.75rem', background: 'none', border: 'none', color: 'var(--cream)', cursor: 'pointer', fontSize: '1.2rem' }}
      >
        +
      </button>
    </div>
  );
}
