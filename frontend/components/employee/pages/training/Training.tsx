import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/employee/layout/PageContainer';
import { Header } from '@/components/employee/layout/Header';
import { Card } from '@/components/employee/common/Card';
import { Badge } from '@/components/employee/common/Badge';
import { ProgressBar } from '@/components/employee/common/ProgressBar';
import { Clock, GraduationCap, Sparkles, CheckCircle2, AlertCircle, PlayCircle, X, HelpCircle, ArrowRight, RotateCcw, Check, Award } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { getAuthToken } from '@/lib/auth';
import {
  fetchEmployeeTrainingApi,
  completeModuleLearningApi,
  fetchModuleQuizApi,
  submitModuleQuizApi,
  TrainingModuleItem,
  QuizData,
  QuizResult,
} from '@/lib/employee';

export const Training: React.FC = () => {
  const { token } = useAuth();
  const [modules, setModules] = useState<TrainingModuleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lesson Reading Modal
  const [activeLesson, setActiveLesson] = useState<TrainingModuleItem | null>(null);
  const [isCompletingLesson, setIsCompletingLesson] = useState<boolean>(false);

  // Quiz Modal State
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

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
    setQuizResult(null);
    setSelectedAnswers({});
  };

  const handleLaunchQuiz = async (moduleId: string) => {
    if (!activeToken) return;
    setIsLoading(true);
    try {
      const qz = await fetchModuleQuizApi(activeToken, moduleId);
      setActiveQuiz(qz);
      setSelectedAnswers({});
      setQuizResult(null);
      setActiveLesson(null);
    } catch (err: any) {
      alert(err.message || 'Failed to launch quiz.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteLearningAndQuiz = async () => {
    if (!activeToken || !activeLesson) return;
    setIsCompletingLesson(true);
    try {
      await completeModuleLearningApi(activeToken, activeLesson.id);
      const qz = await fetchModuleQuizApi(activeToken, activeLesson.id);
      setActiveQuiz(qz);
      setSelectedAnswers({});
      setQuizResult(null);
      setActiveLesson(null);
      loadModules();
    } catch (err: any) {
      alert(err.message || 'Failed to initialize quiz.');
    } finally {
      setIsCompletingLesson(false);
    }
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeToken || !activeQuiz) return;
    const questionsCount = activeQuiz.questions.length;
    const answersList: number[] = [];

    for (let i = 0; i < questionsCount; i++) {
      if (selectedAnswers[i] === undefined) {
        alert(`Please answer Question ${i + 1} before submitting.`);
        return;
      }
      answersList.push(selectedAnswers[i]);
    }

    setIsSubmittingQuiz(true);
    try {
      const result = await submitModuleQuizApi(activeToken, activeQuiz.module_id, answersList);
      setQuizResult(result);
      loadModules();
    } catch (err: any) {
      alert(err.message || 'Failed to submit quiz attempt.');
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const getStatusBadge = (status: string, progress: number) => {
    if (status === 'completed' || progress === 100) {
      return <Badge variant="success">Completed</Badge>;
    }
    if (status === 'ready_for_quiz' || progress >= 50) {
      return <Badge variant="warning">Quiz Ready</Badge>;
    }
    return <Badge variant="info">In Progress</Badge>;
  };

  return (
    <PageContainer>
      <Header 
        title="Personalized Training & Coaching" 
        subtitle="AI-tailored learning modules generated specifically from your verified assessment call performance." 
      />

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Recommended Modules Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Assigned Modules ({modules.length})
            </h2>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Real PostgreSQL curriculum
          </span>
        </div>

        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Loading recommended training modules...
          </div>
        ) : modules.length === 0 ? (
          <Card style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: '#f8fafc', border: '1px dashed var(--border)' }}>
            <GraduationCap size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              No Training Modules Generated Yet
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
              Personalized training modules and quizzes will automatically generate once an assessment call is evaluated by AI.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {modules.map((mod) => (
              <Card key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {mod.skill_area}
                  </span>
                  {getStatusBadge(mod.status, mod.progress)}
                </div>

                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem', lineHeight: '1.3' }}>
                    {mod.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {mod.description}
                  </p>
                </div>

                {mod.why_recommended && (
                  <div style={{ padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: '#475569', borderLeft: '3px solid var(--primary)' }}>
                    {mod.why_recommended}
                  </div>
                )}

                {/* Progress Bar */}
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>
                    <span>Curriculum Progress</span>
                    <span style={{ fontWeight: 700 }}>{mod.progress}%</span>
                  </div>
                  <ProgressBar progress={mod.progress} fillColor={mod.progress === 100 ? 'var(--success)' : 'var(--primary)'} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={14} />
                    <span>{mod.estimated_duration}</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.45rem 0.8rem', fontSize: '0.75rem', fontWeight: 600 }}
                      onClick={() => handleStartLesson(mod)}
                    >
                      Study Material
                    </button>
                    <button 
                      className={mod.status === 'completed' ? 'btn btn-secondary' : 'btn btn-primary'} 
                      style={{ padding: '0.45rem 0.8rem', fontSize: '0.75rem', fontWeight: 600 }}
                      onClick={() => handleLaunchQuiz(mod.id)}
                    >
                      {mod.status === 'completed' ? 'Retake Quiz' : 'Take Quiz'}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Lesson Reading Modal */}
      {activeLesson && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <Card style={{ maxWidth: '680px', width: '100%', maxHeight: '88vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#fff', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div>
                <Badge variant="info" style={{ fontSize: '0.7rem', marginBottom: '0.35rem' }}>
                  {activeLesson.skill_area} • {activeLesson.difficulty}
                </Badge>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{activeLesson.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveLesson(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Learning Objectives */}
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

            {/* Structured Content Framework */}
            {activeLesson.content && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                {activeLesson.content.summary && (
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Summary</h4>
                    <p style={{ color: 'var(--text-secondary)' }}>{activeLesson.content.summary}</p>
                  </div>
                )}

                {activeLesson.content.framework && (
                  <div style={{ padding: '0.75rem 1rem', background: '#f1f5f9', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>5-Step Strategic Framework</h4>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeLesson.content.framework}</p>
                  </div>
                )}

                {activeLesson.content.steps && (
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Action Steps</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {activeLesson.content.steps.map((st: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700 }}>
                            {idx + 1}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {typeof st === 'string' ? st : st.title ? `${st.title} — ${st.detail}` : JSON.stringify(st)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(activeLesson.content.script_examples || (activeLesson.content as any).examples) && (
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Dialogue Script Examples</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {(activeLesson.content.script_examples || (activeLesson.content as any).examples).map((ex: any, idx: number) => (
                        <div key={idx} style={{ padding: '0.65rem 0.85rem', background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 'var(--radius-sm)' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7e22ce', display: 'block', marginBottom: '0.2rem' }}>
                            {ex.scenario || `Scenario ${idx + 1}`}
                          </span>
                          <p style={{ fontSize: '0.8rem', color: '#3b0764', fontStyle: 'italic', margin: 0 }}>
                            &ldquo;{ex.recommended_response || ex.script || (typeof ex === 'string' ? ex : JSON.stringify(ex))}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeLesson.content.practice_exercise && (
                  <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#065f46', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle2 size={14} color="#059669" />
                      Practice Exercise
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#064e3b', margin: 0 }}>{activeLesson.content.practice_exercise}</p>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveLesson(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={isCompletingLesson}
                onClick={handleCompleteLearningAndQuiz}
              >
                {isCompletingLesson ? 'Preparing Quiz...' : 'Complete Learning & Start Quiz'}
                <ArrowRight size={16} />
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Interactive Quiz Modal */}
      {activeQuiz && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <Card style={{ maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#fff', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div>
                <Badge variant="info" style={{ fontSize: '0.7rem', marginBottom: '0.35rem' }}>
                  Comprehension Assessment
                </Badge>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{activeQuiz.title}</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Passing Score: 80% • Answer all 5 questions derived from this module
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveQuiz(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* If Quiz Not Submitted Yet: Show Form */}
            {!quizResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {activeQuiz.questions.map((q, qIdx) => (
                  <div key={q.id || qIdx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', background: '#e0e7ff', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        Q{qIdx + 1}
                      </span>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {q.question}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '0.5rem' }}>
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[qIdx] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.6rem 0.85rem',
                              borderRadius: 'var(--radius-sm)',
                              border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                              background: isSelected ? '#eff6ff' : '#ffffff',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontSize: '0.8rem',
                              color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                              fontWeight: isSelected ? 600 : 400,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span style={{ width: '20px', height: '20px', borderRadius: '50%', border: isSelected ? '2px solid var(--primary)' : '1px solid var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0 }}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setActiveQuiz(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={isSubmittingQuiz}
                    onClick={handleSubmitQuiz}
                  >
                    {isSubmittingQuiz ? 'Grading Answers...' : 'Submit Answers For Evaluation'}
                    <Check size={16} />
                  </button>
                </div>
              </div>
            ) : (
              /* Quiz Result Feedback Screen */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1.25rem', textAlign: 'center', borderRadius: 'var(--radius-md)', background: quizResult.passed ? '#ecfdf5' : '#fff1f2', border: quizResult.passed ? '1px solid #a7f3d0' : '1px solid #fecdd3' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: quizResult.passed ? '#059669' : '#e11d48', color: '#fff', marginBottom: '0.75rem' }}>
                    {quizResult.passed ? <Award size={32} /> : <AlertCircle size={32} />}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: quizResult.passed ? '#065f46' : '#9f1239' }}>
                    {quizResult.passed ? 'Assessment Passed! (100% Progress)' : 'Keep Practicing (Review Required)'}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: quizResult.passed ? '#047857' : '#be123c', marginTop: '0.25rem', fontWeight: 600 }}>
                    Score: {quizResult.score}% ({quizResult.correct_count} of {quizResult.total_questions} correct)
                  </p>
                </div>

                {/* Question Feedback Explanations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    Question Review & Explanations
                  </h4>
                  {quizResult.review_feedback.map((rf, idx) => (
                    <div key={idx} style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: rf.is_correct ? '1px solid #a7f3d0' : '1px solid #fecdd3', background: rf.is_correct ? '#f0fdf4' : '#fff5f5' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Question {idx + 1}: {rf.question}
                        </span>
                        <Badge variant={rf.is_correct ? 'success' : 'danger'} style={{ fontSize: '0.65rem' }}>
                          {rf.is_correct ? 'Correct' : 'Incorrect'}
                        </Badge>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#475569', background: '#ffffff', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border)', margin: '0.25rem 0 0 0' }}>
                        💡 <strong>Takeaway:</strong> {rf.explanation}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setActiveQuiz(null);
                      setQuizResult(null);
                    }}
                  >
                    Close
                  </button>
                  {!quizResult.passed && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        setQuizResult(null);
                        setSelectedAnswers({});
                      }}
                    >
                      <RotateCcw size={16} />
                      Retake Quiz
                    </button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </PageContainer>
  );
};
export default Training;
