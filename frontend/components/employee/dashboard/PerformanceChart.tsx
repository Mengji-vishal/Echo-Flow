import React from 'react';
import { Card } from '../common/Card';

export const PerformanceChart: React.FC = () => {
  // SVG Chart Dimensions
  const width = 500;
  const height = 150;
  const padding = 20;

  // Chart data W1 -> W6
  const data = [72, 75, 78, 84, 82, 87];
  
  // Calculate point coordinates
  const points = data.map((val, index) => {
    const x = padding + (index * (width - padding * 2)) / (data.length - 1);
    const y = height - padding - ((val - 60) * (height - padding * 2)) / (100 - 60); // range 60 to 100
    return { x, y, score: val, label: `W${index + 1}` };
  });

  // Construct path coordinate string
  const pathD = points.reduce((acc, pt, index) => {
    return acc + `${index === 0 ? 'M' : 'L'} ${pt.x} ${pt.y} `;
  }, '');

  // Construct area coordinate string under the curve
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Your Progress</h3>
      
      <div style={{ position: 'relative', width: '100%', height: '180px', display: 'flex', flexDirection: 'column' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '140px' }}>
          <defs>
            {/* Smooth linear gradient under the line */}
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border)" strokeDasharray="4 4" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="var(--border)" strokeDasharray="4 4" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border)" />

          {/* Area under line */}
          <path d={areaD} fill="url(#chartGrad)" />

          {/* Core connection Line */}
          <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data nodes */}
          {points.map((pt, i) => (
            <g key={i}>
              <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke="var(--primary)" strokeWidth="3" style={{ cursor: 'pointer' }} />
              {/* Score text directly above the node */}
              <text x={pt.x} y={pt.y - 10} textAnchor="middle" style={{ fontSize: '10px', fontWeight: 'bold', fill: 'var(--text-primary)', fontFamily: 'inherit' }}>
                {pt.score}%
              </text>
              {/* Bottom label */}
              <text x={pt.x} y={height - 2} textAnchor="middle" style={{ fontSize: '10px', fill: 'var(--text-muted)', fontFamily: 'inherit' }}>
                {pt.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </Card>
  );
};
