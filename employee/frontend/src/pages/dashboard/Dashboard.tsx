import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/layout/Header';
import { StatCard } from '../../components/dashboard/StatCard';
import { PerformanceChart } from '../../components/dashboard/PerformanceChart';
import { SkillBreakdown } from '../../components/dashboard/SkillBreakdown';
import { CoachingRecommendation } from '../../components/dashboard/CoachingRecommendation';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <PageContainer>
      {/* Welcome Header */}
      <Header 
        title="Good morning, Sarah Jenkins 👋" 
        subtitle="Here's your performance summary." 
      />

      {/* KPI Cards Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1.25rem', 
          marginBottom: '2rem' 
        }}
      >
        <StatCard title="Overall Performance" value="84" trend="↑ 6% this week" isPositive={true} />
        <StatCard title="QA Score" value="86" trend="↑ 4%" isPositive={true} />
      </div>

      {/* Main Split Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.8fr 1.2fr', 
          gap: '2rem', 
          alignItems: 'start',
          flexWrap: 'wrap'
        }}
      >
        {/* Left Side: Performance Trend & Coaching Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <PerformanceChart />
          <CoachingRecommendation onPracticeClick={() => onNavigate('practice')} />
        </div>

        {/* Right Side: Skill Breakdown Sliders */}
        <SkillBreakdown onPracticeClick={() => onNavigate('practice')} />
      </div>
    </PageContainer>
  );
};
export default Dashboard;
