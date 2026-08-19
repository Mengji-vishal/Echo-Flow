import React, { useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/layout/Header';
import { CallFilters } from '../../components/calls/CallFilters';
import { CallTable } from '../../components/calls/CallTable';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { mockAssessments } from '../../../../../shared/api/mockData';
import { Assessment } from '../../../../../shared/types';
import { MessageSquare, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const MyCalls: React.FC = () => {
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('All Domains');
  const [outcomeFilter, setOutcomeFilter] = useState('All Outcomes');
  const [selectedCall, setSelectedCall] = useState<Assessment | null>(
    mockAssessments.filter(a => a.status === 'completed')[0] || null
  );

  // Filter Logic
  const filteredCalls = mockAssessments.filter(call => {
    // Search filter
    const matchesSearch = 
      call.callTitle.toLowerCase().includes(search.toLowerCase()) ||
      call.customerPersona.toLowerCase().includes(search.toLowerCase());
    
    // Domain mapping
    const getDomain = (c: Assessment) => {
      if (c.id === 'asm_104') return 'Real Estate';
      if (c.id === 'asm_105') return 'Insurance';
      if (c.id === 'asm_106') return 'B2B SaaS';
      return 'Personal Loan';
    };

    const matchesDomain = domainFilter === 'All Domains' || getDomain(call) === domainFilter;

    // Outcome mapping
    const getOutcome = (c: Assessment) => {
      if (c.status === 'pending') return 'Pending';
      return c.overallScore >= 80 ? 'Successful' : 'Follow-up';
    };

    const matchesOutcome = outcomeFilter === 'All Outcomes' || getOutcome(call) === outcomeFilter;

    return matchesSearch && matchesDomain && matchesOutcome;
  });

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
        title="My Calls" 
        subtitle="Review and inspect your customer call evaluations." 
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
          onSelectCall={setSelectedCall}
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
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.02em' }}>Score Metrics</h4>
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
                        <AlertCircle size={14} /> Improvements
                      </h5>
                      <ul style={{ paddingLeft: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {selectedCall.feedback.improvements.slice(0, 2).map((imp, idx) => (
                          <li key={idx}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Transcript Scroll Container */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '0.02em' }}>
                      <MessageSquare size={14} /> Transcript
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                      {selectedCall.transcript.map((line, idx) => (
                        <div key={idx} style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', ...getSentimentStyle(line.sentiment) }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                            <span style={{ color: line.speaker === 'Agent' ? 'var(--primary)' : 'var(--accent)' }}>{line.speaker}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{line.timestamp}</span>
                          </div>
                          <p style={{ fontSize: '0.775rem', color: 'var(--text-primary)', lineHeight: '1.3' }}>{line.text}</p>
                        </div>
                      ))}
                    </div>
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
