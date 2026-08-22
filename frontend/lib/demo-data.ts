export interface EvaluationDimension {
  name: string;
  score: number;
}

export interface RecentEvaluation {
  id: string;
  callTitle: string;
  date: string;
  score: number;
  duration: string;
  status: 'Completed' | 'Pending Review';
}

export interface PerformanceHistoryPoint {
  period: string;
  score: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  qaScore: number;
  recentAssessmentScore: number;
  trend: string;
  trendType: 'positive' | 'negative' | 'neutral';
  strongestSkill: string;
  weakestSkill: string;
  totalCalls: number;
  skills: EvaluationDimension[];
  recentEvaluations: RecentEvaluation[];
  performanceHistory: PerformanceHistoryPoint[];
}

export const DEFAULT_CALL_SCENARIO =
  'Customer wants an ₹8 lakh personal loan for home renovation and is inquiring about interest rates, tenure flexibility, and processing terms.';

export const DEFAULT_CALL_QUESTIONS = [
  'Why does the customer need the personal loan?',
  'What is the customer\'s monthly take-home income?',
  'What loan tenure do they prefer?',
  'Do they currently have any existing loans or EMIs?',
  'What concerns do they have about the monthly EMI payments?',
];

export const DEMO_EMPLOYEES: Employee[] = [];
