export interface SkillMetrics {
  empathy: number; // 0-100
  listening: number; // 0-100
  productKnowledge: number; // 0-100
  compliance: number; // 0-100
  closing: number; // 0-100
}

export interface TranscriptLine {
  speaker: 'Agent' | 'Customer' | 'AI-Coach';
  text: string;
  timestamp: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface Assessment {
  id: string;
  date: string;
  callTitle: string;
  customerPersona: string;
  duration: string; // e.g., "4:12"
  overallScore: number; // 0-100
  status: 'completed' | 'pending';
  metrics: SkillMetrics;
  transcript: TranscriptLine[];
  feedback: {
    overall: string;
    strengths: string[];
    improvements: string[];
  };
  audioUrl?: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  content: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'Compliance' | 'Soft Skills' | 'Objection Handling' | 'Product Training';
  estimatedMinutes: number;
  progress: number; // 0-100
  status: 'locked' | 'unlocked' | 'completed';
  lessons: Lesson[];
  videoUrl?: string;
}

export interface PracticePersona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  sentiment: 'Frustrated' | 'Skeptical' | 'Inquisitive' | 'Friendly';
  scenario: string;
  objections: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface UserProgress {
  name: string;
  role: string;
  avatar: string;
  assignedDomain: string;
  level: number;
  xp: number;
  xpNeeded: number;
  streak: number;
  completedModulesCount: number;
  completedAssessmentsCount: number;
  metrics: SkillMetrics;
  achievements: Achievement[];
}
