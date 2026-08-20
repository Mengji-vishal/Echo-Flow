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
  Bot,
  RefreshCw,
  Phone,
  HelpCircle,
  FileText,
  ListOrdered,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { getAuthToken } from '@/lib/auth';
import { fetchCallDetailApi } from '@/lib/calls';
import { CallDetail, CallTranscript } from '@/types/call';

export default function TranscriptDetailPage() {
  const params = useParams();
  const { token } = useAuth();
  const callId = params?.id as string;

  const [call, setCall] = React.useState<CallDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'qa' | 'chronological'>('qa');

  const activeToken = token || getAuthToken();

  const loadCall = React.useCallback(async () => {
    if (!activeToken || !callId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCallDetailApi(activeToken, callId);
      setCall(data);
    } catch (err: any) {
      setError(err.message || `Failed to load transcript for call ${callId}.`);
    } finally {
      setIsLoading(false);
    }
  }, [activeToken, callId]);

  React.useEffect(() => {
    loadCall();
  }, [loadCall]);

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
      <div className="max-w-5xl space-y-6">
        <div className="flex items-center space-x-3">
          <Link href="/manager/transcripts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to Transcripts</span>
            </Button>
          </Link>
        </div>
        <Card className="text-center py-16">
          <CardContent>
            <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Loading call transcript...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !call) {
    return (
      <div className="max-w-5xl space-y-6">
        <div className="flex items-center space-x-3">
          <Link href="/manager/transcripts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to Transcripts</span>
            </Button>
          </Link>
        </div>
        <Card className="text-center py-12 border-rose-200 bg-rose-50/50">
          <CardContent className="space-y-3">
            <AlertCircle className="h-10 w-10 text-rose-600 mx-auto" />
            <h3 className="text-base font-bold text-rose-900">Transcript Not Found</h3>
            <p className="text-xs text-rose-700 max-w-sm mx-auto">{error || 'Could not retrieve call transcript.'}</p>
            <Button size="sm" onClick={loadCall} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Map each question with its corresponding employee answer from transcripts
  const aiTurns = call.transcripts.filter((t) => t.speaker === 'ai');
  const empTurns = call.transcripts.filter((t) => t.speaker === 'employee');

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header with Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link href="/manager/transcripts">
            <Button variant="outline" size="sm" className="gap-1.5 font-medium">
              <ArrowLeft className="h-4 w-4" />
              <span>All Transcripts</span>
            </Button>
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-xs font-mono text-slate-400">ID: {call.id}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCall}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Link href={`/manager/calls/${call.id}`}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5">
              <span>View Full QA Analysis</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Employee & Call Meta Banner */}
      <Card className="border-slate-200 shadow-sm bg-gradient-to-r from-white via-slate-50/50 to-blue-50/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Employee Profile */}
            <div className="flex items-center space-x-4">
              <Avatar name={call.employee_name || 'Representative'} size="lg" status="online" />
              <div>
                <div className="flex items-center space-x-2.5">
                  <h2 className="text-lg font-bold text-slate-900">{call.employee_name || 'Representative'}</h2>
                  {getStatusBadge(call.status)}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {call.employee_email} {call.employee_phone ? `• ${call.employee_phone}` : ''}
                </p>
              </div>
            </div>

            {/* Call Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6">
              <div>
                <span className="text-slate-400 block mb-0.5">Call Date</span>
                <span className="font-semibold text-slate-800">{formatDate(call.created_at)}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Call Duration</span>
                <span className="font-mono font-bold text-slate-900">{formatDuration(call.duration_seconds)}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Dialogue Turns</span>
                <span className="font-bold text-blue-600">{call.transcripts.length} Turns ({empTurns.length} Answers)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Switcher Controls */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setViewMode('qa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors ${
              viewMode === 'qa'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ListOrdered className="h-3.5 w-3.5" />
            <span>Structured Q&A Breakdown</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('chronological')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors ${
              viewMode === 'chronological'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Full Chronological Dialogue Log</span>
          </button>
        </div>

        <span className="text-xs text-slate-400">
          {call.transcripts.length === 0 ? 'No speech turns recorded yet' : `${call.transcripts.length} speech turns`}
        </span>
      </div>

      {/* Main Transcript Content */}
      {call.transcripts.length === 0 ? (
        <Card className="text-center py-16 border-dashed border-slate-200">
          <CardContent className="space-y-2">
            <MessageSquare className="h-8 w-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Speech Transcripts Recorded Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Speech transcripts will appear here in real-time as the representative speaks during the phone assessment.
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'qa' ? (
        /* Structured Q&A Breakdown */
        <div className="space-y-4">
          {call.questions.map((q, idx) => {
            const answerTurn = empTurns[idx];

            return (
              <Card key={q.id || idx} className="border-slate-200 shadow-xs overflow-hidden">
                <CardHeader className="bg-slate-50/80 py-3 px-5 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
                        {q.question_number}
                      </span>
                      <span className="text-xs font-bold text-slate-900">Question {q.question_number} of 5</span>
                    </div>
                    {answerTurn ? (
                      <Badge variant="success" size="sm">Answered</Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">Awaiting Speech</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* AI Question Statement */}
                  <div className="flex items-start space-x-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">AI Caller</span>
                        {aiTurns[idx]?.timestamp && (
                          <span className="text-[10px] font-mono text-blue-500">{aiTurns[idx].timestamp}</span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-900">{q.question_text}</p>
                    </div>
                  </div>

                  {/* Employee Answer Statement */}
                  <div className="flex items-start space-x-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                          {call.employee_name || 'Representative'}
                        </span>
                        {answerTurn?.timestamp && (
                          <span className="text-[10px] font-mono text-slate-400">{answerTurn.timestamp}</span>
                        )}
                      </div>
                      {answerTurn ? (
                        <p className="text-xs text-slate-800 leading-relaxed font-normal">
                          "{answerTurn.text}"
                        </p>
                      ) : (
                        <p className="text-xs italic text-slate-400">
                          No answer recognized for this question yet.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Full Chronological Log */
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm">Conversation Timeline</CardTitle>
            <CardDescription>All speech-to-text turns recorded in chronological order</CardDescription>
          </CardHeader>

          <CardContent className="p-5">
            <div className="space-y-4">
              {call.transcripts.map((turn, idx) => {
                const isAi = turn.speaker === 'ai';

                return (
                  <div
                    key={turn.id || idx}
                    className={`flex items-start space-x-3 ${isAi ? '' : 'pl-4'}`}
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        isAi ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isAi ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>

                    <div
                      className={`flex-1 p-3.5 rounded-xl border ${
                        isAi
                          ? 'bg-blue-50/50 border-blue-100'
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            isAi ? 'text-blue-700' : 'text-emerald-700'
                          }`}
                        >
                          {isAi ? 'AI Assessment Caller' : call.employee_name || 'Representative'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{turn.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed">{turn.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
