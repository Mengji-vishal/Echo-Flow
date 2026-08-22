'use client';

import React, { useState } from 'react';
import { Sidebar } from './layout/Sidebar';
import { Dashboard } from './pages/dashboard/Dashboard';
import { Practice } from './pages/practice/Practice';
import { LivePractice } from './pages/practice/LivePractice';
import { PracticeResults } from './pages/practice/PracticeResults';
import { MyPerformance } from './pages/performance/MyPerformance';
import { Progress } from './pages/progress/Progress';
import { Achievements } from './pages/achievements/Achievements';
import { Settings } from './pages/settings/Settings';
import { MyCalls } from './pages/calls/MyCalls';
import { Training } from './pages/training/Training';
import { PracticeScenarioInfo } from './practice/PracticeCard';
import { Assessment } from '@shared/types';

interface EmployeeWorkspaceProps {
  initialTab?: string;
}

export function EmployeeWorkspace({ initialTab = 'dashboard' }: EmployeeWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [activeScenario, setActiveScenario] = useState<PracticeScenarioInfo | null>(null);
  
  // Roadmap lock-and-unlock states
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  const [videoWatchStatus, setVideoWatchStatus] = useState<boolean[]>([false, false, false, false]);
  
  // User written assessments history logs (empty by default, populated dynamically)
  const [userTests, setUserTests] = useState<Assessment[]>([]);

  const [practiceResults, setPracticeResults] = useState<{
    score: number;
    breakdown: {
      empathy: number;
      communication: number;
      discovery: number;
      objectionHandling: number;
      solutionOffering: number;
      closing: number;
      compliance: number;
    };
    feedback: {
      summary: string;
      strengths: string[];
      improvements: string[];
    };
  } | null>(null);

  // Map module index to corresponding practice persona id
  const roadmapMapping = [
    { index: 0, personaId: 'prc_02' }, // Step 0 -> Frank (billing de-escalation)
    { index: 1, personaId: 'prc_03' }, // Step 1 -> Applicant (discovery)
    { index: 2, personaId: 'prc_01' }, // Step 2 -> Sarah (objection handling)
    { index: 3, personaId: 'prc_04' }  // Step 3 -> Carl (compliance)
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'practice':
        return (
          <Practice 
            onStartScenario={(sc) => {
              setActiveScenario(sc);
              setActiveTab('live-practice');
            }} 
            completedSteps={completedSteps}
            videoWatchStatus={videoWatchStatus}
            setVideoWatchStatus={setVideoWatchStatus}
            userTests={userTests}
          />
        );
      case 'live-practice':
        if (!activeScenario) {
          setActiveTab('practice');
          return null;
        }
        return (
          <LivePractice
            scenario={activeScenario}
            onHangUp={() => {
              setActiveScenario(null);
              setActiveTab('practice');
            }}
            onFinish={(results) => {
              setPracticeResults(results);
              setActiveTab('practice-results');
              
              // 1. Log this run into history
              const newTest: Assessment = {
                id: `asm_test_${Date.now()}`,
                date: new Date().toISOString().replace('T', ' ').slice(0, 16),
                callTitle: activeScenario.title,
                customerPersona: activeScenario.customerPersona,
                duration: '5:00',
                overallScore: results.score,
                status: 'completed',
                metrics: {
                  empathy: results.breakdown.empathy,
                  listening: results.breakdown.communication,
                  productKnowledge: results.breakdown.discovery,
                  compliance: results.breakdown.compliance,
                  closing: results.breakdown.closing
                },
                transcript: [
                  { speaker: 'Customer', text: `Hi, let's look at ${activeScenario.title}`, timestamp: '0:02' },
                  { speaker: 'Agent', text: `I would be happy to review details for you.`, timestamp: '0:20', sentiment: 'positive' }
                ],
                feedback: {
                  overall: results.feedback.summary,
                  strengths: results.feedback.strengths,
                  improvements: results.feedback.improvements
                }
              };
              setUserTests(prev => [newTest, ...prev]);

              // 2. If it matches current step in learning roadmap, advance progress
              const currentMap = roadmapMapping[completedSteps];
              if (currentMap && activeScenario.id === currentMap.personaId) {
                setCompletedSteps(completedSteps + 1);
              }
            }}
          />
        );
      case 'practice-results':
        if (!practiceResults) {
          setActiveTab('practice');
          return null;
        }
        return (
          <PracticeResults
            scenarioTitle={activeScenario?.title || ''}
            results={practiceResults}
            onRetake={() => {
              setActiveTab('live-practice');
            }}
            onPracticeOther={() => {
              setActiveScenario(null);
              setPracticeResults(null);
              setActiveTab('practice');
            }}
          />
        );
      case 'performance':
        return <MyPerformance onNavigate={setActiveTab} />;
      case 'progress':
        return <Progress />;
      case 'achievements':
        return <Achievements />;
      case 'settings':
        return <Settings />;
      case 'calls':
        return <MyCalls />;
      case 'training':
        return <Training />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Navigation sidebar layout */}
      <Sidebar activeTab={activeTab} onNavigate={setActiveTab} />

      {/* Main content body viewport */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}
export default EmployeeWorkspace;
