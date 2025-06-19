
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User } from '../../types/auth';
import { ExamPaper, Question } from '../../types/exam';
import { useToast } from '@/hooks/use-toast';

interface ExamListProps {
  user: User;
  onStartExam: (exam: ExamPaper) => void;
}

const ExamList: React.FC<ExamListProps> = ({ user, onStartExam }) => {
  const [availableExams, setAvailableExams] = useState<ExamPaper[]>([]);
  const [selectedExam, setSelectedExam] = useState<ExamPaper | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  // 模拟题库数据
  const mockQuestions: Question[] = [
    {
      id: '1',
      type: 'choice',
      content: '胃溃疡最常见的并发症是？',
      options: ['穿孔', '出血', '幽门梗阻', '癌变'],
      correctAnswer: 1,
      category: '消化内科',
      score: 2,
      difficulty: 'medium'
    },
    {
      id: '2',
      type: 'choice',
      content: '十二指肠溃疡的典型疼痛特点是？',
      options: ['餐后痛', '夜间痛', '空腹痛', '持续性痛'],
      correctAnswer: 2,
      category: '消化内科',
      score: 2,
      difficulty: 'medium'
    },
    {
      id: '3',
      type: 'judgment',
      content: '胆囊炎患者应避免高脂饮食。',
      correctAnswer: '正确',
      category: '消化内科',
      score: 1,
      difficulty: 'easy'
    },
    {
      id: '4',
      type: 'judgment',
      content: '所有的胃溃疡都需要手术治疗。',
      correctAnswer: '错误',
      category: '消化内科',
      score: 1,
      difficulty: 'easy'
    }
  ];

  // 生成随机试卷
  const generateExamPaper = (category: string, examName: string): ExamPaper => {
    const categoryQuestions = mockQuestions.filter(q => q.category === category);
    
    // 简单的随机选题逻辑
    const choiceQuestions = categoryQuestions.filter(q => q.type === 'choice').slice(0, 2);
    const judgmentQuestions = categoryQuestions.filter(q => q.type === 'judgment');
    
    const selectedQuestions = [...choiceQuestions, ...judgmentQuestions];
    const totalScore = selectedQuestions.reduce((sum, q) => sum + q.score, 0);

    return {
      id: Date.now().toString(),
      studentId: user.id,
      questions: selectedQuestions,
      totalScore: totalScore,
      duration: 30, // 30分钟
      status: 'pending'
    };
  };

  useEffect(() => {
    // 根据用户科室生成可参加的考试
    const exams: ExamPaper[] = [];
    
    if (user.department === '消化内科' || user.role === 'admin') {
      exams.push({
        id: 'digestive-exam',
        studentId: user.id,
        questions: [],
        totalScore: 100,
        duration: 90,
        status: 'pending'
      });
    }

    setAvailableExams(exams);
  }, [user]);

  const handleRequestExam = (category: string, examName: string) => {
    const examPaper = generateExamPaper(category, examName);
    setSelectedExam(examPaper);
    setShowConfirmDialog(true);
  };

  const handleConfirmStart = () => {
    if (selectedExam) {
      onStartExam(selectedExam);
      setShowConfirmDialog(false);
      toast({
        title: "考试开始",
        description: "祝您考试顺利！"
      });
    }
  };

  const examCategories = [
    {
      id: 'digestive',
      name: '消化内科理论考试',
      category: '消化内科',
      description: '涵盖消化系统疾病的诊断、治疗和护理知识',
      duration: 30,
      questionCount: 4,
      totalScore: 6,
      difficulty: '中等',
      available: user.department === '消化内科' || user.role === 'admin'
    },
    {
      id: 'hepatobiliary',
      name: '肝胆外科专业考试',
      category: '肝胆外科',
      description: '肝胆外科手术技能和相关医学知识考核',
      duration: 120,
      questionCount: 65,
      totalScore: 100,
      difficulty: '困难',
      available: user.department === '肝胆外科' || user.role === 'admin'
    },
    {
      id: 'cardiovascular',
      name: '心血管内科考试',
      category: '心血管内科',
      description: '心血管疾病的诊疗和急救处理',
      duration: 90,
      questionCount: 50,
      totalScore: 100,
      difficulty: '中等',
      available: user.department === '心血管内科' || user.role === 'admin'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">可参加的考试</h2>
        <div className="text-sm text-gray-600">
          共 {examCategories.filter(exam => exam.available).length} 项考试可参加
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {examCategories.map(exam => (
          <Card key={exam.id} className={`p-6 transition-all duration-300 ${
            exam.available 
              ? 'hover:shadow-lg hover:scale-105 cursor-pointer border-green-200' 
              : 'opacity-50 bg-gray-50'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{exam.name}</h3>
              {exam.available ? (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">可参加</span>
              ) : (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">不可参加</span>
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{exam.description}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">考试时长：</span>
                <span className="font-medium">{exam.duration}分钟</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">题目数量：</span>
                <span className="font-medium">{exam.questionCount}题</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">总分：</span>
                <span className="font-medium">{exam.totalScore}分</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">难度：</span>
                <span className={`font-medium ${
                  exam.difficulty === '简单' ? 'text-green-600' :
                  exam.difficulty === '中等' ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {exam.difficulty}
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              {exam.available ? (
                <Button 
                  onClick={() => handleRequestExam(exam.category, exam.name)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  开始考试
                </Button>
              ) : (
                <Button disabled className="w-full">
                  暂不可参加
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* 考试说明 */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">考试须知</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>• 考试开始后不可暂停，请确保网络连接稳定</p>
          <p>• 考试时间到期后系统将自动提交试卷</p>
          <p>• 每人每科目只能参加一次考试</p>
          <p>• 考试过程中不得切换浏览器窗口或标签页</p>
          <p>• 如遇技术问题请及时联系管理员</p>
        </div>
      </Card>

      {/* 确认对话框 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>确认开始考试</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <p className="text-yellow-800 text-sm">
                <strong>重要提醒：</strong>
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                考试开始后将无法暂停或重新开始，请确保您已准备就绪。
              </p>
            </div>
            
            {selectedExam && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">考试时长：</span>
                  <span className="font-medium">{selectedExam.duration}分钟</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">题目数量：</span>
                  <span className="font-medium">{selectedExam.questions.length}题</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">总分：</span>
                  <span className="font-medium">{selectedExam.totalScore}分</span>
                </div>
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1"
              >
                取消
              </Button>
              <Button 
                onClick={handleConfirmStart}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                确认开始
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamList;
