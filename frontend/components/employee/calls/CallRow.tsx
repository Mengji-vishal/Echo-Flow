import React from 'react';
import { Assessment } from '@shared/types';
import { Badge } from '../common/Badge';

interface CallRowProps {
  call: Assessment;
  isSelected: boolean;
  onSelect: () => void;
}

export const CallRow: React.FC<CallRowProps> = ({ call, isSelected, onSelect }) => {
  // Determine Outcome category based on score and details
  const getOutcome = (item: Assessment) => {
    if (item.status === 'pending') return 'Pending';
    return item.overallScore >= 80 ? 'Successful' : 'Follow-up';
  };

  const outcome = getOutcome(call);

  const getScoreColor = (score: number) => {
    if (score === 0) return 'var(--text-muted)';
    if (score >= 90) return 'var(--success)';
    if (score >= 80) return 'var(--primary)';
    return 'var(--warning)';
  };

  return (
    <tr 
      onClick={onSelect}
      style={{ 
        cursor: 'pointer',
        backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.04)' : 'transparent',
        borderBottom: '1px solid var(--border)',
        transition: 'background-color var(--transition-fast)'
      }}
      className="call-row-hover"
    >
      <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        <div>{call.callTitle}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{call.customerPersona}</div>
      </td>
      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        {call.id === 'asm_104' ? 'Real Estate' : call.id === 'asm_105' ? 'Insurance' : call.id === 'asm_106' ? 'B2B SaaS' : 'Personal Loan'}
      </td>
      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        {call.date.split(' ')[0]}
      </td>
      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        {call.status === 'completed' ? call.duration : '--:--'}
      </td>
      <td style={{ padding: '1rem' }}>
        <Badge variant={outcome === 'Successful' ? 'success' : outcome === 'Follow-up' ? 'warning' : 'info'}>
          {outcome}
        </Badge>
      </td>
      <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 700, color: getScoreColor(call.overallScore) }}>
        {call.status === 'completed' ? `${call.overallScore}%` : 'Pending'}
      </td>
    </tr>
  );
};
