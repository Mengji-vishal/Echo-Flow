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
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  Award,
  AlertTriangle,
  X,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { DEMO_EMPLOYEES, Employee } from '@/lib/demo-data';

export default function ManagerDashboardPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);

  // Filter employees based on search query
  const filteredEmployees = React.useMemo(() => {
    if (!searchQuery.trim()) return DEMO_EMPLOYEES;
    return DEMO_EMPLOYEES.filter((emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.strongestSkill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.weakestSkill.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
  };

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
          value="82.4%"
          trend="+4.2%"
          trendType="positive"
          caption="vs previous period"
          icon={ShieldCheck}
          iconVariant="blue"
        />

        <KPICard
          title="Calls Analyzed"
          value="1,284"
          trend="+12.8%"
          trendType="positive"
          caption="vs previous period"
          icon={PhoneCall}
          iconVariant="emerald"
        />

        <KPICard
          title="Avg Call Duration"
          value="6m 14s"
          trend="-18s"
          trendType="positive"
          caption="vs previous period"
          icon={Clock}
          iconVariant="indigo"
        />
      </div>

      {/* Prominent Employee Search Section */}
      <Card className="border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/30 shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Quick Lookup
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">Instant employee scorecard</span>
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
                placeholder="Search by employee name, skill, or role..."
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

          {/* Quick Filter Search Results Pills if searching */}
          {searchQuery && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
              <span className="text-xs font-medium text-slate-400 self-center mr-1">Matches:</span>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => handleSelectEmployee(emp)}
                    className="inline-flex items-center space-x-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <Avatar name={emp.name} size="sm" className="h-4 w-4 text-[9px]" />
                    <span>{emp.name}</span>
                    <span className="font-semibold text-slate-900">{emp.qaScore}%</span>
                  </button>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No team members match &quot;{searchQuery}&quot;</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Employee Detailed Overview Card */}
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
                <CardDescription>{selectedEmployee.role} • {selectedEmployee.department}</CardDescription>
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
                onClick={() => setSelectedEmployee(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
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
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Recent Evaluation
                </span>
                <div className="mt-1 flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-blue-600">{selectedEmployee.recentAssessmentScore}%</span>
                  <span className="text-xs text-slate-400">latest call</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  <Award className="h-3.5 w-3.5" />
                  <span>Strongest Skill</span>
                </div>
                <p className="mt-1 text-sm font-bold text-emerald-900 truncate">
                  {selectedEmployee.strongestSkill}
                </p>
                <span className="text-[11px] text-emerald-700">Top evaluated dimension</span>
              </div>

              <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-100">
                <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Needs Improvement</span>
                </div>
                <p className="mt-1 text-sm font-bold text-amber-900 truncate">
                  {selectedEmployee.weakestSkill}
                </p>
                <span className="text-[11px] text-amber-700">Identified focus area</span>
              </div>
            </div>

            {/* Performance Trend & Recent Evaluations row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              {/* Recent Performance Trend */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  4-Week Performance Trend
                </h4>
                <div className="space-y-2">
                  {selectedEmployee.performanceHistory.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-600">{item.period}</span>
                        <span className="font-bold text-slate-900">{item.score}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Evaluations List */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Recent Call Evaluations
                </h4>
                <div className="space-y-2.5">
                  {selectedEmployee.recentEvaluations.map((evalItem) => (
                    <div
                      key={evalItem.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <PhoneCall className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{evalItem.callTitle}</p>
                          <p className="text-[11px] text-slate-400">{evalItem.date} • {evalItem.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {evalItem.score}%
                        </span>
                        <Badge variant="success" size="sm" className="text-[10px] py-0">
                          {evalItem.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Section: Performance Overview + Employee Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Performance Overview Chart */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Team QA Trend</CardTitle>
                <CardDescription>Overall performance trajectory</CardDescription>
              </div>
              <Badge variant="success" size="sm">+4.2%</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-4 my-auto">
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
                <span className="text-3xl font-bold text-slate-900">82.4%</span>
                <span className="text-xs text-slate-500 font-medium">Target: 85.0%</span>
              </div>

              {/* Sparkline / Visual Weekly Bars */}
              <div className="space-y-3 pt-2">
                {[
                  { week: 'Week 1', score: 76.5, label: '76.5%' },
                  { week: 'Week 2', score: 78.2, label: '78.2%' },
                  { week: 'Week 3', score: 80.0, label: '80.0%' },
                  { week: 'Week 4 (Current)', score: 82.4, label: '82.4%', highlight: true },
                ].map((bar, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={bar.highlight ? 'font-semibold text-blue-700' : 'text-slate-600'}>
                        {bar.week}
                      </span>
                      <span className="font-bold text-slate-900">{bar.label}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={bar.highlight ? 'h-full bg-blue-600 rounded-full' : 'h-full bg-slate-400 rounded-full'}
                        style={{ width: `${bar.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mr-1" />
                Benchmark met
              </span>
              <span>1,284 total calls</span>
            </div>
          </CardContent>
        </Card>

        {/* Employee Performance Cards Grid */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Employee Performance</CardTitle>
              <CardDescription>
                Select any team member to inspect strengths and evaluation dimensions
              </CardDescription>
            </div>
            <Link href="/manager/analytics">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700 gap-1">
                <span>View All Analytics</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredEmployees.map((emp) => {
                const isSelected = selectedEmployee?.id === emp.id;

                return (
                  <div
                    key={emp.id}
                    onClick={() => handleSelectEmployee(emp)}
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
                        <span className="text-sm font-bold text-slate-900">{emp.qaScore}%</span>
                        <div className="flex items-center justify-end text-[10px] font-semibold text-emerald-600">
                          <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                          {emp.trend}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Strength</span>
                        <span className="text-slate-700 font-medium truncate block">{emp.strongestSkill}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Focus</span>
                        <span className="text-amber-700 font-medium truncate block">{emp.weakestSkill}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
