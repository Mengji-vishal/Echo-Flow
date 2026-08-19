import React from 'react';
import { Assessment } from '@shared/types';
import { CallRow } from './CallRow';
import { EmptyState } from '../common/EmptyState';

interface CallTableProps {
  calls: Assessment[];
  selectedId: string | null;
  onSelectCall: (call: Assessment) => void;
}

export const CallTable: React.FC<CallTableProps> = ({ calls, selectedId, onSelectCall }) => {
  if (calls.length === 0) {
    return (
      <EmptyState 
        title="No calls found" 
        description="Try adjusting your filters or search query to locate a call record." 
      />
    );
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--surface-muted)', borderBottom: '1px solid var(--border)' }}>
            <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Call</th>
            <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Domain</th>
            <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Date</th>
            <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Duration</th>
            <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Outcome</th>
            <th style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>QA Score</th>
          </tr>
        </thead>
        <tbody>
          {calls.map(call => (
            <CallRow
              key={call.id}
              call={call}
              isSelected={selectedId === call.id}
              onSelect={() => onSelectCall(call)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
