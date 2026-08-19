'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  PhoneCall,
  Sparkles,
  User,
  Clock,
  Radio,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { getAuthToken } from '@/lib/auth';
import { fetchEmployeesApi, createCallApi, fetchManagerCallsApi } from '@/lib/calls';
import { EmployeeItem, CallSummary } from '@/types/call';

const DEFAULT_QUESTIONS = [
  'Why does the customer need the personal loan?',
  'What is the customer\'s monthly take-home income?',
  'What loan tenure do they prefer?',
  'Do they currently have any existing loans or EMIs?',
  'What concerns do they have about the monthly EMI payments?',
];

export default function CallsPage() {
  const { token, user } = useAuth();
  const [employees, setEmployees] = React.useState<EmployeeItem[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string>('');
  const [questions, setQuestions] = React.useState<string[]>([...DEFAULT_QUESTIONS]);
  const [recentCalls, setRecentCalls] = React.useState<CallSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successNotice, setSuccessNotice] = React.useState<string | null>(null);

  const activeToken = token || getAuthToken();

  const loadData = React.useCallback(async () => {
    if (!activeToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const [empList, callList] = await Promise.all([
        fetchEmployeesApi(activeToken),
        fetchManagerCallsApi(activeToken),
      ]);
      setEmployees(empList);
      if (empList.length > 0 && !selectedEmployeeId) {
        setSelectedEmployeeId(empList[0].id);
      }
      setRecentCalls(callList);
    } catch (err: any) {
      setError(err.message || 'Failed to load employees and calls data.');
    } finally {
      setIsLoading(false);
    }
  }, [activeToken, selectedEmployeeId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleQuestionChange = (index: number, text: string) => {
    const updated = [...questions];
    updated[index] = text;
    setQuestions(updated);
  };

  const handleStartCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeToken) return;

    if (!selectedEmployeeId) {
      setError('Please select an employee for the assessment call.');
      return;
    }

    const emptyIndex = questions.findIndex((q) => !q.trim());
    if (emptyIndex !== -1) {
      setError(`Question ${emptyIndex + 1} cannot be empty. Exactly 5 questions are required.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessNotice(null);

    try {
      const newCall = await createCallApi(activeToken, selectedEmployeeId, questions);
      setSuccessNotice(`Assessment Call created successfully (ID: ${newCall.id}) — ready for voice integration.`);
      // Refresh recent calls list
      const updatedCalls = await fetchManagerCallsApi(activeToken);
      setRecentCalls(updatedCalls);
    } catch (err: any) {
      setError(err.message || 'Failed to create assessment call.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

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

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
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

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page Header */}
      <PageHeader
        title="Assessment Calls"
        description="Select an employee, configure exactly 5 assessment questions, and initiate AI phone assessment calls."
        badge={<Badge variant="primary" dot>AI Phone Dispatch</Badge>}
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

      {/* Success Notification Banner */}
      {successNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start justify-between text-xs animate-in fade-in-50">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-600 hover:text-emerald-800 font-bold ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start space-x-2.5 text-xs animate-in fade-in-50">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Call Creation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Employee Selection & 5 Questions */}
        <div className="lg:col-span-2 space-y-6">
          <form id="call-form" onSubmit={handleStartCall} className="space-y-6">
            {/* Step 1: Select Employee */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    1
                  </span>
                  <CardTitle className="text-base">Target Representative</CardTitle>
                </div>
                <CardDescription>
                  Select the employee in PostgreSQL who will receive the phone call assessment.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Select Employee
                  </label>
                  <div className="relative">
                    <select
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      disabled={isLoading || employees.length === 0}
                      className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none font-medium"
                    >
                      {employees.length === 0 ? (
                        <option value="">No employees found</option>
                      ) : (
                        employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} — {emp.email}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Selected Employee Card */}
                {selectedEmployee && (
                  <div className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/75 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar name={selectedEmployee.name} size="md" status="online" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{selectedEmployee.name}</h4>
                        <p className="text-[11px] text-slate-500">{selectedEmployee.email}</p>
                      </div>
                    </div>
                    <Badge variant="neutral" size="sm">
                      ID: {selectedEmployee.id}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: 5 Configured Questions */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      2
                    </span>
                    <div>
                      <CardTitle className="text-base">5 Assessment Questions</CardTitle>
                      <CardDescription>
                        The AI caller will ask these exact 5 questions in sequential order.
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="primary" size="sm">5 Required</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                {questions.map((q, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <span className="flex h-9 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700 border border-blue-200">
                      Q{idx + 1}
                    </span>
                    <input
                      type="text"
                      required
                      value={q}
                      onChange={(e) => handleQuestionChange(idx, e.target.value)}
                      placeholder={`Assessment question #${idx + 1}...`}
                      className="flex-1 h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Right 1 Column: Call Summary & Dispatch Button */}
        <div className="space-y-6">
          <Card className="border-blue-200 bg-gradient-to-b from-white to-blue-50/20 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Assessment Summary</CardTitle>
              <CardDescription>Review call parameters before dispatching</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Target Representative</span>
                  <span className="font-bold text-slate-900">
                    {selectedEmployee?.name || '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Questions Configured</span>
                  <span className="font-bold text-blue-600">5 Questions</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Estimated Call Time</span>
                  <span className="font-bold text-slate-900">~6-8 minutes</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400 font-medium">Status on Creation</span>
                  <span className="font-medium text-emerald-700 flex items-center">
                    <Radio className="h-3 w-3 mr-1 text-emerald-500 animate-pulse" />
                    Ready in Database
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  form="call-form"
                  type="submit"
                  size="lg"
                  isLoading={isSubmitting}
                  disabled={!selectedEmployeeId || isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-md shadow-blue-500/20"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Start Assessment Call</span>
                </Button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Creates the call record with 5 questions in PostgreSQL.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Assessment Calls Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Assessment Calls</CardTitle>
              <CardDescription>
                Calls created and recorded for representative evaluations
              </CardDescription>
            </div>
            <Badge variant="neutral" size="sm">{recentCalls.length} Total</Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {recentCalls.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
              <PhoneCall className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No assessment calls created yet</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure 5 questions above and click "Start Assessment Call" to create your first call.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pl-2">Employee</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Questions</th>
                    <th className="pb-3">Created Date</th>
                    <th className="pb-3">Duration</th>
                    <th className="pb-3 pr-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentCalls.map((call) => (
                    <tr key={call.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center space-x-2.5">
                          <Avatar name={call.employee_name || 'Employee'} size="sm" />
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {call.employee_name || 'Unnamed Employee'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {call.employee_email || call.employee_id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        {getStatusBadge(call.status)}
                      </td>
                      <td className="py-3.5 text-slate-600 font-medium">
                        {call.questions_count || 5} Questions
                      </td>
                      <td className="py-3.5 text-slate-500">
                        {formatDate(call.created_at)}
                      </td>
                      <td className="py-3.5 text-slate-500 font-mono">
                        {formatDuration(call.duration_seconds)}
                      </td>
                      <td className="py-3.5 pr-2 text-right">
                        <Link
                          href={`/manager/calls/${call.id}`}
                          className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700 group-hover:underline"
                        >
                          <span>View Details</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
