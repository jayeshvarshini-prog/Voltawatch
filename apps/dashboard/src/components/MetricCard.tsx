import React from 'react';

interface Props {
  title: string;
  value: string;
  unit?: string;
  icon?: string;
  color?: string;
  subtitle?: string;
}

export function MetricCard({ title, value, unit, icon, color = '#60a5fa', subtitle }: Props) {
  return (
    <div className="metric-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        {icon && <span style={{ fontSize: '20px' }}>{icon}</span>}
        <span style={{ fontSize: '12px', color: '#a0aec0', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '28px', fontWeight: 700, color }}>{value}</span>
        {unit && <span style={{ fontSize: '14px', color: '#718096' }}>{unit}</span>}
      </div>
      {subtitle && (
        <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>{subtitle}</div>
      )}
    </div>
  );
}
