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
  CheckCircle2,
  Calendar,
  X,
  Target,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { DEMO_EMPLOYEES, Employee } from '@/lib/demo-data';

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const empParam = searchParams.get('emp');

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string>(
    empParam || DEMO_EMPLOYEES[0].id
  );

  React.useEffect(() => {
    if (empParam) {
      setSelectedEmployeeId(empParam);
    }
  }, [empParam]);

  const filteredEmployees = React.useMemo(() => {
    if (!searchQuery.trim()) return DEMO_EMPLOYEES;
    return DEMO_EMPLOYEES.filter((emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.strongestSkill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.weakestSkill.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const selectedEmployee: Employee =
    DEMO_EMPLOYEES.find((e) => e.id === selectedEmployeeId) || DEMO_EMPLOYEES[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Employee Performance Analytics"
        description="Comprehensive QA scorecards, multi-dimensional skill evaluations, performance trends, and improvement tracking across all phone assessments."
        badge={<Badge variant="primary" dot>Evaluation Dimensions</Badge>}
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
                placeholder="Search employee by name, evaluation skill, or role..."
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
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Select Employee to Inspect
          </h3>
          <span className="text-xs text-slate-400">Click any card to view scorecard</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {filteredEmployees.map((emp) => {
            const isSelected = emp.id === selectedEmployee.id;

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
                  <div className="flex items-center space-x-1 mt-0.5 text-[10px] text-emerald-600 font-semibold">
                    <TrendingUp className="h-2.5 w-2.5" />
                    <span>{emp.trend}</span>
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

      {/* Detailed Employee Analytics Workspace */}
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
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Overall QA Score
                </span>
                <div className="mt-1 flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-slate-900">{selectedEmployee.qaScore}%</span>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                    {selectedEmployee.trend}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Aggregated benchmark</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Recent Evaluation
                </span>
                <div className="mt-1 flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-blue-600">{selectedEmployee.recentAssessmentScore}%</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Latest phone simulation</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  <Award className="h-3.5 w-3.5" />
                  <span>Key Strength</span>
                </div>
                <p className="mt-1 text-sm font-bold text-emerald-900 truncate">
                  {selectedEmployee.strongestSkill}
                </p>
                <span className="text-[11px] text-emerald-700 block">Top evaluation dimension</span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                <div className="flex items-center space-x-1 text-xs font-semibold uppercase tracking-wider text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Needs Improvement</span>
                </div>
                <p className="mt-1 text-sm font-bold text-amber-900 truncate">
                  {selectedEmployee.weakestSkill}
                </p>
                <span className="text-[11px] text-amber-700 block">Identified coaching priority</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Evaluation Dimensions & Progression */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evaluation Dimensions Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Evaluation Dimensions</CardTitle>
                  <CardDescription>Multi-dimensional scoring criteria measured by AI QA</CardDescription>
                </div>
                <Badge variant="neutral" size="sm">{selectedEmployee.skills.length} Criteria</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3.5 pt-0">
              {selectedEmployee.skills.map((dimension, i) => {
                const isHigh = dimension.score >= 88;
                const isLow = dimension.score < 75;

                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{dimension.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{dimension.score}%</span>
                        {isHigh && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Strong
                          </span>
                        )}
                        {isLow && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            Focus
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHigh ? 'bg-emerald-500' : isLow ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${dimension.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Performance History & Recent Call Log */}
          <div className="space-y-6">
            {/* 4-Week Trend */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Performance Trajectory</CardTitle>
                    <CardDescription>4-week aggregated QA score progression</CardDescription>
                  </div>
                  <Badge variant="success" size="sm">+8.0% Net Growth</Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {selectedEmployee.performanceHistory.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">{item.period}</span>
                      <span className="text-lg font-bold text-slate-900 my-1">{item.score}%</span>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Evaluated Calls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent Evaluations</CardTitle>
                <CardDescription>Latest simulated call assessments & scorecard results</CardDescription>
              </CardHeader>

              <CardContent className="space-y-2 pt-0">
                {selectedEmployee.recentEvaluations.map((evaluation) => (
                  <div
                    key={evaluation.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/75 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <PhoneCall className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{evaluation.callTitle}</p>
                        <p className="text-[11px] text-slate-500">{evaluation.date} • {evaluation.duration}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs">
                        QA: {evaluation.score}%
                      </span>
                      <Badge variant="success" size="sm">
                        {evaluation.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading Analytics...</div>}>
      <AnalyticsContent />
    </React.Suspense>
  );
}
