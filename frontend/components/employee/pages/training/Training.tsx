import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/employee/layout/PageContainer';
import { Header } from '@/components/employee/layout/Header';
import { Card } from '@/components/employee/common/Card';
import { Badge } from '@/components/employee/common/Badge';
import { ProgressBar } from '@/components/employee/common/ProgressBar';
import { Clock, GraduationCap, Sparkles, CheckCircle2, AlertCircle, PlayCircle, BookOpen, X } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { getAuthToken } from '@/lib/auth';
import { fetchEmployeeTrainingApi, updateTrainingProgressApi, TrainingModuleItem } from '@/lib/employee';
import { mockTrainingModules } from '@shared/api/mockData';

export const Training: React.FC = () => {
  const { token } = useAuth();
  const [modules, setModules] = useState<TrainingModuleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<TrainingModuleItem | null>(null);
  const [lessonProgress, setLessonProgress] = useState<number>(0);

  const activeToken = token || getAuthToken();

  const loadModules = React.useCallback(async () => {
    if (!activeToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchEmployeeTrainingApi(activeToken);
      setModules(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load recommended training modules.');
    } finally {
      setIsLoading(false);
    }
  }, [activeToken]);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  const handleStartLesson = (mod: TrainingModuleItem) => {
    setActiveLesson(mod);
    setLessonProgress(mod.progress || 0);
  };

  const handleCompleteLesson = async () => {
    if (!activeToken || !activeLesson) return;
    try {
      const updated = await updateTrainingProgressApi(activeToken, activeLesson.id, 100, 'completed');
      setModules((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setActiveLesson(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update progress.');
    }
  };

  const getDifficultyVariant = (diff: string) => {
    if (diff === 'Beginner') return 'success';
    if (diff === 'Intermediate') return 'info';
    return 'warning';
  };

  return (
    <PageContainer>
      <Header 
        title="Personalized Training Curriculum" 
        subtitle="AI-generated learning modules designed specifically to address your assessment weak areas." 
      />

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Section 1: Recommended for You (Based on Phone Assessment) */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Sparkles size={18} color="var(--primary)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Recommended for You (Based on Recent Calls)
          </h2>
        </div>

        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading recommended training...
          </div>
        ) : modules.length === 0 ? (
          <Card style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border)' }}>
            <GraduationCap size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>No Assessment-Specific Weak Areas Identified</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Complete an assessment phone call to receive targeted, personalized training recommendations.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {modules.map((mod) => (
              <Card key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--primary-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Badge variant={getDifficultyVariant(mod.difficulty)} style={{ fontSize: '0.7rem' }}>
                    {mod.skill_area} • {mod.difficulty}
                  </Badge>
                  <Badge variant={mod.status === 'completed' ? 'success' : 'info'} style={{ fontSize: '0.65rem' }}>
                    {mod.status === 'completed' ? 'Completed' : 'Recommended'}
                  </Badge>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>{mod.title}</h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '0.35rem' }}>
                    {mod.description}
                  </p>
                </div>

                {mod.why_recommended && (
                  <div style={{ padding: '0.6rem 0.75rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: '#92400e', fontStyle: 'italic' }}>
                    💡 <strong>Why recommended:</strong> {mod.why_recommended}
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    <span>Module Progress</span>
                    <span style={{ fontWeight: 700 }}>{mod.progress}%</span>
                  </div>
                  <ProgressBar progress={mod.progress} fillColor={mod.progress === 100 ? 'var(--success)' : 'var(--primary)'} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={14} />
                    <span>{mod.estimated_duration}</span>
                  </div>
                  <button 
                    className={mod.progress === 100 ? 'btn btn-secondary' : 'btn btn-primary'} 
                    style={{ padding: '0.45rem 1rem', fontSize: '0.75rem', fontWeight: 600 }}
                    onClick={() => handleStartLesson(mod)}
                  >
                    {mod.progress === 100 ? 'Review Lesson' : mod.progress > 0 ? 'Resume' : 'Start Training'}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Standard Core Training Catalog */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <BookOpen size={18} color="var(--text-secondary)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Core Skill Curriculum
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {mockTrainingModules.map((mod) => (
            <Card key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{mod.category}</span>
                <Badge variant={mod.status === 'completed' ? 'success' : 'info'} style={{ fontSize: '0.65rem' }}>
                  {mod.status === 'completed' ? 'Completed' : 'Core'}
                </Badge>
              </div>

              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>{mod.title}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{mod.description}</p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                <span>{mod.estimatedMinutes} mins</span>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }}
                  onClick={() => alert(`Launching foundational curriculum: "${mod.title}"...`)}
                >
                  Study
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Interactive Lesson Modal */}
      {activeLesson && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <Card style={{ maxWidth: '640px', width: '100%', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#fff', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div>
                <Badge variant="info" style={{ fontSize: '0.7rem', marginBottom: '0.35rem' }}>
                  {activeLesson.skill_area} • {activeLesson.difficulty}
                </Badge>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{activeLesson.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveLesson(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Objectives */}
            {activeLesson.learning_objectives && activeLesson.learning_objectives.length > 0 && (
              <div style={{ background: 'var(--background)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Learning Objectives
                </h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {activeLesson.learning_objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Lesson Steps */}
            {activeLesson.content?.steps && activeLesson.content.steps.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Lesson Framework</h4>
                {activeLesson.content.steps.map((st, i) => (
                  <div key={i} style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: '0.25rem' }}>
                      {st.title}
                    </span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{st.detail}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Footer action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated: {activeLesson.estimated_duration}</span>
              <button
                className="btn btn-primary"
                onClick={handleCompleteLesson}
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <CheckCircle2 size={16} />
                <span>Mark Module Completed (100%)</span>
              </button>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
};
export default Training;
