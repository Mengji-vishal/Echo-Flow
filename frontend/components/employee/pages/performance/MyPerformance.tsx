import React from 'react';
import { PageContainer } from '@/components/employee/layout/PageContainer';
import { Header } from '@/components/employee/layout/Header';
import { Card } from '@/components/employee/common/Card';
import { ProgressBar } from '@/components/employee/common/ProgressBar';
import { StatCard } from '@/components/employee/dashboard/StatCard';
import { mockUserProgress } from '@shared/api/mockData';
import { CheckCircle2, AlertCircle, ArrowUpRight, TrendingUp } from 'lucide-react';

export const MyPerformance: React.FC = () => {
  const averageScore = Math.round(
    (mockUserProgress.metrics.empathy + 
     mockUserProgress.metrics.listening + 
     mockUserProgress.metrics.productKnowledge + 
     mockUserProgress.metrics.compliance + 
     mockUserProgress.metrics.closing) / 5
  );

  return (
    <PageContainer>
      <Header 
        title="My Performance" 
        subtitle="Track your long-term growth and skill metrics." 
      />

      {/* Analytics KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard title="Average QA Rating" value={`${averageScore}%`} trend="↑ 4% this month" />
        <StatCard title="Empathy Score" value={`${mockUserProgress.metrics.empathy}%`} trend="↑ 8% (Highest)" />
        <StatCard title="Compliance Score" value={`${mockUserProgress.metrics.compliance}%`} trend="Perfect 100% target met" />
        <StatCard title="Closing Score" value={`${mockUserProgress.metrics.closing}%`} trend="↑ 3% opportunities" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr', gap: '2rem', alignItems: 'start', flexWrap: 'wrap' }}>
        
        {/* Left Side: Long-term Skill sliders & Recent Improvements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <Card>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--primary)" />
              Competency Breakdown
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Empathy</span>
                  <span style={{ fontWeight: 700 }}>{mockUserProgress.metrics.empathy}%</span>
                </div>
                <ProgressBar progress={mockUserProgress.metrics.empathy} fillColor="var(--primary)" />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Listening & Discovery</span>
                  <span style={{ fontWeight: 700 }}>{mockUserProgress.metrics.listening}%</span>
                </div>
                <ProgressBar progress={mockUserProgress.metrics.listening} fillColor="var(--primary)" />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Product Knowledge</span>
                  <span style={{ fontWeight: 700 }}>{mockUserProgress.metrics.productKnowledge}%</span>
                </div>
                <ProgressBar progress={mockUserProgress.metrics.productKnowledge} fillColor="var(--primary)" />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Compliance Standards</span>
                  <span style={{ fontWeight: 700 }}>{mockUserProgress.metrics.compliance}%</span>
                </div>
                <ProgressBar progress={mockUserProgress.metrics.compliance} fillColor="var(--success)" />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Closing Strategy</span>
                  <span style={{ fontWeight: 700 }}>{mockUserProgress.metrics.closing}%</span>
                </div>
                <ProgressBar progress={mockUserProgress.metrics.closing} fillColor="var(--accent)" />
              </div>
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Recent Improvements</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ArrowUpRight size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Objection Handling Mastery</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Your average objection responses increased by +12% following practice sessions.</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ArrowUpRight size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Empathy Streaks</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Maintained over 90% empathy ratings on last 3 evaluated renewals.</p>
                </div>
              </div>
            </div>
          </Card>

        </div>

        {/* Right Side: Strengths & Focus Areas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <Card style={{ borderLeft: '4px solid var(--success)', background: 'linear-gradient(90deg, var(--success-light) 0%, rgba(255,255,255,0.0) 100%)' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', fontWeight: 700 }}>
              <CheckCircle2 size={16} /> Strongest Competencies
            </h3>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: '1.4' }}>
              <li><strong>Active Empathy:</strong> Exceptional at acknowledging billing disputes warmly.</li>
              <li><strong>Data Compliance:</strong> Consistently follows identity verification scripting under FCRA rules.</li>
              <li><strong>Active Listening:</strong> High validation ratings; never interrupts customer complaints.</li>
            </ul>
          </Card>

          <Card style={{ borderLeft: '4px solid var(--warning)', background: 'linear-gradient(90deg, var(--warning-light) 0%, rgba(255,255,255,0.0) 100%)' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', fontWeight: 700 }}>
              <AlertCircle size={16} /> Development Opportunities
            </h3>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: '1.4' }}>
              <li><strong>Objection Handling:</strong> Opportunities exist to reframe pricing objections using LAER methods.</li>
              <li><strong>Closing Techniques:</strong> Focus on guiding assumptive closes rather than open-ended follow-ups.</li>
              <li><strong>Product Knowledge:</strong> Ensure Q3 pricing changes and legacy conversions details are fully reviewed.</li>
            </ul>
          </Card>

        </div>

      </div>
    </PageContainer>
  );
};
export default MyPerformance;
