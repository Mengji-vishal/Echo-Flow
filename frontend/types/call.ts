export interface EmployeeItem {
  id: string;
  name: string;
  email: string;
  phone_number?: string | null;
  role: string;
  created_at?: string | null;
}

export interface CallQuestion {
  id: string;
  call_id: string;
  question_number: number;
  question_text: string;
  created_at?: string | null;
}

export interface CallTranscript {
  id: string;
  call_id: string;
  speaker: 'ai' | 'employee' | string;
  text: string;
  timestamp: string;
  created_at?: string | null;
}

export interface CallAnalysisMetrics {
  empathy: number;
  communication: number;
  discovery: number;
  objectionHandling: number;
  solutionOffering: number;
  closing: number;
  compliance: number;
  [key: string]: number;
}

export interface QuestionEvaluation {
  question_number: number;
  question_text: string;
  employee_answer?: string | null;
  score: number;
  feedback: string;
  key_observation?: string | null;
}

export interface CallAnalysis {
  id: string;
  call_id: string;
  overall_score: number;
  metrics: CallAnalysisMetrics | Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  summary?: string | null;
  insights?: string[];
  question_evaluations?: QuestionEvaluation[];
  created_at?: string | null;
}

export interface TrainingModuleSummary {
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
  progress: number;
  status: 'active' | 'in_progress' | 'completed' | string;
  created_at?: string | null;
}

export interface CallSummary {
  id: string;
  manager_id: string;
  employee_id: string;
  employee_name?: string | null;
  employee_email?: string | null;
  employee_phone?: string | null;
  status: 'created' | 'initiating' | 'ringing' | 'in_progress' | 'completed' | 'failed' | string;
  started_at?: string | null;
  ended_at?: string | null;
  duration_seconds?: number | null;
  provider_call_id?: string | null;
  questions_count: number;
  overall_score?: number | null;
  created_at: string;
}

export interface CallDetail extends CallSummary {
  questions: CallQuestion[];
  transcripts: CallTranscript[];
  analysis?: CallAnalysis | null;
  recommended_training?: TrainingModuleSummary[];
}
