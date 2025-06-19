
export interface Question {
  id: string;
  type: 'choice' | 'judgment';
  content: string;
  options?: string[];
  correctAnswer: string | number;
  category: string;
  score: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ExamPaper {
  id: string;
  studentId: string;
  questions: Question[];
  totalScore: number;
  duration: number; // minutes
  status: 'pending' | 'in-progress' | 'completed';
  startTime?: Date;
  endTime?: Date;
  submittedAnswers?: Record<string, any>;
  finalScore?: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  questionCount: number;
}

export interface ExamConfig {
  id: string;
  name: string;
  categories: string[];
  questionTypes: {
    choice: { count: number; score: number };
    judgment: { count: number; score: number };
  };
  duration: number;
  totalScore: number;
}
