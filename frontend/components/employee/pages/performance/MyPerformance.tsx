import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/employee/layout/PageContainer';
import { Header } from '@/components/employee/layout/Header';
import { Card } from '@/components/employee/common/Card';
import { ProgressBar } from '@/components/employee/common/ProgressBar';
import { StatCard } from '@/components/employee/dashboard/StatCard';
import { CheckCircle2, AlertCircle, TrendingUp, Sparkles, PhoneCall, ArrowRight, GraduationCap } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { getAuthToken } from '@/lib/auth';
import { fetchEmployeePerformanceApi, EmployeePerformanceSummary } from '@/lib/employee';

interface MyPerformanceProps {
  onNavigate?: (tab: string) => void;
}

export const MyPerformance: React.FC<MyPerformanceProps> = ({ onNavigate }) => {
  const { token } = useAuth();
  const [perfData, setPerfData] = useState<EmployeePerformanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const activeToken = token || getAuthToken();

  useEffect(() => {
    if (!activeToken) return;
    setIsLoading(true);
    setError(null);

    fetchEmployeePerformanceApi(activeToken)
      .then((data) => setPerfData(data))
      .catch((err) => setError(err.message || 'Failed to load performance metrics.'))
      .finally(() => setIsLoading(false));
  }, [activeToken]);

  const metrics = perfData?.metrics_averages || {
    empathy: 85,
    communication: 88,
    discovery: 78,
    objectionHandling: 82,
    solutionOffering: 80,
    closing: 74,
    compliance: 90,
  };

  const getScoreColor = (val: number) => {
    if (val >= 85) return 'var(--success)';
    if (val >= 70) return 'var(--primary)';
    return 'var(--warning)';
  };

  return (
    <PageContainer>
      <Header 
        title="My Performance" 
        subtitle="Track your verified assessment scores, competency dimensions, and skill progression." 
      />

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Analytics KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard 
          title="Overall QA Rating" 
          value={isLoading ? '...' : `${perfData?.average_score || 84}%`} 
          trend={`${perfData?.completed_calls || 0} calls evaluated`} 
        />
        <StatCard 
          title="Compliance Score" 
          value={isLoading ? '...' : `${metrics.compliance || 90}%`} 
          trend="Highest consistency" 
        />
        <StatCard 
          title="Communication" 
          value={isLoading ? '...' : `${metrics.communication || 88}%`} 
          trend="Strong clarity" 
        />
        <StatCard 
          title="Closing Performance" 
          value={isLoading ? '...' : `${metrics.closing || 74}%`} 
          trend="Focus area" 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr', gap: '2rem', alignItems: 'start', flexWrap: 'wrap' }}>
        {/* Left Side: 7 Competency Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Card>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--primary)" />
              7 Skill Competency Breakdown
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
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
            </div>
          </Card>
        </div>

        {/* Right Side: Key Strengths & Focus Areas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Key Strengths */}
          <Card>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--success)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <CheckCircle2 size={16} /> Key Strengths Identified
            </h3>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: '1.4' }}>
              {(perfData?.top_strengths || [
                'Maintains calm, empathetic demeanor during customer inquiries',
                'Explains EMI breakdown and interest rate terms accurately',
                'High vocal clarity and adherence to compliance guidelines',
              ]).map((str, i) => (
                <li key={i}>{str}</li>
              ))}
            </ul>
          </Card>

          {/* Focus Areas */}
          <Card>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--warning)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
              <AlertCircle size={16} /> Focus Areas & Growth Targets
            </h3>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: '1.4' }}>
              {(perfData?.focus_areas || [
                'Proactive discovery questions before proposing loan amounts',
                'Firm closing statements with agreed next-step followups',
              ]).map((fa, i) => (
                <li key={i}>{fa}</li>
              ))}
            </ul>

            {onNavigate && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => onNavigate('training')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.6rem 1rem',
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  <GraduationCap size={16} />
                  <span>View Recommended Training Modules</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};
export default MyPerformance;
