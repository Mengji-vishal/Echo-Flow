import React from 'react';
import { Search } from 'lucide-react';

interface CallFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  domainFilter: string;
  onDomainChange: (val: string) => void;
  outcomeFilter: string;
  onOutcomeChange: (val: string) => void;
}

export const CallFilters: React.FC<CallFiltersProps> = ({
  search,
  onSearchChange,
  domainFilter,
  onDomainChange,
  outcomeFilter,
  onOutcomeChange
}) => {
  const domains = ['All Domains', 'Personal Loan', 'Education', 'Real Estate', 'Insurance', 'B2B SaaS'];
  const outcomes = ['All Outcomes', 'Successful', 'Follow-up', 'Pending'];

  return (
    <div 
      style={{ 
        display: 'flex', 
        gap: '1rem', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        marginBottom: '1.5rem',
        width: '100%'
      }}
    >
      {/* Search Input */}
      <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
        <Search 
          size={16} 
          color="var(--text-muted)" 
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} 
        />
        <input
          type="text"
          className="form-input"
          style={{ paddingLeft: '2.25rem' }}
          placeholder="Search by call name or persona..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Domain Select */}
      <div style={{ minWidth: '160px' }}>
        <select
          className="form-input"
          value={domainFilter}
          onChange={(e) => onDomainChange(e.target.value)}
        >
          {domains.map(dom => (
            <option key={dom} value={dom}>{dom}</option>
          ))}
        </select>
      </div>

      {/* Outcome Select */}
      <div style={{ minWidth: '160px' }}>
        <select
          className="form-input"
          value={outcomeFilter}
          onChange={(e) => onOutcomeChange(e.target.value)}
        >
          {outcomes.map(out => (
            <option key={out} value={out}>{out}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
