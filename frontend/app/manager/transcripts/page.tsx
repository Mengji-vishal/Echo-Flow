'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  FileText,
  Search,
  RefreshCw,
  PhoneCall,
  Clock,
  Calendar,
  ChevronRight,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { getAuthToken } from '@/lib/auth';
import { fetchManagerCallsApi } from '@/lib/calls';
import { CallSummary } from '@/types/call';

export default function TranscriptsPage() {
  const { token } = useAuth();
  const [calls, setCalls] = React.useState<CallSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const activeToken = token || getAuthToken();

  const loadData = React.useCallback(async () => {
    if (!activeToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchManagerCallsApi(activeToken);
      setCalls(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load call transcripts.');
    } finally {
      setIsLoading(false);
    }
  }, [activeToken]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (isoStr: string) => {
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

  const filteredCalls = calls.filter((call) => {
    const nameMatch = (call.employee_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = (call.employee_email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const queryMatch = nameMatch || emailMatch;

    if (statusFilter === 'all') return queryMatch;
    return queryMatch && call.status === statusFilter;
  });

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Page Header */}
      <PageHeader
        title="Assessment Transcripts"
        description="Review speech-to-text recorded dialogues between AI caller and sales representatives."
        badge={<Badge variant="primary" dot>{calls.length} Total Calls</Badge>}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            isLoading={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        }
      />

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-2.5 text-xs">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by representative name or email..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {['all', 'completed', 'in_progress', 'failed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Transcripts Cards Grid */}
      {filteredCalls.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-slate-200">
          <CardContent className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Assessment Transcripts Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? 'No calls match your search query. Try searching for a different employee.'
                : 'Start an assessment call from the Manager Calls page to generate conversation transcripts.'}
            </p>
            <div className="pt-2">
              <Link href="/manager/calls">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2">
                  <PhoneCall className="h-4 w-4" />
                  <span>Start New Assessment</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCalls.map((call) => (
            <Card
              key={call.id}
              className="hover:shadow-md transition-shadow border-slate-200 flex flex-col justify-between"
            >
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar name={call.employee_name || 'Representative'} size="md" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{call.employee_name || 'Representative'}</h4>
                      <p className="text-[11px] text-slate-500">{call.employee_email || call.employee_id}</p>
                    </div>
                  </div>
                  {getStatusBadge(call.status)}
                </div>
              </CardHeader>

              <CardContent className="py-4 space-y-3.5 text-xs">
                {/* Meta details */}
                <div className="space-y-2 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Date</span>
                    </span>
                    <span className="font-medium text-slate-800">{formatDate(call.created_at)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Duration</span>
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatDuration(call.duration_seconds)}
                    </span>
                  </div>

                  {call.employee_phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        <span>Phone</span>
                      </span>
                      <span className="font-mono text-slate-700 font-semibold">{call.employee_phone}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                      <span>Questions</span>
                    </span>
                    <span className="font-bold text-blue-600">
                      {call.questions_count || 5} Questions {call.status === 'completed' ? '• 5 Answers' : ''}
                    </span>
                  </div>
                </div>

                {/* View Transcript Button */}
                <div className="pt-2">
                  <Link href={`/manager/transcripts/${call.id}`} className="block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 font-semibold"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-blue-600" />
                        <span>View Transcript</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
