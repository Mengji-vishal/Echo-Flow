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
  "I'm looking for a personal loan. Can you explain what options you have and how much I can get?",
  "What documents do I need to provide to apply for the loan?",
  "I'm worried about the interest rate. Can you explain how much interest I would have to pay?",
  "What would happen if I miss one of my monthly EMI payments?",
  "I'm still not sure whether I should take this loan. Why should I choose your loan instead of another option?",
];

export const DEMO_EMPLOYEES: Employee[] = [];
