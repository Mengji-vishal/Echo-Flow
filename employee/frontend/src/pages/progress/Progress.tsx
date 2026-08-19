import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Badge } from '../../components/common/Badge';
import { TrendingUp, CheckCircle2 } from 'lucide-react';

export const Progress: React.FC = () => {
  const skillProgress = [
    { name: 'Empathy', val: 92, diff: '+8%' },
    { name: 'Communication', val: 86, diff: '+6%' },
    { name: 'Discovery', val: 78, diff: '+5%' },
    { name: 'Objection Handling', val: 64, diff: '+12%' },
    { name: 'Closing', val: 74, diff: '+7%' }
  ];

  // Custom SVG path parameters
  const width = 500;
  const height = 150;
  const padding = 20;
  const data = [68, 74, 80, 84]; // W1 -> W4

  const points = data.map((val, idx) => {
    const x = padding + (idx * (width - padding * 2)) / (data.length - 1);
    const y = height - padding - ((val - 60) * (height - padding * 2)) / (100 - 60);
    return { x, y, val };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return acc + `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y} `;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <PageContainer>
      <Header 
        title="Progress & Skills" 
        subtitle="Hone your competency levels and view long-term growth analytics." 
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr', gap: '2rem', alignItems: 'start', flexWrap: 'wrap' }}>
        
        {/* Left Column: Progress trend line chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Performance Curve</h3>
              <Badge variant="success">Overall Improvement: +16%</Badge>
            </div>
            
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '140px' }}>
              <defs>
                <linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border)" strokeDasharray="4 4" />
              <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="var(--border)" strokeDasharray="4 4" />
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border)" />

              <path d={areaD} fill="url(#progGrad)" />
              <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="3" />

              {points.map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke="var(--primary)" strokeWidth="3" />
                  <text x={pt.x} y={pt.y - 10} textAnchor="middle" style={{ fontSize: '10px', fontWeight: 'bold', fill: 'var(--text-primary)' }}>
                    {pt.val}%
                  </text>
                  <text x={pt.x} y={height - 2} textAnchor="middle" style={{ fontSize: '10px', fill: 'var(--text-muted)' }}>
                    Week {i + 1}
                  </text>
                </g>
              ))}
            </svg>
          </Card>

          {/* Core Milestones */}
          <Card>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Learning Milestones</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '15px', bottom: '15px', left: '11px', width: '2px', backgroundColor: 'var(--border)' }} />
              
              <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={12} color="white" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>FCRA Compliance Certified</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed August 12, 2026</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={12} color="white" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Objection De-escalation Certified</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed August 18, 2026</p>
                </div>
              </div>
            </div>
          </Card>

        </div>

        {/* Right Column: Skill progression values */}
        <Card>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--primary)" />
            Competency Growth
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {skillProgress.map(sk => (
              <div key={sk.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{sk.name}</span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{sk.val}%</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)' }}>({sk.diff})</span>
                  </div>
                </div>
                <ProgressBar progress={sk.val} fillColor="var(--primary)" />
              </div>
            ))}
          </div>
        </Card>

      </div>
    </PageContainer>
  );
};
export default Progress;
