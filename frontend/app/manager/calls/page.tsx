'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  PhoneCall,
  Plus,
  Trash2,
  Sparkles,
  User,
  Clock,
  Radio,
  X,
  ChevronDown,
  FileQuestion,
  Info,
} from 'lucide-react';
import { DEMO_EMPLOYEES, DEFAULT_CALL_SCENARIO, DEFAULT_CALL_QUESTIONS } from '@/lib/demo-data';

export default function CallsPage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState(DEMO_EMPLOYEES[0].id);
  const [scenarioText, setScenarioText] = React.useState(DEFAULT_CALL_SCENARIO);
  const [questions, setQuestions] = React.useState<string[]>([...DEFAULT_CALL_QUESTIONS]);
  const [isCallingModalOpen, setIsCallingModalOpen] = React.useState(false);
  const [callStatus, setCallStatus] = React.useState<'idle' | 'initiating' | 'in-progress' | 'completed'>('idle');

  // Add question
  const handleAddQuestion = () => {
    setQuestions([...questions, '']);
  };

  // Update question text
  const handleQuestionChange = (index: number, text: string) => {
    const updated = [...questions];
    updated[index] = text;
    setQuestions(updated);
  };

  // Remove question
  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  // Preset question counts
  const handleSetQuestionCount = (count: number) => {
    if (count <= DEFAULT_CALL_QUESTIONS.length) {
      setQuestions(DEFAULT_CALL_QUESTIONS.slice(0, count));
    } else {
      const extra = count - DEFAULT_CALL_QUESTIONS.length;
      const newItems = Array(extra)
        .fill('')
        .map((_, i) => `Additional assessment question #${DEFAULT_CALL_QUESTIONS.length + i + 1}`);
      setQuestions([...DEFAULT_CALL_QUESTIONS, ...newItems]);
    }
  };

  // Start Call Simulation
  const handleStartCall = () => {
    setIsCallingModalOpen(true);
    setCallStatus('initiating');
    setTimeout(() => {
      setCallStatus('in-progress');
    }, 1500);
  };

  const selectedEmployee =
    DEMO_EMPLOYEES.find((e) => e.id === selectedEmployeeId) || DEMO_EMPLOYEES[0];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <PageHeader
        title="Configure Phone Assessment Call"
        description="Select an employee, set the customer scenario, and define the exact questions the AI caller will ask during the real phone assessment."
        badge={<Badge variant="primary" dot>AI Phone Dispatch</Badge>}
      />

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Employee, Scenario & Questions Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select Target Employee */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  1
                </span>
                <CardTitle className="text-base">Target Employee</CardTitle>
              </div>
              <CardDescription>
                Select the team member who will receive the assessment phone call.
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
                    className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none font-medium"
                  >
                    {DEMO_EMPLOYEES.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} — {emp.role} (QA: {emp.qaScore}%)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Selected Employee Quick Context */}
              {selectedEmployee && (
                <div className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/75 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar name={selectedEmployee.name} size="md" status="online" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{selectedEmployee.name}</h4>
                      <p className="text-[11px] text-slate-500">{selectedEmployee.role} • {selectedEmployee.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Current QA</span>
                    <span className="text-sm font-bold text-slate-900">{selectedEmployee.qaScore}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Scenario / Context */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  2
                </span>
                <CardTitle className="text-base">Scenario & Conversation Context</CardTitle>
              </div>
              <CardDescription>
                Provide the customer background situation and inquiry details for the simulation.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <textarea
                rows={3}
                value={scenarioText}
                onChange={(e) => setScenarioText(e.target.value)}
                placeholder="Describe the caller background, intent, constraints, and questions to test..."
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none font-sans"
              />
            </CardContent>
          </Card>

          {/* Step 3: Questions the AI Caller will ask */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    3
                  </span>
                  <div>
                    <CardTitle className="text-base">Questions for the AI Caller</CardTitle>
                    <CardDescription>
                      The AI caller will naturally ask these required questions during the conversation.
                    </CardDescription>
                  </div>
                </div>

                {/* Quick Count Pills */}
                <div className="hidden sm:flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
                  <span className="text-[11px] font-semibold text-slate-400 px-2">Preset:</span>
                  {[3, 4, 5].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => handleSetQuestionCount(cnt)}
                      className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                        questions.length === cnt
                          ? 'bg-white text-blue-600 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              {questions.map((q, idx) => (
                <div key={idx} className="flex items-start space-x-2 group animate-in fade-in-50 duration-150">
                  <span className="flex h-9 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                    Q{idx + 1}
                  </span>

                  <input
                    type="text"
                    value={q}
                    onChange={(e) => handleQuestionChange(idx, e.target.value)}
                    placeholder={`Enter question #${idx + 1}...`}
                    className="flex-1 h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    disabled={questions.length <= 1}
                    className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Remove Question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddQuestion}
                  className="w-full gap-1.5 border-dashed border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Question</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Summary & Launch CTA */}
        <div className="space-y-6">
          {/* Assessment Summary Card */}
          <Card className="border-blue-200 bg-gradient-to-b from-white to-blue-50/20 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Call Summary</CardTitle>
              <CardDescription>Review simulation parameters before dispatching</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Target Representative</span>
                  <span className="font-bold text-slate-900">{selectedEmployee.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Configured Questions</span>
                  <span className="font-bold text-blue-600">{questions.length} questions</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Estimated Duration</span>
                  <span className="font-bold text-slate-900">~{questions.length + 2}-{questions.length + 4} minutes</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400 font-medium">Execution Pipeline</span>
                  <span className="font-medium text-emerald-700 flex items-center">
                    <Radio className="h-3 w-3 mr-1 text-emerald-500 animate-pulse" />
                    AI Caller → Phone → QA
                  </span>
                </div>
              </div>

              {/* Primary Call Launch CTA */}
              <div className="pt-2">
                <Button
                  onClick={handleStartCall}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-md shadow-blue-500/20"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Start Assessment Call</span>
                </Button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  The AI phone agent will dial {selectedEmployee.name} and ask the {questions.length} configured questions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Context Guide Note */}
          <Card className="bg-slate-50 border-slate-200/80">
            <CardContent className="p-4 flex items-start space-x-3 text-xs text-slate-600">
              <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">How this works</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  The AI caller calls the representative on their phone, converses naturally based on the scenario context, and ensures all configured questions are asked.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call Initiation Simulation Modal */}
      {isCallingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in-50 duration-200">
          <Card className="max-w-md w-full border-blue-200 shadow-2xl bg-white animate-in zoom-in-95 duration-150">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <PhoneCall className="h-4 w-4 animate-bounce" />
                </div>
                <div>
                  <CardTitle className="text-base">AI Phone Assessment</CardTitle>
                  <CardDescription>Live Telephony Dispatch</CardDescription>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCallingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>

            <CardContent className="p-6 text-center space-y-4">
              <div className="py-4">
                <Avatar name={selectedEmployee.name} size="xl" className="mx-auto mb-3 ring-4 ring-blue-100" />
                <h3 className="text-base font-bold text-slate-900">{selectedEmployee.name}</h3>
                <p className="text-xs text-slate-500">{selectedEmployee.role}</p>

                <div className="mt-4 inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-200">
                  <Radio className="h-3 w-3 text-blue-600 animate-ping" />
                  <span>
                    {callStatus === 'initiating' ? 'Connecting to AI Telephony Gateway...' : 'Live Assessment Call In Progress...'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 text-left border border-slate-100 space-y-1.5 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Questions Queue ({questions.length}):</p>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600">
                  {questions.slice(0, 3).map((q, i) => (
                    <li key={i} className="truncate">{q}</li>
                  ))}
                  {questions.length > 3 && (
                    <li className="text-slate-400 italic">+{questions.length - 3} more questions...</li>
                  )}
                </ol>
              </div>

              <Button
                variant="outline"
                onClick={() => setIsCallingModalOpen(false)}
                className="w-full text-xs"
              >
                Dismiss View
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
