import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  PlayCircle, 
  TrendingUp, 
  Award, 
  Settings as SettingsIcon,
  Mic,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onNavigate }) => {
  const { user, logout } = useAuth();
  const displayName = user?.name || 'Representative';
  const roleDisplay = user?.role === 'employee' ? 'Sales Representative' : user?.role || 'Representative';

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'training', label: 'AI Training', icon: <PlayCircle size={18} /> },
    { id: 'calls', label: 'My Calls', icon: <BarChart3 size={18} /> },
    { id: 'performance', label: 'My Performance', icon: <BarChart3 size={18} /> },
    { id: 'progress', label: 'Progress & Skills', icon: <TrendingUp size={18} /> },
    { id: 'achievements', label: 'Achievements', icon: <Award size={18} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
  ];

  return (
    <aside 
      style={{ 
        width: '260px', 
        height: '100vh', 
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border)',
        display: 'flex', 
        flexDirection: 'column', 
        padding: '1.5rem 1.25rem',
        flexShrink: 0
      }}
    >
      {/* Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingLeft: '0.25rem' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <Mic size={18} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: '1.1' }}>Echo Flow</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Conversational Coaching</span>
        </div>
      </div>

      {/* User profile details */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          padding: '0.75rem', 
          backgroundColor: 'var(--background)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem' 
        }}
      >
        <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
          {displayName.slice(0, 2).toUpperCase()}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {displayName}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
            <span className="badge-tag badge-tag-info" style={{ fontSize: '0.6rem', padding: '0.05rem 0.3rem' }}>
              {roleDisplay}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation options */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flexGrow: 1 }}>
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`btn`}
              style={{
                justifyContent: 'flex-start',
                width: '100%',
                padding: '0.65rem 0.85rem',
                fontSize: '0.85rem',
                backgroundColor: isActive ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                borderColor: 'transparent',
                color: isActive ? '#4f46e5' : '#475569',
                fontWeight: isActive ? 600 : 500,
                transition: 'background var(--transition-fast), color var(--transition-fast)'
              }}
              onClick={() => onNavigate(item.id)}
            >
              {React.cloneElement(item.icon, { color: isActive ? '#4f46e5' : '#475569' })}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <button
          type="button"
          onClick={logout}
          className="btn"
          style={{
            justifyContent: 'flex-start',
            width: '100%',
            padding: '0.5rem 0.85rem',
            fontSize: '0.8rem',
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            color: '#e11d48',
            fontWeight: 600,
            cursor: 'pointer',
            gap: '0.5rem',
          }}
        >
          <LogOut size={16} color="#e11d48" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
