import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/employee/layout/PageContainer';
import { Header } from '@/components/employee/layout/Header';
import { Card } from '@/components/employee/common/Card';
import { ProgressBar } from '@/components/employee/common/ProgressBar';
import { Badge } from '@/components/employee/common/Badge';
import { TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { getAuthToken } from '@/lib/auth';
import { fetchEmployeePerformanceApi, EmployeePerformanceSummary } from '@/lib/employee';

export const Progress: React.FC = () => {
  const { token } = useAuth();
  const activeToken = token || getAuthToken();

  const [perfData, setPerfData] = useState<EmployeePerformanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!activeToken) return;
    setIsLoading(true);
    fetchEmployeePerformanceApi(activeToken)
      .then((data) => setPerfData(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [activeToken]);

  const metrics = perfData?.metrics_averages || {};
  const recentEvals = perfData?.recent_evaluations || [];
  const evalScores = recentEvals.map((e) => e.score || 0).reverse();

  // Custom SVG path parameters
  const width = 500;
  const height = 150;
  const padding = 20;
  const data = evalScores.length > 0 ? evalScores : [0];

  const points = data.map((val, idx) => {
    const x = padding + (idx * (width - padding * 2)) / (Math.max(data.length - 1, 1));
    const y = height - padding - (val * (height - padding * 2)) / 100;
    return { x, y, val };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return acc + `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y} `;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const getScoreColor = (val: number) => {
    if (val === 0) return 'var(--text-muted)';
    if (val >= 85) return 'var(--success)';
    if (val >= 70) return 'var(--primary)';
    return 'var(--warning)';
  };

  return (
    <PageContainer>
      <Header 
        title="Progress & Skills" 
        subtitle="Hone your competency levels and view long-term growth analytics from verified assessments." 
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr', gap: '2rem', alignItems: 'start', flexWrap: 'wrap' }}>
        
        {/* Left Column: Progress trend line chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Performance Curve</h3>
              <Badge variant="info">
                {perfData ? `${perfData.completed_calls} Calls Evaluated` : 'Live Progression'}
              </Badge>
            </div>

            {evalScores.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No historical assessment data available yet.
              </div>
            ) : (
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
                      Assessment {i + 1}
                    </text>
                  </g>
                ))}
              </svg>
            )}
          </Card>

          {/* Strengths & Focus Highlights */}
          <Card>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Verified Strengths</h3>
            {perfData?.top_strengths && perfData.top_strengths.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {perfData.top_strengths.map((str, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>
                      <CheckCircle2 size={12} color="white" />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', margin: 0 }}>{str}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                No strengths identified yet. Assessments will record strengths here.
              </p>
            )}
          </Card>
        </div>

        {/* Right Column: Skill progression values */}
        <Card>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--primary)" />
            Competency Growth
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {Object.entries(metrics).map(([key, val]) => (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span style={{ fontWeight: 700, color: getScoreColor(val) }}>{val}%</span>
                </div>
                <ProgressBar progress={val} fillColor={getScoreColor(val)} />
              </div>
            ))}
            {Object.keys(metrics).length === 0 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                No skill metrics recorded yet.
              </p>
            )}
          </div>
        </Card>

      </div>
    </PageContainer>
  );
};
export default Progress;
