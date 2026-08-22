'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { KPICard } from '@/components/ui/KPICard';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  PhoneCall,
  Clock,
  Search,
  ArrowUpRight,
  ChevronRight,
  Award,
  AlertTriangle,
  X,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { getAuthToken } from '@/lib/auth';
import { fetchTeamAnalyticsApi, TeamAnalyticsData } from '@/lib/employee';
import { fetchManagerCallsApi } from '@/lib/calls';
import { CallSummary } from '@/types/call';

export default function ManagerDashboardPage() {
  const { token } = useAuth();
  const activeToken = token || getAuthToken();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [teamData, setTeamData] = React.useState<TeamAnalyticsData | null>(null);
  const [calls, setCalls] = React.useState<CallSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!activeToken) return;
    setIsLoading(true);

    Promise.all([
      fetchTeamAnalyticsApi(activeToken).catch(() => null),
      fetchManagerCallsApi(activeToken).catch(() => []),
    ])
      .then(([teamRes, callsRes]) => {
        if (teamRes) setTeamData(teamRes);
        if (callsRes) setCalls(callsRes);
      })
      .finally(() => setIsLoading(false));
  }, [activeToken]);

  const teamEmployees = React.useMemo(() => {
    return teamData?.employees || [];
  }, [teamData]);

  const filteredEmployees = React.useMemo(() => {
    if (!searchQuery.trim()) return teamEmployees;
    return teamEmployees.filter((emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.strongest_skill && emp.strongest_skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (emp.weakest_skill && emp.weakest_skill.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, teamEmployees]);

  const selectedEmployee = React.useMemo(() => {
    if (!selectedEmployeeId) return null;
    return teamEmployees.find((e) => e.id === selectedEmployeeId) || null;
  }, [selectedEmployeeId, teamEmployees]);

  // Derived metrics from real database
  const teamQaScore = teamData?.team_average_score ?? 0;
  const completedCalls = calls.filter((c) => c.status === 'completed');
  const callsAnalyzedCount = completedCalls.length;

  const totalDuration = completedCalls.reduce((acc, c) => acc + (c.duration_seconds || 0), 0);
  const avgDurationSeconds = callsAnalyzedCount > 0 ? Math.round(totalDuration / callsAnalyzedCount) : 0;
  const avgDurationFormatted =
    avgDurationSeconds > 0
      ? `${Math.floor(avgDurationSeconds / 60)}m ${avgDurationSeconds % 60}s`
      : '0s';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Manager Dashboard"
        description="Real-time call center QA oversight, team performance tracking, and AI phone assessment intelligence."
        badge={<Badge variant="primary" dot>Live Operations</Badge>}
      />

      {/* Team KPI Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard
          title="Team QA Score"
          value={isLoading ? '...' : `${teamQaScore}%`}
          trend={`${teamEmployees.length} employees`}
          trendType="neutral"
          caption="from verified assessments"
          icon={ShieldCheck}
          iconVariant="blue"
        />

        <KPICard
          title="Calls Analyzed"
          value={isLoading ? '...' : `${callsAnalyzedCount}`}
          trend={`${calls.length} total initiated`}
          trendType="neutral"
          caption="completed evaluations"
          icon={PhoneCall}
          iconVariant="emerald"
        />

        <KPICard
          title="Avg Call Duration"
          value={isLoading ? '...' : avgDurationFormatted}
          trend={`${totalDuration}s total duration`}
          trendType="neutral"
          caption="across completed calls"
          icon={Clock}
          iconVariant="indigo"
        />
      </div>

      {/* Employee Search Section */}
      <Card className="border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/30 shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Quick Lookup
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">Live employee scorecards</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Search Team Members
              </h3>
            </div>

            <div className="relative w-full md:w-80 lg:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by employee name or skill..."
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Matches Pills */}
          {searchQuery && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
              <span className="text-xs font-medium text-slate-400 self-center mr-1">Matches:</span>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className="inline-flex items-center space-x-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <Avatar name={emp.name} size="sm" className="h-4 w-4 text-[9px]" />
                    <span>{emp.name}</span>
                    <span className="font-semibold text-slate-900">{emp.qa_score}%</span>
                  </button>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No team members match &quot;{searchQuery}&quot;</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Employee Card */}
      {selectedEmployee && (
        <Card className="border-blue-200 bg-white shadow-md animate-in fade-in-50 duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3.5">
              <Avatar name={selectedEmployee.name} size="lg" status="online" />
              <div>
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-lg">{selectedEmployee.name}</CardTitle>
                  <Badge variant="primary" size="sm">Scorecard</Badge>
                </div>
                <CardDescription>{selectedEmployee.role} • {selectedEmployee.email}</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/manager/analytics?emp=${selectedEmployee.id}`}>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <span>Full Analytics</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => setSelectedEmployeeId(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Overall QA Score
                </span>
                <div className="mt-1 flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-slate-900">{selectedEmployee.qa_score}%</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Calls
                </span>
                <div className="mt-1 flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-blue-600">{selectedEmployee.total_calls}</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  <Award className="h-3.5 w-3.5" />
                  <span>Strongest Skill</span>
                </div>
                <p className="mt-1 text-sm font-bold text-emerald-900 truncate">
                  {selectedEmployee.strongest_skill}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-100">
                <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Focus Area</span>
                </div>
                <p className="mt-1 text-sm font-bold text-amber-900 truncate">
                  {selectedEmployee.weakest_skill}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Section: Team Overview + Employee Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Overview Card */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Team Overview</CardTitle>
            <CardDescription>Live evaluated metrics from PostgreSQL</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-3xl font-bold text-slate-900">{teamQaScore}%</span>
              <p className="text-xs text-slate-500 font-medium mt-1">Average QA Performance</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Registered Team Members</span>
                <span className="font-semibold text-slate-900">{teamEmployees.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Completed Assessments</span>
                <span className="font-semibold text-slate-900">{callsAnalyzedCount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Total Calls Initiated</span>
                <span className="font-semibold text-slate-900">{calls.length}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <Link href="/manager/calls">
                <Button size="sm" className="w-full justify-center bg-blue-600 hover:bg-blue-700">
                  <PhoneCall className="h-4 w-4 mr-1.5" />
                  <span>Start New Assessment</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Employee Performance Cards Grid */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Team Members</CardTitle>
              <CardDescription>
                Select any employee to view scorecard details
              </CardDescription>
            </div>
            <Link href="/manager/analytics">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700 gap-1">
                <span>View Analytics</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {teamEmployees.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg">
                <Users className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No team members found in the database.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredEmployees.map((emp) => {
                  const isSelected = selectedEmployeeId === emp.id;

                  return (
                    <div
                      key={emp.id}
                      onClick={() => setSelectedEmployeeId(emp.id)}
                      className={`group relative p-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                          : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <Avatar name={emp.name} size="sm" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {emp.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 truncate max-w-[130px]">{emp.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900">{emp.qa_score}%</span>
                          <div className="text-[10px] text-slate-400">
                            {emp.total_calls} calls
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-medium">Strength</span>
                          <span className="text-slate-700 font-medium truncate block">{emp.strongest_skill}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-medium">Focus</span>
                          <span className="text-amber-700 font-medium truncate block">{emp.weakest_skill}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
