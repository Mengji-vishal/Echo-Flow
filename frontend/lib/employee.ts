import { API_BASE_URL, formatErrorMessage } from './auth';
import { CallSummary, CallDetail } from '@/types/call';

export interface EmployeePerformanceSummary {
  employee_id: string;
  employee_name: string;
  employee_email: string;
  total_calls: number;
  completed_calls: number;
  average_score: number;
  latest_score?: number | null;
  metrics_averages: Record<string, number>;
  top_strengths: string[];
  focus_areas: string[];
  recent_evaluations: Array<{
    id: string;
    date?: string | null;
    score?: number | null;
    duration_seconds?: number | null;
    status: string;
  }>;
  recommended_modules_count: number;
}

export interface TrainingModuleItem {
  id: string;
  employee_id: string;
  source_call_id?: string | null;
  title: string;
  description: string;
  skill_area: string;
  difficulty: string;
  estimated_duration: string;
  why_recommended?: string | null;
  learning_objectives: string[];
  content: {
    summary?: string;
    steps?: Array<{ title: string; detail: string }>;
  };
  progress: number;
  status: 'active' | 'in_progress' | 'completed';
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TeamAnalyticsData {
  team_size: number;
  team_average_score: number;
  team_competency_breakdown: Record<string, number>;
  employees: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    qa_score: number;
    latest_score: number;
    total_calls: number;
    strongest_skill: string;
    weakest_skill: string;
    skills: Record<string, number>;
  }>;
}

export async function fetchEmployeePerformanceApi(token: string): Promise<EmployeePerformanceSummary> {
  const res = await fetch(`${API_BASE_URL}/employee/performance`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(formatErrorMessage(data.detail || data.message, 'Failed to fetch employee performance.'));
  }

  return data as EmployeePerformanceSummary;
}

export async function fetchEmployeeTrainingApi(token: string): Promise<TrainingModuleItem[]> {
  const res = await fetch(`${API_BASE_URL}/employee/training`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  let data: any = [];
  try {
    data = await res.json();
  } catch {
    data = [];
  }

  if (!res.ok) {
    throw new Error(formatErrorMessage(data.detail || data.message, 'Failed to fetch training modules.'));
  }

  return data as TrainingModuleItem[];
}

export async function updateTrainingProgressApi(
  token: string,
  moduleId: string,
  progress: number,
  status?: 'active' | 'in_progress' | 'completed'
): Promise<TrainingModuleItem> {
  const res = await fetch(`${API_BASE_URL}/employee/training/${moduleId}/progress`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ progress, status }),
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(formatErrorMessage(data.detail || data.message, 'Failed to update module progress.'));
  }

  return data as TrainingModuleItem;
}

export async function fetchEmployeeCallsApi(token: string): Promise<CallSummary[]> {
  const res = await fetch(`${API_BASE_URL}/employee/calls`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  let data: any = [];
  try {
    data = await res.json();
  } catch {
    data = [];
  }

  if (!res.ok) {
    throw new Error(formatErrorMessage(data.detail || data.message, 'Failed to fetch calls.'));
  }

  return data as CallSummary[];
}

export async function fetchTeamAnalyticsApi(token: string): Promise<TeamAnalyticsData> {
  const res = await fetch(`${API_BASE_URL}/manager/analytics`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(formatErrorMessage(data.detail || data.message, 'Failed to fetch team analytics.'));
  }

  return data as TeamAnalyticsData;
}
