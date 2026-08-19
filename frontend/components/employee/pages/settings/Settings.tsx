import React, { useState } from 'react';
import { PageContainer } from '@/components/employee/layout/PageContainer';
import { Header } from '@/components/employee/layout/Header';
import { Card } from '@/components/employee/common/Card';
import { mockUserProgress } from '@shared/api/mockData';
import { Check, Mic, Bell, User } from 'lucide-react';

export const Settings: React.FC = () => {
  const [profile, setProfile] = useState({
    name: mockUserProgress.name,
    email: "sarah.jenkins@echoflow.com",
    role: mockUserProgress.role
  });
  const [audioInput, setAudioInput] = useState("Default System Mic");
  const [coachAlerts, setCoachAlerts] = useState(true);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  return (
    <PageContainer>
      <Header 
        title="Settings" 
        subtitle="Manage your profile settings, voice capture parameters, and AI coach metrics." 
      />

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start', flexWrap: 'wrap' }}>
        
        {/* Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <Card>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--primary)" />
              Profile Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profile.name} 
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Job Role</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={profile.role} 
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={profile.email} 
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Assigned Domain (Read-Only)</label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-muted)', border: '1px solid var(--border)', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {mockUserProgress.assignedDomain}
                  </span>
                  <span className="badge-tag badge-tag-info" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                    Assigned by Manager
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* AI Coach Preferences */}
          <Card>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="var(--accent)" />
              Coaching Alerts
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Live Speech Prompts</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Show real-time hints during simulated calls.</p>
              </div>
              <input 
                type="checkbox" 
                checked={coachAlerts} 
                onChange={(e) => setCoachAlerts(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>
          </Card>

        </div>

        {/* Audio Mic Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <Card>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mic size={18} color="var(--secondary)" />
              Voice Parameters
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Input Device</label>
                <select 
                  className="form-input" 
                  value={audioInput} 
                  onChange={(e) => setAudioInput(e.target.value)}
                >
                  <option value="Default System Mic">Default System Mic</option>
                  <option value="External USB Headset">External USB Headset</option>
                  <option value="Built-in Microphone Array">Built-in Microphone Array</option>
                </select>
              </div>

              <div>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => alert("Simulating microphone frequency calibration...")}
                >
                  Test Audio Capture Level
                </button>
              </div>
            </div>
          </Card>

          {/* Submit Trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary">
              Save Configuration Settings
            </button>
            {showSaved && (
              <span style={{ fontSize: '0.85rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                <Check size={16} /> Saved Successfully
              </span>
            )}
          </div>

        </div>

      </form>
    </PageContainer>
  );
};
export default Settings;
