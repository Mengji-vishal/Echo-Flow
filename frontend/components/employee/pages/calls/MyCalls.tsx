import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/employee/layout/PageContainer';
import { Header } from '@/components/employee/layout/Header';
import { CallFilters } from '@/components/employee/calls/CallFilters';
import { CallTable } from '@/components/employee/calls/CallTable';
import { Card } from '@/components/employee/common/Card';
import { Badge } from '@/components/employee/common/Badge';
import { ProgressBar } from '@/components/employee/common/ProgressBar';
import { Assessment } from '@shared/types';
import { MessageSquare, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { getAuthToken } from '@/lib/auth';
import { fetchEmployeeCallsApi } from '@/lib/employee';
import { fetchCallDetailApi } from '@/lib/calls';

export const MyCalls: React.FC = () => {
  const { token } = useAuth();
  const activeToken = token || getAuthToken();

  const [callsList, setCallsList] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('All Domains');
  const [outcomeFilter, setOutcomeFilter] = useState('All Outcomes');
  const [selectedCall, setSelectedCall] = useState<Assessment | null>(null);

  useEffect(() => {
    if (!activeToken) return;
    setIsLoading(true);

    fetchEmployeeCallsApi(activeToken)
      .then(async (rawCalls) => {
        // Transform real calls from database
        const transformed: Assessment[] = rawCalls.map((c) => {
          const durSec = c.duration_seconds || 0;
          const durStr = durSec > 0 ? `${Math.floor(durSec / 60)}:${String(durSec % 60).padStart(2, '0')}` : '--:--';
          return {
            id: c.id,
            date: c.created_at ? c.created_at.split('T')[0] : 'Today',
            callTitle: `Assessment Consultation #${c.id.slice(-6).toUpperCase()}`,
            customerPersona: 'Prospective Loan Applicant',
            duration: durStr,
            overallScore: c.analysis?.overall_score || 0,
            status: c.status === 'completed' ? 'completed' : 'pending',
            metrics: {
              empathy: c.analysis?.metrics?.empathy ?? 0,
              listening: c.analysis?.metrics?.communication ?? 0,
              productKnowledge: c.analysis?.metrics?.discovery ?? 0,
              compliance: c.analysis?.metrics?.compliance ?? 0,
              closing: c.analysis?.metrics?.closing ?? 0,
            },
            transcript: [],
            feedback: {
              overall: c.analysis?.summary || 'Assessment evaluation recorded.',
              strengths: c.analysis?.strengths || [],
              improvements: c.analysis?.weaknesses || [],
            },
          };
        });

        setCallsList(transformed);
        if (transformed.length > 0) {
          // Select first call and load its detailed transcript
          setSelectedCall(transformed[0]);
          try {
            const detail = await fetchCallDetailApi(activeToken, transformed[0].id);
            if (detail.transcripts && detail.transcripts.length > 0) {
              const lines = detail.transcripts.map((t) => ({
                speaker: (t.speaker === 'agent' || t.speaker === 'ai' ? 'AI-Coach' : 'Agent') as 'Agent' | 'AI-Coach',
                text: t.text,
                timestamp: t.created_at ? t.created_at.split('T')[1]?.slice(0, 5) || '0:00' : '0:00',
                sentiment: 'neutral' as const,
              }));
              setSelectedCall((prev) => (prev ? { ...prev, transcript: lines } : null));
            }
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [activeToken]);

  const handleSelectCall = async (call: Assessment) => {
    setSelectedCall(call);
    if (!activeToken) return;
    try {
      const detail = await fetchCallDetailApi(activeToken, call.id);
      if (detail.transcripts) {
        const lines = detail.transcripts.map((t) => ({
          speaker: (t.speaker === 'agent' || t.speaker === 'ai' ? 'AI-Coach' : 'Agent') as 'Agent' | 'AI-Coach',
          text: t.text,
          timestamp: t.created_at ? t.created_at.split('T')[1]?.slice(0, 5) || '0:00' : '0:00',
          sentiment: 'neutral' as const,
        }));
        setSelectedCall((prev) => (prev ? { ...prev, transcript: lines } : null));
      }
    } catch {}
  };

  // Filter Logic
  const filteredCalls = callsList.filter((call) => {
    const matchesSearch =
      call.callTitle.toLowerCase().includes(search.toLowerCase()) ||
      call.customerPersona.toLowerCase().includes(search.toLowerCase());

    const getOutcome = (c: Assessment) => {
      if (c.status === 'pending') return 'Pending';
      return c.overallScore >= 80 ? 'Successful' : 'Follow-up';
    };

    const matchesOutcome = outcomeFilter === 'All Outcomes' || getOutcome(call) === outcomeFilter;
    return matchesSearch && matchesOutcome;
  });

  const getScoreColor = (score: number) => {
    if (score === 0) return 'var(--text-muted)';
    if (score >= 85) return 'var(--success)';
    if (score >= 70) return 'var(--primary)';
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
        title="My Calls" 
        subtitle="Review and inspect your real customer assessment call evaluations." 
      />

      <CallFilters 
        search={search}
        onSearchChange={setSearch}
        domainFilter={domainFilter}
        onDomainChange={setDomainFilter}
        outcomeFilter={outcomeFilter}
        onOutcomeChange={setOutcomeFilter}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr', gap: '2rem', alignItems: 'start', flexWrap: 'wrap' }}>
        {/* Left Side Table */}
        <CallTable 
          calls={filteredCalls}
          selectedId={selectedCall?.id || null}
          onSelectCall={handleSelectCall}
        />

        {/* Right Side Inspector */}
        <div>
          {selectedCall ? (
            <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Header Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <Badge variant={selectedCall.status === 'completed' ? 'success' : 'info'}>
                      {selectedCall.status === 'completed' ? 'Evaluated' : 'Pending'}
                    </Badge>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {selectedCall.id}</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{selectedCall.callTitle}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Persona: <strong>{selectedCall.customerPersona}</strong></p>
                </div>
                {selectedCall.status === 'completed' && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: getScoreColor(selectedCall.overallScore), lineHeight: '1' }}>
                      {selectedCall.overallScore}%
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>QA Score</span>
                  </div>
                )}
              </div>

              {selectedCall.status === 'completed' ? (
                <>
                  {/* Metrics Progression */}
                  <div>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.02em' }}>Competency Dimensions</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {Object.entries(selectedCall.metrics).map(([key, val]) => {
                        const numericVal = val as number;
                        return (
                          <div key={key} style={{ background: 'var(--background)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', textTransform: 'capitalize', marginBottom: '0.2rem' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{numericVal}%</span>
                            </div>
                            <ProgressBar progress={numericVal} fillColor={getScoreColor(numericVal)} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Strengths & Improvements */}
                  {(selectedCall.feedback.strengths.length > 0 || selectedCall.feedback.improvements.length > 0) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                      <div>
                        <h5 style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                          <CheckCircle2 size={14} /> Key Strengths
                        </h5>
                        <ul style={{ paddingLeft: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {selectedCall.feedback.strengths.slice(0, 2).map((str, idx) => (
                            <li key={idx}>{str}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 style={{ fontSize: '0.8rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                          <AlertCircle size={14} /> Focus Areas
                        </h5>
                        <ul style={{ paddingLeft: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {selectedCall.feedback.improvements.slice(0, 2).map((imp, idx) => (
                            <li key={idx}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Transcript Scroll Container */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '0.02em' }}>
                      <MessageSquare size={14} /> Verbatim Dialogue Transcript ({selectedCall.transcript.length} turns)
                    </h4>
                    {selectedCall.transcript.length === 0 ? (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No transcripts recorded for this call.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                        {selectedCall.transcript.map((line, idx) => (
                          <div key={idx} style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', ...getSentimentStyle(line.sentiment) }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                              <span style={{ color: line.speaker === 'AI-Coach' ? 'var(--primary)' : 'var(--accent)' }}>{line.speaker === 'AI-Coach' ? 'AI Voice' : 'Representative'}</span>
                              <span style={{ color: 'var(--text-muted)' }}>{line.timestamp}</span>
                            </div>
                            <p style={{ fontSize: '0.775rem', color: 'var(--text-primary)', lineHeight: '1.3', margin: 0 }}>{line.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Sparkles size={24} style={{ margin: '0 auto 0.5rem', color: 'var(--text-muted)' }} />
                  <span>Call analysis is pending evaluation. This call has not been scored yet.</span>
                </div>
              )}
            </Card>
          ) : (
            <Card style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select a call record to inspect analysis details.
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
export default MyCalls;
