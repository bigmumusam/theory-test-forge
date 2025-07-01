import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User } from '../../types/auth';
import { ExamPaper } from '../../types/exam';
import { useToast } from '@/hooks/use-toast';
import { post } from '@/lib/request';

interface ExamListProps {
  user: User;
  onStartExam: (exam: ExamPaper) => void;
}

interface AvailableExam {
  paperId: string;
  paperName: string;
  categoryId: string;
  categoryName: string;
  totalQuestions: number;
  totalScore: number;
  duration: number;
  status: string;
}

const ExamList: React.FC<ExamListProps> = ({ user, onStartExam }) => {
  const [availableExams, setAvailableExams] = useState<AvailableExam[]>([]);
  const [selectedExam, setSelectedExam] = useState<AvailableExam | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // 获取可用的考试列表
  const fetchAvailableExams = async () => {
    setLoading(true);
    try {
      const response = await post('/admin/available-questions/list', {
        pageNum: 1,
        pageSize: 100
      });
      
      if (response.code === 200) {
        setAvailableExams(response.data || []);
      } else {
        toast({
          title: "加载失败",
          description: response.message || "获取考试列表失败",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('获取考试列表失败:', error);
      toast({
        title: "加载失败",
        description: "获取考试列表失败，请重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableExams();
  }, []);

  const handleRequestExam = (exam: AvailableExam) => {
    setSelectedExam(exam);
    setShowConfirmDialog(true);
  };

  const handleConfirmStart = async () => {
    if (!selectedExam) return;
    
    try {
      // 1. 先调用开始考试接口创建考试记录
      const startResponse = await post('/exam/start', {
        paperId: selectedExam.paperId,
        examName: selectedExam.paperName,
        duration: selectedExam.duration,
        totalScore: selectedExam.totalScore
      });
      
      if (startResponse.code !== 200) {
        toast({
          title: "开始失败",
          description: startResponse.message || "开始考试失败",
          variant: "destructive"
        });
        return;
      }
      
      const recordId = startResponse.data.recordId;
      
      // 2. 获取试卷题目
      const response = await post('/admin/getQuestionsByPaperId', {
        paperId: selectedExam.paperId
      });
      
      if (response.code === 200) {
        const questions = response.data || [];
        const examPaper: ExamPaper = {
          id: recordId, // 使用考试记录ID
          studentId: user.id,
          questions: questions.map((q: any) => ({
            id: q.questionId,
            type: q.questionType === 'choice' ? 'choice' : 'judgment',
            content: q.questionContent,
            options: q.questionOptions ? JSON.parse(q.questionOptions) : undefined,
            correctAnswer: q.correctAnswer,
            category: q.categoryId,
            score: q.score,
            difficulty: q.difficulty || 'medium',
            remark: q.remark
          })),
          totalScore: selectedExam.totalScore,
          duration: selectedExam.duration,
          status: 'in-progress'
        };
        
        onStartExam(examPaper);
      setShowConfirmDialog(false);
      toast({
        title: "考试开始",
        description: "祝您考试顺利！"
        });
      } else {
        toast({
          title: "加载失败",
          description: response.message || "获取试卷题目失败",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('开始考试失败:', error);
      toast({
        title: "开始失败",
        description: "开始考试失败，请重试",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">待开始</span>;
      case 'in-progress':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">进行中</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">已完成</span>;
      case 'timeout':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">超时</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">可参加</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">可参加的考试</h2>
        <div className="text-sm text-gray-600">
          共 {availableExams.length} 项考试可参加
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : availableExams.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-500">暂无可参加的考试</div>
        </Card>
      ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableExams.map(exam => (
            <Card key={exam.paperId} className={`p-6 transition-all duration-300 ${
              exam.status === 'notStarted' || exam.status === 'pending'
              ? 'hover:shadow-lg hover:scale-105 cursor-pointer border-green-200' 
              : 'opacity-50 bg-gray-50'
          }`}>
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{exam.paperName}</h3>
                {getStatusBadge(exam.status)}
            </div>
            
              <p className="text-gray-600 text-sm mb-4">{exam.categoryName}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">考试时长：</span>
                <span className="font-medium">{exam.duration}分钟</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">题目数量：</span>
                  <span className="font-medium">{exam.totalQuestions}题</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">总分：</span>
                <span className="font-medium">{exam.totalScore}分</span>
              </div>
            </div>
            
            <div className="mt-6">
                {(exam.status === 'notStarted' || exam.status === 'pending') ? (
                <Button 
                    onClick={() => handleRequestExam(exam)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  开始考试
                </Button>
              ) : (
                <Button disabled className="w-full">
                    {exam.status === 'completed' ? '已完成' : 
                     exam.status === 'in-progress' ? '进行中' : 
                     exam.status === 'timeout' ? '已超时' : '暂不可参加'}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
      )}

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
                  <span className="text-gray-600">考试名称：</span>
                  <span className="font-medium">{selectedExam.paperName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">考试时长：</span>
                  <span className="font-medium">{selectedExam.duration}分钟</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">题目数量：</span>
                  <span className="font-medium">{selectedExam.totalQuestions}题</span>
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
