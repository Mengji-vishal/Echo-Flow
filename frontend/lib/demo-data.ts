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

export const DEMO_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Rahul Sharma',
    role: 'Senior Sales Representative',
    department: 'Lending Operations',
    avatar: 'RS',
    qaScore: 84,
    recentAssessmentScore: 86,
    trend: '+6.2%',
    trendType: 'positive',
    strongestSkill: 'Product Knowledge',
    weakestSkill: 'Objection Handling',
    totalCalls: 142,
    skills: [
      { name: 'Product Knowledge', score: 92 },
      { name: 'Communication', score: 88 },
      { name: 'Active Listening', score: 86 },
      { name: 'Customer Handling', score: 82 },
      { name: 'Compliance', score: 90 },
      { name: 'Empathy', score: 84 },
      { name: 'Closing / Next Step', score: 80 },
      { name: 'Objection Handling', score: 72 },
    ],
    recentEvaluations: [
      { id: 'eval-101', callTitle: 'Inbound Customer Assessment #101', date: 'Today, 2:40 PM', score: 86, duration: '6m 12s', status: 'Completed' },
      { id: 'eval-102', callTitle: 'Consultation Simulation #102', date: 'Yesterday, 11:15 AM', score: 82, duration: '5m 45s', status: 'Completed' },
      { id: 'eval-103', callTitle: 'Product Advisory Call #103', date: '16 Aug', score: 85, duration: '7m 02s', status: 'Completed' },
    ],
    performanceHistory: [
      { period: 'Week 1', score: 78 },
      { period: 'Week 2', score: 80 },
      { period: 'Week 3', score: 82 },
      { period: 'Week 4', score: 86 },
    ],
  },
  {
    id: 'emp-2',
    name: 'Priya Rao',
    role: 'Customer Success Specialist',
    department: 'Customer Retention',
    avatar: 'PR',
    qaScore: 78,
    recentAssessmentScore: 80,
    trend: '+3.1%',
    trendType: 'positive',
    strongestSkill: 'Communication',
    weakestSkill: 'Customer Handling',
    totalCalls: 128,
    skills: [
      { name: 'Communication', score: 91 },
      { name: 'Active Listening', score: 84 },
      { name: 'Empathy', score: 86 },
      { name: 'Compliance', score: 82 },
      { name: 'Product Knowledge', score: 76 },
      { name: 'Closing / Next Step', score: 74 },
      { name: 'Objection Handling', score: 72 },
      { name: 'Customer Handling', score: 68 },
    ],
    recentEvaluations: [
      { id: 'eval-201', callTitle: 'Customer Retention Simulation #201', date: 'Today, 10:20 AM', score: 80, duration: '5m 18s', status: 'Completed' },
      { id: 'eval-202', callTitle: 'Inbound Resolution Assessment #202', date: '17 Aug', score: 77, duration: '6m 30s', status: 'Completed' },
    ],
    performanceHistory: [
      { period: 'Week 1', score: 74 },
      { period: 'Week 2', score: 75 },
      { period: 'Week 3', score: 77 },
      { period: 'Week 4', score: 80 },
    ],
  },
  {
    id: 'emp-3',
    name: 'Amit Patel',
    role: 'Senior Loan Consultant',
    department: 'Secured Advisory',
    avatar: 'AP',
    qaScore: 91,
    recentAssessmentScore: 93,
    trend: '+4.5%',
    trendType: 'positive',
    strongestSkill: 'Active Listening',
    weakestSkill: 'Closing / Next Step',
    totalCalls: 195,
    skills: [
      { name: 'Active Listening', score: 96 },
      { name: 'Compliance', score: 95 },
      { name: 'Product Knowledge', score: 94 },
      { name: 'Communication', score: 90 },
      { name: 'Objection Handling', score: 88 },
      { name: 'Customer Handling', score: 89 },
      { name: 'Empathy', score: 86 },
      { name: 'Closing / Next Step', score: 78 },
    ],
    recentEvaluations: [
      { id: 'eval-301', callTitle: 'Advisory Consultation #301', date: 'Today, 1:15 PM', score: 93, duration: '8m 10s', status: 'Completed' },
      { id: 'eval-302', callTitle: 'Structured Evaluation #302', date: 'Yesterday, 4:00 PM', score: 90, duration: '6m 40s', status: 'Completed' },
    ],
    performanceHistory: [
      { period: 'Week 1', score: 85 },
      { period: 'Week 2', score: 88 },
      { period: 'Week 3', score: 90 },
      { period: 'Week 4', score: 93 },
    ],
  },
  {
    id: 'emp-4',
    name: 'Sneha Verma',
    role: 'Support Specialist',
    department: 'Customer Care',
    avatar: 'SV',
    qaScore: 74,
    recentAssessmentScore: 72,
    trend: '-1.2%',
    trendType: 'negative',
    strongestSkill: 'Empathy',
    weakestSkill: 'Compliance',
    totalCalls: 110,
    skills: [
      { name: 'Empathy', score: 90 },
      { name: 'Active Listening', score: 80 },
      { name: 'Communication', score: 76 },
      { name: 'Customer Handling', score: 74 },
      { name: 'Product Knowledge', score: 72 },
      { name: 'Objection Handling', score: 70 },
      { name: 'Closing / Next Step', score: 68 },
      { name: 'Compliance', score: 64 },
    ],
    recentEvaluations: [
      { id: 'eval-401', callTitle: 'Support Interaction Assessment #401', date: 'Yesterday, 3:30 PM', score: 72, duration: '5m 50s', status: 'Completed' },
      { id: 'eval-402', callTitle: 'Inbound Query Call #402', date: '16 Aug', score: 75, duration: '6m 15s', status: 'Completed' },
    ],
    performanceHistory: [
      { period: 'Week 1', score: 76 },
      { period: 'Week 2', score: 75 },
      { period: 'Week 3', score: 73 },
      { period: 'Week 4', score: 72 },
    ],
  },
  {
    id: 'emp-5',
    name: 'Vikram Malhotra',
    role: 'Sales Advisor',
    department: 'Client Acquisition',
    avatar: 'VM',
    qaScore: 88,
    recentAssessmentScore: 89,
    trend: '+5.0%',
    trendType: 'positive',
    strongestSkill: 'Objection Handling',
    weakestSkill: 'Customer Handling',
    totalCalls: 164,
    skills: [
      { name: 'Objection Handling', score: 94 },
      { name: 'Compliance', score: 92 },
      { name: 'Product Knowledge', score: 90 },
      { name: 'Communication', score: 88 },
      { name: 'Active Listening', score: 87 },
      { name: 'Closing / Next Step', score: 86 },
      { name: 'Empathy', score: 80 },
      { name: 'Customer Handling', score: 78 },
    ],
    recentEvaluations: [
      { id: 'eval-501', callTitle: 'High-Value Pitch Evaluation #501', date: 'Today, 11:45 AM', score: 89, duration: '6m 05s', status: 'Completed' },
      { id: 'eval-502', callTitle: 'Outbound Discovery Call #502', date: '18 Aug', score: 87, duration: '5m 30s', status: 'Completed' },
    ],
    performanceHistory: [
      { period: 'Week 1', score: 82 },
      { period: 'Week 2', score: 84 },
      { period: 'Week 3', score: 87 },
      { period: 'Week 4', score: 89 },
    ],
  },
  {
    id: 'emp-6',
    name: 'Ananya Iyer',
    role: 'Client Relationship Advisor',
    department: 'Wealth & Advisory',
    avatar: 'AI',
    qaScore: 81,
    recentAssessmentScore: 83,
    trend: '+2.8%',
    trendType: 'positive',
    strongestSkill: 'Communication',
    weakestSkill: 'Closing / Next Step',
    totalCalls: 136,
    skills: [
      { name: 'Communication', score: 90 },
      { name: 'Product Knowledge', score: 86 },
      { name: 'Compliance', score: 85 },
      { name: 'Active Listening', score: 82 },
      { name: 'Customer Handling', score: 80 },
      { name: 'Empathy', score: 80 },
      { name: 'Objection Handling', score: 74 },
      { name: 'Closing / Next Step', score: 70 },
    ],
    recentEvaluations: [
      { id: 'eval-601', callTitle: 'Advisory Review Assessment #601', date: 'Yesterday, 12:00 PM', score: 83, duration: '7m 10s', status: 'Completed' },
      { id: 'eval-602', callTitle: 'Client Consultation #602', date: '17 Aug', score: 79, duration: '6m 20s', status: 'Completed' },
    ],
    performanceHistory: [
      { period: 'Week 1', score: 78 },
      { period: 'Week 2', score: 79 },
      { period: 'Week 3', score: 81 },
      { period: 'Week 4', score: 83 },
    ],
  },
];
