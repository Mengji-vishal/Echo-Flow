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
  Phone,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { getAuthToken } from '@/lib/auth';
import { fetchEmployeesApi, updateEmployeePhoneApi, createCallApi, fetchManagerCallsApi } from '@/lib/calls';
import { EmployeeItem, CallSummary } from '@/types/call';

const DEFAULT_QUESTIONS = [
  'Why does the customer need the personal loan?',
  'What is the customer\'s monthly take-home income?',
  'What loan tenure do they prefer?',
  'Do they currently have any existing loans or EMIs?',
  'What concerns do they have about the monthly EMI payments?',
];

// E.164 phone regex (+ followed by 7 to 15 digits)
const E164_REGEX = /^\+[1-9]\d{6,14}$/;

export default function CallsPage() {
  const { token, user } = useAuth();
  const [employees, setEmployees] = React.useState<EmployeeItem[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string>('');
  const [phoneNumber, setPhoneNumber] = React.useState<string>('');
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
      if (empList.length > 0) {
        const initialId = selectedEmployeeId || empList[0].id;
        setSelectedEmployeeId(initialId);
        const matchingEmp = empList.find((e) => e.id === initialId) || empList[0];
        setPhoneNumber(matchingEmp.phone_number || '');
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

  const handleSelectEmployee = (empId: string) => {
    setSelectedEmployeeId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      setPhoneNumber(emp.phone_number || '');
    }
    setError(null);
  };

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

    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone) {
      setError('Employee Phone Number is required. Please enter the representative\'s phone number in E.164 format (e.g. +916300428734) to initiate the phone call.');
      return;
    }

    if (!E164_REGEX.test(cleanPhone)) {
      setError('Invalid phone number format. Phone number must be in international E.164 format starting with "+" followed by country code (e.g. +916300428734 or +17372508034).');
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
      // 1. Save/update the employee's phone number in PostgreSQL if changed or new
      const currentEmp = employees.find((e) => e.id === selectedEmployeeId);
      if (!currentEmp?.phone_number || currentEmp.phone_number !== cleanPhone) {
        const updatedEmp = await updateEmployeePhoneApi(activeToken, selectedEmployeeId, cleanPhone);
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === updatedEmp.id ? { ...emp, phone_number: updatedEmp.phone_number } : emp))
        );
      }

      // 2. Create and initiate the assessment call via Twilio Voice
      const newCall = await createCallApi(activeToken, selectedEmployeeId, questions);
      setSuccessNotice(`Assessment Call dispatched successfully (Call ID: ${newCall.id}) to ${cleanPhone}. Employee phone is ringing!`);

      // 3. Refresh recent calls list
      const updatedCalls = await fetchManagerCallsApi(activeToken);
      setRecentCalls(updatedCalls);
    } catch (err: any) {
      setError(err.message || 'Failed to initiate assessment call.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const isValidPhone = phoneNumber.trim() && E164_REGEX.test(phoneNumber.trim());

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
        description="Select an employee, verify their phone number, configure 5 assessment questions, and initiate AI phone assessments."
        badge={<Badge variant="primary" dot>Twilio Voice Dispatch</Badge>}
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

      {/* Error / Failure Banner with Action */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in-50">
          <div className="flex items-start space-x-2.5">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900">Dispatch Failure</p>
              <p className="text-rose-700 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={(e) => handleStartCall(e as any)}
              disabled={isSubmitting}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center space-x-1 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry Dispatch</span>
            </button>
            <button
              type="button"
              onClick={() => setError(null)}
              className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold rounded-lg text-xs transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Call Creation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Employee Selection & 5 Questions */}
        <div className="lg:col-span-2 space-y-6">
          <form id="call-form" onSubmit={handleStartCall} className="space-y-6">
            {/* Step 1: Select Employee & Phone Number */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    1
                  </span>
                  <CardTitle className="text-base">Target Representative & Phone</CardTitle>
                </div>
                <CardDescription>
                  Select the employee and specify their phone number in international E.164 format.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Employee Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Select Employee
                  </label>
                  <div className="relative">
                    <select
                      value={selectedEmployeeId}
                      onChange={(e) => handleSelectEmployee(e.target.value)}
                      disabled={isLoading || employees.length === 0}
                      className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none font-medium"
                    >
                      {employees.length === 0 ? (
                        <option value="">No employees found</option>
                      ) : (
                        employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} — {emp.email} {emp.phone_number ? `(${emp.phone_number})` : ''}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Employee Phone Number Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Employee Phone Number (E.164 Format)
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">e.g. +916300428734</span>
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="+916300428734"
                      className="w-full h-10 rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 font-mono placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <HelpCircle className="h-3 w-3 text-slate-400 shrink-0" />
                    <span>Saved automatically to representative profile in PostgreSQL upon call initiation.</span>
                  </p>
                </div>

                {/* Selected Employee Card Preview */}
                {selectedEmployee && (
                  <div className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/75 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar name={selectedEmployee.name} size="md" status="online" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{selectedEmployee.name}</h4>
                        <p className="text-[11px] text-slate-500">
                          {selectedEmployee.email} • Target: <span className="font-mono text-slate-700 font-bold">{phoneNumber.trim() || 'No phone set'}</span>
                        </p>
                      </div>
                    </div>
                    <Badge variant={isValidPhone ? 'primary' : 'warning'} size="sm">
                      {isValidPhone ? 'Valid E.164' : 'Needs Valid Phone'}
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
              <CardTitle className="text-base">Assessment Dispatch</CardTitle>
              <CardDescription>Review call parameters before dialing</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Representative</span>
                  <span className="font-bold text-slate-900">
                    {selectedEmployee?.name || '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Destination Phone</span>
                  <span className="font-mono font-bold text-blue-600 truncate max-w-[140px]">
                    {phoneNumber.trim() || '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Questions Configured</span>
                  <span className="font-bold text-slate-900">5 Questions</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Telephony Provider</span>
                  <span className="font-semibold text-slate-800">Twilio Programmable Voice</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400 font-medium">Dispatch Status</span>
                  {error ? (
                    <span className="font-semibold text-rose-700 flex items-center">
                      <AlertCircle className="h-3.5 w-3.5 mr-1 text-rose-500" />
                      Dispatch Failed
                    </span>
                  ) : isSubmitting ? (
                    <span className="font-semibold text-blue-700 flex items-center">
                      <RefreshCw className="h-3.5 w-3.5 mr-1 text-blue-500 animate-spin" />
                      Placing Outbound Call...
                    </span>
                  ) : successNotice ? (
                    <span className="font-semibold text-emerald-700 flex items-center">
                      <Radio className="h-3.5 w-3.5 mr-1 text-emerald-500 animate-pulse" />
                      Calling Representative
                    </span>
                  ) : isValidPhone ? (
                    <span className="font-medium text-emerald-700 flex items-center">
                      <Radio className="h-3 w-3 mr-1 text-emerald-500" />
                      Ready for Outbound Call
                    </span>
                  ) : (
                    <span className="font-medium text-amber-700 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
                      Awaiting Valid Phone
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  form="call-form"
                  type="submit"
                  size="lg"
                  isLoading={isSubmitting}
                  disabled={!selectedEmployeeId || !isValidPhone || isSubmitting}
                  className={`w-full text-white font-bold gap-2 shadow-md ${
                    error
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  }`}
                >
                  {error ? (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      <span>Retry Assessment Call</span>
                    </>
                  ) : (
                    <>
                      <PhoneCall className="h-4 w-4" />
                      <span>Start Assessment Call</span>
                    </>
                  )}
                </Button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Initiates an outbound phone call to the representative.
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
                              {call.employee_email || call.employee_id} {call.employee_phone ? `(${call.employee_phone})` : ''}
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
