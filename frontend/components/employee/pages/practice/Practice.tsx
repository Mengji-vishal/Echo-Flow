import React, { useState } from 'react';
import { PageContainer } from '@/components/employee/layout/PageContainer';
import { Header } from '@/components/employee/layout/Header';
import { Card } from '@/components/employee/common/Card';
import { Badge } from '@/components/employee/common/Badge';
import { ProgressBar } from '@/components/employee/common/ProgressBar';
import { PracticeCard, PracticeScenarioInfo } from '@/components/employee/practice/PracticeCard';
import { Assessment } from '@shared/types';
import { 
  PlayCircle, 
  BookOpen, 
  History, 
  Lock, 
  CheckCircle2, 
  MessageSquare 
} from 'lucide-react';

interface PracticeProps {
  onStartScenario: (scenario: PracticeScenarioInfo) => void;
  completedSteps: number;
  videoWatchStatus: boolean[];
  setVideoWatchStatus: (status: boolean[]) => void;
  userTests: Assessment[];
}

export const Practice: React.FC<PracticeProps> = ({ 
  onStartScenario,
  completedSteps,
  videoWatchStatus,
  setVideoWatchStatus,
  userTests
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'scenarios' | 'roadmap' | 'history'>('scenarios');
  const [playingVideoModule, setPlayingVideoModule] = useState<number | null>(null);
  const [selectedHistoryCall, setSelectedHistoryCall] = useState<Assessment | null>(userTests[0] || null);

  const scenarios: PracticeScenarioInfo[] = [
    {
      id: "prc_01",
      title: "Handling Price Objections",
      description: "Practice responding to customers who feel your interest rates or loan refinancing options are too expensive.",
      difficulty: "Medium",
      duration: "5–7 min",
      targetSkill: "Objection Handling",
      customerPersona: "Skeptical Sarah"
    },
    {
      id: "prc_02",
      title: "Double-Billing De-escalation",
      description: "Manage a customer whose payment was double-charged, resolving their bank overdraft complaints.",
      difficulty: "Medium",
      duration: "4–6 min",
      targetSkill: "De-escalation",
      customerPersona: "Frustrated Frank"
    },
    {
      id: "prc_03",
      title: "Customer Discovery",
      description: "Qualify a first-time applicant for home remodeling or personal loans by asking structured open prompts.",
      difficulty: "Easy",
      duration: "3–5 min",
      targetSkill: "Discovery Questions",
      customerPersona: "First-time Applicant"
    },
    {
      id: "prc_04",
      title: "Compliance & Co-Signee Audit",
      description: "Handle parent co-signee inquiries regarding educational deferments, interest rate indexes, and disclosure liabilities.",
      difficulty: "Hard",
      duration: "5–8 min",
      targetSkill: "Compliance",
      customerPersona: "Co-signee Carl"
    }
  ];

  // Modules Roadmap Sequence
  const modules = [
    {
      index: 0,
      title: "FCRA Compliance Essentials",
      difficulty: "Easy" as const,
      videoTitle: "FCRA Data Privacy Lecture",
      testTitle: "FCRA Protocol Assessment",
      estMin: 30,
      persona: scenarios[1] // mapped to Frustrated Frank
    },
    {
      index: 1,
      title: "Customer Discovery & Qualifying",
      difficulty: "Easy" as const,
      videoTitle: "Discovery Framework Video",
      testTitle: "Discovery Questions Evaluation",
      estMin: 25,
      persona: scenarios[2] // mapped to Applicant
    },
    {
      index: 2,
      title: "Handling Price & Cost Objections",
      difficulty: "Medium" as const,
      videoTitle: "LAER Objection Handling Guide",
      testTitle: "Price Rebuttal Evaluation",
      estMin: 45,
      persona: scenarios[0] // mapped to Skeptical Sarah
    },
    {
      index: 3,
      title: "Compliance & Disclosure Audits",
      difficulty: "Hard" as const,
      videoTitle: "Loan Disclosure Audits Video",
      testTitle: "Co-signee Disclosure Verification",
      estMin: 40,
      persona: scenarios[3] // mapped to Co-signee Carl
    }
  ];

  const handleStartVideo = (idx: number) => {
    setPlayingVideoModule(idx);
  };

  const handleCompleteVideo = (idx: number) => {
    const updated = [...videoWatchStatus];
    updated[idx] = true;
    setVideoWatchStatus(updated);
    setPlayingVideoModule(null);
    alert(`Video lecture completed! You have unlocked the test: "${modules[idx].testTitle}"`);
  };

  const handleStartTest = (mod: typeof modules[0]) => {
    // Navigate to live practice scenario
    onStartScenario(mod.persona);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'var(--success)';
    if (score >= 80) return 'var(--primary)';
    return 'var(--warning)';
  };

  const getSentimentStyle = (sentiment?: string) => {
    if (sentiment === 'positive') return { borderLeft: '3px solid var(--success)', backgroundColor: 'var(--success-light)' };
    if (sentiment === 'negative') return { borderLeft: '3px solid var(--danger)', backgroundColor: 'var(--danger-light)' };
    return { borderLeft: '3px solid var(--border)', backgroundColor: 'var(--surface-muted)' };
  };

  return (
    <PageContainer>
      <Header 
        title="AI Practice Hub" 
        subtitle="Hone your sales techniques, complete roadmaps, and review evaluations." 
      />

      {/* Sub-tab Switcher */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
        <button 
          className={`btn ${activeSubTab === 'scenarios' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          onClick={() => setActiveSubTab('scenarios')}
        >
          <PlayCircle size={16} />
          Interactive Scenarios
        </button>

        <button 
          className={`btn ${activeSubTab === 'roadmap' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          onClick={() => setActiveSubTab('roadmap')}
        >
          <BookOpen size={16} />
          Learning Roadmap
        </button>

        <button 
          className={`btn ${activeSubTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          onClick={() => setActiveSubTab('history')}
        >
          <History size={16} />
          Assessment History
        </button>
      </div>

      {/* Mode 1: Interactive Scenarios */}
      {activeSubTab === 'scenarios' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '0.5rem' }}>
          {scenarios.map(sc => (
            <PracticeCard 
              key={sc.id} 
              scenario={sc} 
              onStart={() => onStartScenario(sc)}
            />
          ))}
        </div>
      )}

      {/* Mode 2: Sequential Learning Roadmap */}
      {activeSubTab === 'roadmap' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Video Player Overlay Modal */}
          {playingVideoModule !== null && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.95)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
              <div className="card-panel" style={{ maxWidth: '720px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{modules[playingVideoModule].videoTitle}</h3>
                
                <div style={{ width: '100%', height: '260px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #1e1b4b, #311042)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <PlayCircle size={60} color="var(--primary)" style={{ cursor: 'pointer' }} />
                  <span style={{ position: 'absolute', bottom: '0.75rem', left: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                    Lecture Length: 8 mins
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button className="btn btn-secondary" onClick={() => setPlayingVideoModule(null)}>Close</button>
                  <button className="btn btn-primary" onClick={() => handleCompleteVideo(playingVideoModule)}>
                    Complete Video & Unlock Test
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Module lists */}
          {modules.map((mod, index) => {
            const isUnlocked = index <= completedSteps;
            const isVideoWatched = videoWatchStatus[index];
            const isAssessmentDone = completedSteps > index;

            return (
              <Card key={mod.index} style={{ opacity: isUnlocked ? 1 : 0.6, borderLeft: isUnlocked ? '4px solid var(--primary)' : '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <span className="badge-tag badge-tag-info" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>MODULE {index + 1}</span>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{mod.title}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Badge variant={mod.difficulty === 'Easy' ? 'success' : mod.difficulty === 'Medium' ? 'warning' : 'danger'}>
                      {mod.difficulty}
                    </Badge>
                    {!isUnlocked && (
                      <span className="badge-tag badge-tag-danger" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <Lock size={12} /> Locked
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  
                  {/* Part A: Video Lecture Card */}
                  <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Part A: Video Lesson</div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{mod.videoTitle}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flexGrow: 1 }}>Learn the conversational structures and required compliance rules before running evaluations.</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Estimated: 12m</span>
                      {isVideoWatched ? (
                        <span className="badge-tag badge-tag-success" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', fontSize: '0.7rem' }}>
                          <CheckCircle2 size={12} /> Watched
                        </span>
                      ) : (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem' }}
                          disabled={!isUnlocked}
                          onClick={() => handleStartVideo(index)}
                        >
                          Start Video
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Part B: Assessment Test Card */}
                  <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Part B: Eval Assessment</div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{mod.testTitle}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flexGrow: 1 }}>Practice call handling simulation. Your final score must exceed 80% to qualify for the next module.</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Estimated: 8m</span>
                      {isAssessmentDone ? (
                        <span className="badge-tag badge-tag-success" style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', fontSize: '0.7rem' }}>
                          <CheckCircle2 size={12} /> Completed
                        </span>
                      ) : (
                        <button 
                          className="btn btn-secondary" 
                          style={{ 
                            padding: '0.35rem 0.75rem', 
                            fontSize: '0.7rem',
                            backgroundColor: isVideoWatched ? 'var(--primary)' : 'var(--surface)',
                            color: isVideoWatched ? '#white' : 'var(--text-secondary)'
                          }}
                          disabled={!isUnlocked || !isVideoWatched}
                          onClick={() => handleStartTest(mod)}
                        >
                          Start Test
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Mode 3: Assessment History (Revision logs) */}
      {activeSubTab === 'history' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr', gap: '2rem', alignItems: 'start', flexWrap: 'wrap' }}>
          
          {/* History table list */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-muted)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Assessment</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {userTests.map(c => (
                  <tr 
                    key={c.id} 
                    onClick={() => setSelectedHistoryCall(c)}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: selectedHistoryCall?.id === c.id ? 'rgba(79, 70, 229, 0.04)' : 'transparent',
                      borderBottom: '1px solid var(--border)'
                    }}
                  >
                    <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {c.callTitle}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.customerPersona}</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {c.date.split(' ')[0]}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 700, color: getScoreColor(c.overallScore) }}>
                      {c.overallScore}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* History Details Inspector panel */}
          <div>
            {selectedHistoryCall ? (
              <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                  <div>
                    <span className="badge-tag badge-tag-success" style={{ marginBottom: '0.25rem' }}>Completed</span>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{selectedHistoryCall.callTitle}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Persona: <strong>{selectedHistoryCall.customerPersona}</strong></p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: getScoreColor(selectedHistoryCall.overallScore) }}>{selectedHistoryCall.overallScore}%</div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Evaluation Score</span>
                  </div>
                </div>

                {/* Score breakdown metrics slider */}
                <div>
                  <h4 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Metrics</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {Object.entries(selectedHistoryCall.metrics).map(([key, val]) => {
                      const numeric = val as number;
                      return (
                        <div key={key} style={{ background: 'var(--background)', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', textTransform: 'capitalize', marginBottom: '0.2rem' }}>
                            <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span style={{ fontWeight: 700 }}>{numeric}%</span>
                          </div>
                          <ProgressBar progress={numeric} fillColor={getScoreColor(numeric)} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Transcript Review scrolling box */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MessageSquare size={14} /> Transcript Revision
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                    {selectedHistoryCall.transcript.length > 0 ? (
                      selectedHistoryCall.transcript.map((line, idx) => (
                        <div key={idx} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', ...getSentimentStyle(line.sentiment) }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            <span style={{ color: line.speaker === 'Agent' ? 'var(--primary)' : 'var(--accent)' }}>{line.speaker}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{line.timestamp}</span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', lineHeight: '1.3' }}>{line.text}</p>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center' }}>
                        No transcript saved.
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Select an assignment row to review transcripts for revision.
              </Card>
            )}
          </div>

        </div>
      )}

    </PageContainer>
  );
};
export default Practice;
