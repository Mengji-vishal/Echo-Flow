'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import {
  Search,
  TrendingUp,
  Award,
  AlertTriangle,
  PhoneCall,
  X,
  Target,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { getAuthToken } from '@/lib/auth';
import { fetchTeamAnalyticsApi, TeamAnalyticsData } from '@/lib/employee';

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const empParam = searchParams.get('emp');
  const { token } = useAuth();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [teamData, setTeamData] = React.useState<TeamAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string>(empParam || '');

  const activeToken = token || getAuthToken();

  React.useEffect(() => {
    if (!activeToken) return;
    setIsLoading(true);
    fetchTeamAnalyticsApi(activeToken)
      .then((data) => {
        setTeamData(data);
        if (data.employees && data.employees.length > 0) {
          if (empParam && data.employees.some((e) => e.id === empParam)) {
            setSelectedEmployeeId(empParam);
          } else {
            setSelectedEmployeeId(data.employees[0].id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [activeToken, empParam]);

  const displayEmployees = React.useMemo(() => {
    if (!teamData?.employees) return [];
    return teamData.employees.map((e) => ({
      id: e.id,
      name: e.name,
      email: e.email,
      role: e.role || 'Sales Representative',
      department: 'Lending Operations',
      qaScore: e.qa_score,
      totalCalls: e.total_calls,
      strongestSkill: e.strongest_skill || 'N/A',
      weakestSkill: e.weakest_skill || 'N/A',
      skills: {
        empathy: e.skills?.empathy ?? 0,
        communication: e.skills?.communication ?? 0,
        discovery: e.skills?.discovery ?? 0,
        objectionHandling: e.skills?.objectionHandling ?? 0,
        solutionOffering: e.skills?.solutionOffering ?? 0,
        closing: e.skills?.closing ?? 0,
        compliance: e.skills?.compliance ?? 0,
      },
    }));
  }, [teamData]);

  const filteredEmployees = React.useMemo(() => {
    if (!searchQuery.trim()) return displayEmployees;
    return displayEmployees.filter((emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.strongestSkill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.weakestSkill.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, displayEmployees]);

  const selectedEmployee =
    displayEmployees.find((e) => e.id === selectedEmployeeId) || displayEmployees[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Employee Performance Analytics"
        description="Comprehensive QA scorecards, multi-dimensional skill evaluations, and performance tracking across all verified phone assessments."
        badge={<Badge variant="primary" dot>{teamData ? `${teamData.team_size} Team Members` : 'Live Telephony Analytics'}</Badge>}
      />

      {/* Top Search & Filter Bar */}
      <Card className="bg-white shadow-sm border-slate-200/80">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employee by name or skill..."
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{filteredEmployees.length}</span> team members
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Cards Selector */}
      {displayEmployees.length === 0 ? (
        <Card className="p-8 text-center bg-white border-dashed border-slate-200">
          <Users className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No team members registered yet</h3>
          <p className="text-xs text-slate-500 mt-1">Employees will appear here once registered.</p>
        </Card>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Select Employee to Inspect
            </h3>
            <span className="text-xs text-slate-400">Click any card to view scorecard</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {filteredEmployees.map((emp) => {
              const isSelected = emp.id === selectedEmployee?.id;

              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployeeId(emp.id)}
                  className={`group relative p-3.5 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Avatar name={emp.name} size="sm" />
                      <span className="text-sm font-bold text-slate-900">{emp.qaScore}%</span>
                    </div>

                    <h4 className={`text-xs font-bold transition-colors truncate ${
                      isSelected ? 'text-blue-700' : 'text-slate-900 group-hover:text-blue-600'
                    }`}>
                      {emp.name}
                    </h4>
                    <div className="flex items-center space-x-1 mt-0.5 text-[10px] text-slate-500">
                      <span>{emp.totalCalls} calls</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100/80 space-y-1 text-[10px]">
                    <div className="truncate text-slate-600">
                      <span className="text-slate-400 font-medium mr-1">Strength:</span>
                      <span className="font-semibold text-slate-700">{emp.strongestSkill}</span>
                    </div>
                    <div className="truncate text-amber-700">
                      <span className="text-slate-400 font-medium mr-1">Focus:</span>
                      <span className="font-semibold text-amber-800">{emp.weakestSkill}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Employee Analytics Workspace */}
      {selectedEmployee && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Profile & Scorecard Summary Header */}
          <Card className="border-blue-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center space-x-4">
                  <Avatar name={selectedEmployee.name} size="xl" status="online" className="ring-4 ring-blue-50" />
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h2 className="text-xl font-bold text-slate-900">{selectedEmployee.name}</h2>
                      <Badge variant="primary" size="sm">Scorecard Profile</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedEmployee.role} • {selectedEmployee.department} • {selectedEmployee.totalCalls} Calls Evaluated
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Link href="/manager/calls">
                    <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700">
                      <PhoneCall className="h-4 w-4" />
                      <span>Configure Assessment Call</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Metric Overview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-400 font-medium block mb-1">Overall QA Rating</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-slate-900">{selectedEmployee.qaScore}%</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-400 font-medium block mb-1">Highest Competency</span>
                  <div className="flex items-center space-x-1.5">
                    <Award className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-bold text-slate-800 truncate">{selectedEmployee.strongestSkill}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-400 font-medium block mb-1">Top Improvement Area</span>
                  <div className="flex items-center space-x-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-bold text-slate-800 truncate">{selectedEmployee.weakestSkill}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-400 font-medium block mb-1">Evaluated Calls</span>
                  <span className="text-2xl font-bold text-slate-900">{selectedEmployee.totalCalls}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7 Skill Breakdown */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span>Multi-Dimensional Competency Scores</span>
              </CardTitle>
              <CardDescription>Verified skill benchmarks across 7 core sales evaluation dimensions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(selectedEmployee.skills).map(([skill, score]) => (
                <div key={skill} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 capitalize">
                      {skill.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="font-mono font-bold text-slate-900">{score}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        score >= 85 ? 'bg-emerald-500' : score >= 75 ? 'bg-blue-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-slate-400">Loading Analytics...</div>}>
      <AnalyticsContent />
    </React.Suspense>
  );
}
