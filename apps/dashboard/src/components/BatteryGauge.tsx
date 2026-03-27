import React from 'react';

interface Props {
  percentage: number;
  label?: string;
}

export function BatteryGauge({ percentage, label = 'Battery' }: Props) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const color = clamped > 50 ? '#22c55e' : clamped > 20 ? '#f59e0b' : '#ef4444';
  const radius = 60;
  const cx = 80;
  const cy = 80;
  const strokeWidth = 12;
  const circumference = Math.PI * radius; // half circle
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="160" height="100" viewBox="0 0 160 100">
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#2d3748"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
        />
        <text x={cx} y={cy - 10} textAnchor="middle" fill="white" fontSize="22" fontWeight="700">
          {clamped.toFixed(1)}%
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#a0aec0" fontSize="11">
          {label}
        </text>
      </svg>
    </div>
  );
}
