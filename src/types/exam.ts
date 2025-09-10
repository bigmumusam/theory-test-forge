export interface Question {
  id: string;
  type: 'choice' | 'multi' | 'judgment';
  content: string;
  options?: string[];
  correctAnswer: number | number[] | string;
  category: string;
  score: number;
  difficulty: 'easy' | 'medium' | 'hard';
  remark?: string;
}

export interface ExamPaper {
  id: string;
  studentId: string;
  questions: Question[];
  totalScore: number;
  duration: number; // minutes
  status: 'pending' | 'in-progress' | 'completed' | 'timeout';
  startTime?: Date;
  endTime?: Date;
  submittedAnswers?: Record<string, any>;
  finalScore?: number;
}

// 试卷列表项类型
export interface ExamPaperListItem {
  paperId: string;
  paperName: string;
  categoryId: string;
  categoryName: string;
  totalQuestions: number;
  totalScore: number;
  duration: number;
  createTime: string;
  createBy: string;
  status: string;
  usageCount: number;
  userCategories: string; // 人员类别（多个类别用逗号分隔）
}

// 试卷列表查询参数
export interface ExamPaperQueryParams {
  paperName?: string;
  categoryId?: string;
  status?: string;
  pageNumber: number;
  pageSize: number;
}

// 试卷列表响应
export interface ExamPaperListResponse {
  records: ExamPaperListItem[];
  total: number;
  size: number;
  current: number;
  pages: number;
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
  userCategories?: string[]; // 人员类别（多选）
  questionTypes: {
    choice: { count: number; score: number };
    multi: { count: number; score: number };
    judgment: { count: number; score: number };
  };
  duration: number;
  totalScore: number;
  passScore: number; // 及格分数
}

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message?: string;
}
