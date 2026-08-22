import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/employee/layout/PageContainer';
import { Header } from '@/components/employee/layout/Header';
import { StatCard } from '@/components/employee/dashboard/StatCard';
import { PerformanceChart } from '@/components/employee/dashboard/PerformanceChart';
import { SkillBreakdown } from '@/components/employee/dashboard/SkillBreakdown';
import { CoachingRecommendation } from '@/components/employee/dashboard/CoachingRecommendation';
import { useAuth } from '@/components/auth/AuthContext';
import { getAuthToken } from '@/lib/auth';
import { fetchEmployeePerformanceApi, EmployeePerformanceSummary } from '@/lib/employee';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, token } = useAuth();
  const [perfData, setPerfData] = useState<EmployeePerformanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const activeToken = token || getAuthToken();

  useEffect(() => {
    if (!activeToken) return;
    setIsLoading(true);
    fetchEmployeePerformanceApi(activeToken)
      .then((data) => setPerfData(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [activeToken]);

  const displayName = user?.name || perfData?.employee_name || 'Representative';
  const overallScore = perfData ? `${perfData.average_score}%` : '0%';
  const complianceScore = perfData?.metrics_averages?.compliance !== undefined ? `${perfData.metrics_averages.compliance}%` : '0%';
  const callsCount = perfData?.completed_calls || 0;
  const recentScores = (perfData?.recent_evaluations || []).map((e) => e.score || 0).reverse();

  return (
    <PageContainer>
      {/* Welcome Header */}
      <Header 
        title={`Welcome back, ${displayName} 👋`} 
        subtitle="Here's your live AI performance summary and assessment analytics." 
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
        <StatCard 
          title="Overall QA Performance" 
          value={isLoading ? '...' : overallScore} 
          trend={`${callsCount} verified assessments`} 
          isPositive={callsCount > 0} 
        />
        <StatCard 
          title="Compliance Rating" 
          value={isLoading ? '...' : complianceScore} 
          trend="Regulatory standard" 
          isPositive={callsCount > 0} 
        />
        <StatCard 
          title="Recommended Modules" 
          value={isLoading ? '...' : `${perfData?.recommended_modules_count || 0}`} 
          trend="Personalized coaching" 
          isPositive={(perfData?.recommended_modules_count || 0) > 0} 
        />
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
          <PerformanceChart scores={recentScores} />
          <CoachingRecommendation 
            focusAreas={perfData?.focus_areas} 
            onPracticeClick={() => onNavigate('training')} 
          />
        </div>

        {/* Right Side: Skill Breakdown Sliders */}
        <SkillBreakdown 
          metrics={perfData?.metrics_averages} 
          onPracticeClick={() => onNavigate('training')} 
        />
      </div>
    </PageContainer>
  );
};
export default Dashboard;
