'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  MessageSquare,
  BarChart3,
  Bot,
  Lightbulb,
  GraduationCap,
  PlayCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { getAuthToken } from '@/lib/auth';
import { fetchCallDetailApi, completeCallApi } from '@/lib/calls';
import { CallDetail } from '@/types/call';

export default function CallDetailPage() {
  const params = useParams();
  const { token } = useAuth();
  const callId = params?.id as string;

  const [call, setCall] = React.useState<CallDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCompleting, setIsCompleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const activeToken = token || getAuthToken();

  const loadCall = React.useCallback(async () => {
    if (!activeToken || !callId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCallDetailApi(activeToken, callId);
      setCall(data);
    } catch (err: any) {
      setError(err.message || `Failed to fetch call details for ${callId}.`);
    } finally {
      setIsLoading(false);
    }
  }, [activeToken, callId]);

  React.useEffect(() => {
    loadCall();
  }, [loadCall]);

  const handleSimulateComplete = async () => {
    if (!activeToken || !callId) return;
    setIsCompleting(true);
    setError(null);
    try {
      const updated = await completeCallApi(activeToken, callId);
      setCall(updated);
      setSuccessMsg('Call completed! Conversational analysis and training modules generated.');
    } catch (err: any) {
      setError(err.message || 'Failed to complete call assessment.');
    } finally {
      setIsCompleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" size="sm">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="primary" dot size="sm">In Progress</Badge>;
      case 'ringing':
      case 'initiating':
        return <Badge variant="warning" dot size="sm">Initiating</Badge>;
      case 'failed':
        return <Badge variant="danger" size="sm">Failed</Badge>;
      case 'created':
      default:
        return <Badge variant="neutral" size="sm">Created</Badge>;
    }
  };

  const formatDate = (isoStr?: string | null) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Link
          href="/manager/calls"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Calls</span>
        </Link>
        <div className="p-12 text-center border border-dashed border-slate-200 rounded-xl">
          <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading call report...</p>
        </div>
      </div>
    );
  }

  if (error || !call) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Link
          href="/manager/calls"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Calls</span>
        </Link>
        <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-3 text-sm">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error loading call report</p>
            <p className="text-xs text-rose-700 mt-1">{error || 'Call not found.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const analysis = call.analysis;
  const metrics = (analysis?.metrics || {}) as Record<string, number>;
  const questionEvals = analysis?.question_evaluations || [];
  const trainingModules = call.recommended_training || [];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back Link */}
      <Link
        href="/manager/calls"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Assessment Calls</span>
      </Link>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in-50">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-emerald-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Header Info Card */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Avatar name={call.employee_name || 'Employee'} size="lg" status="online" />
              <div>
                <div className="flex items-center space-x-2.5">
                  <h2 className="text-xl font-bold text-slate-900">
                    {call.employee_name || 'Representative Evaluation'}
                  </h2>
                  {getStatusBadge(call.status)}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {call.employee_email || call.employee_id} • Call ID: <span className="font-mono">{call.id}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4 text-xs text-slate-600 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>{formatDate(call.created_at)}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="font-mono">{formatDuration(call.duration_seconds)}</span>
                </div>
              </div>

              {call.status !== 'completed' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSimulateComplete}
                  isLoading={isCompleting}
                  className="gap-1.5 text-xs shadow-sm bg-blue-600 hover:bg-blue-700"
                >
                  <PlayCircle className="h-3.5 w-3.5" />
                  <span>Complete & Analyze Call</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Left Column (Questions, Q&A Evaluation, Transcripts) | Right Column (QA Metrics, Strengths, Training) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Question-by-Question Analysis */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileQuestion className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-base">5 Assessment Questions & Responses</CardTitle>
                </div>
                <Badge variant="neutral" size="sm">5 Questions</Badge>
              </div>
              <CardDescription>
                Detailed breakdown of questions asked and representative response quality
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {call.questions && call.questions.length > 0 ? (
                call.questions.map((q) => {
                  const evalData = questionEvals.find(
                    (qe) => qe.question_number === q.question_number
                  );
                  return (
                    <div
                      key={q.id || q.question_number}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start space-x-2.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white font-bold text-[10px]">
                            Q{q.question_number}
                          </span>
                          <span className="font-bold text-slate-900 pt-0.5">
                            {q.question_text}
                          </span>
                        </div>
                        {evalData && (
                          <span className="shrink-0 font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px]">
                            {evalData.score}%
                          </span>
                        )}
                      </div>

                      {evalData?.employee_answer && (
                        <div className="pl-7 text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 text-[11px] leading-relaxed">
                          <span className="font-semibold text-slate-700 block mb-0.5">Representative Answer:</span>
                          &ldquo;{evalData.employee_answer}&rdquo;
                        </div>
                      )}

                      {evalData?.feedback && (
                        <div className="pl-7 flex items-center space-x-1.5 text-emerald-700 text-[11px]">
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span>{evalData.feedback}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 italic py-2">No questions recorded.</p>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Conversation Transcript */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-base">Full Conversation Transcript</CardTitle>
                </div>
                <Badge variant="neutral" size="sm">
                  {call.transcripts?.length || 0} Turns
                </Badge>
              </div>
              <CardDescription>
                Multi-turn dialogue exchange between AI caller and representative
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-2.5">
              {call.transcripts && call.transcripts.length > 0 ? (
                call.transcripts.map((t, idx) => {
                  const isAi = t.speaker === 'ai';
                  return (
                    <div
                      key={t.id || idx}
                      className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1 ${
                        isAi
                          ? 'bg-blue-50/60 border-blue-100 ml-0 mr-6'
                          : 'bg-emerald-50/50 border-emerald-100 ml-6 mr-0'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-bold flex items-center space-x-1.5 ${isAi ? 'text-blue-700' : 'text-emerald-700'}`}>
                          {isAi ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                          <span>{isAi ? 'AI Caller' : call.employee_name || 'Employee'}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{t.timestamp}</span>
                      </div>
                      <p className="text-slate-800">{t.text}</p>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg">
                  <MessageSquare className="h-7 w-7 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-600">Transcript not available yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Spoken dialogue turns will appear here once the representative completes the phone assessment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Evaluation Report & Training Modules */}
        <div className="space-y-6">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-base">QA Performance Scorecard</CardTitle>
              </div>
              <CardDescription>Evaluation dimensions & AI observations</CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-5">
              {analysis ? (
                <>
                  {/* Overall Score */}
                  <div className="p-4 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-center shadow-md">
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-90 block">
                      Overall Assessment Score
                    </span>
                    <span className="text-4xl font-black mt-1 block">
                      {analysis.overall_score}<span className="text-xl font-normal opacity-80">/100</span>
                    </span>
                  </div>

                  {/* Summary */}
                  {analysis.summary && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 italic leading-relaxed">
                      &ldquo;{analysis.summary}&rdquo;
                    </div>
                  )}

                  {/* 7 Skill Breakdown */}
                  {Object.keys(metrics).length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        7 Skill Dimensions
                      </h4>
                      {Object.entries(metrics).map(([key, val]) => (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="capitalize text-slate-600">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </span>
                            <span className="font-bold text-slate-900">{val}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                val >= 85
                                  ? 'bg-emerald-500'
                                  : val >= 70
                                  ? 'bg-blue-600'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Strengths */}
                  {analysis.strengths && analysis.strengths.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center space-x-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Key Strengths</span>
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-600 pl-4 list-disc">
                        {analysis.strengths.map((str, i) => (
                          <li key={i}>{str}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Focus Areas */}
                  {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center space-x-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Focus Areas</span>
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-600 pl-4 list-disc">
                        {analysis.weaknesses.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* AI Insights */}
                  {analysis.insights && analysis.insights.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 flex items-center space-x-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>AI Behavioral Insights</span>
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-600 pl-4 list-disc">
                        {analysis.insights.map((ins, i) => (
                          <li key={i}>{ins}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysis.recommendations && analysis.recommendations.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center space-x-1">
                        <Lightbulb className="h-3.5 w-3.5" />
                        <span>Recommendations</span>
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-600 pl-4 list-disc">
                        {analysis.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg">
                  <BarChart3 className="h-7 w-7 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-600">Analysis pending</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click &ldquo;Complete & Analyze Call&rdquo; above to run the assessment evaluation.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section: Recommended Training for Employee */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-base">Recommended Training Modules</CardTitle>
                </div>
                <Badge variant="neutral" size="sm">{trainingModules.length}</Badge>
              </div>
              <CardDescription>
                Personalized modules generated to address this call&apos;s weak areas
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {trainingModules.length > 0 ? (
                trainingModules.map((tm) => (
                  <div
                    key={tm.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="primary" size="sm">{tm.skill_area}</Badge>
                      <span className="text-[10px] text-slate-400 font-mono">{tm.estimated_duration}</span>
                    </div>
                    <h4 className="font-bold text-slate-900">{tm.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{tm.description}</p>
                    {tm.why_recommended && (
                      <p className="text-[10px] text-amber-700 italic bg-amber-50 p-1.5 rounded border border-amber-100">
                        {tm.why_recommended}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-6 text-center border border-dashed border-slate-200 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-600">No training modules linked yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Personalized curricula will be generated automatically when call evaluation runs.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
