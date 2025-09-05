import React, { useState, useEffect, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User } from '../../types/auth';
import { ExamPaper } from '../../types/exam';
import { useToast } from '@/hooks/use-toast';
import { post } from '@/lib/request';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  userCategory?: string; // 人员类别
}

const ExamList: React.FC<ExamListProps> = ({ user, onStartExam }) => {
  const [availableExams, setAvailableExams] = useState<AvailableExam[]>([]);
  const [selectedExam, setSelectedExam] = useState<AvailableExam | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9); // 每页9张卡片
  const { toast } = useToast();

  // 获取可用的考试列表
  const fetchAvailableExams = async () => {
    setLoading(true);
    try {
      const response = await post('/admin/available-questions/list', {
        pageNumber: 1,
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

  // 排序：未考试 > 进行中 > 已完成/超时
  const sortedExams = [...availableExams].sort((a, b) => {
    const statusOrder = {
      'pending': 0,      // 未开始考试
      'notStarted': 0,   // 未开始考试
      'in-progress': 1,  // 进行中
      'completed': 2,    // 已完成
      'timeout': 2       // 超时
    };
    
    // 首先按状态排序
    const statusDiff = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
    if (statusDiff !== 0) {
      return statusDiff;
    }
    
    // 相同状态下按考试名称排序
    return a.paperName.localeCompare(b.paperName);
  });

  // 分页计算
  const totalPages = Math.ceil(sortedExams.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageExams = sortedExams.slice(startIndex, endIndex);

  // 分页控制函数
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

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
        passScore: 60 // 默认及格分数为60
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
            type: q.questionType,
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
          共 {availableExams.filter(exam => exam.status !== 'completed').length} 项考试可参加
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
        <>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPageExams.map(exam => (
            <Card key={exam.paperId} className={`p-6 transition-all duration-300 ${
              exam.status === 'notStarted' || exam.status === 'pending' || exam.status === 'in-progress'
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
                <span className="text-gray-600">人员类别：</span>
                <span className="font-medium text-blue-600">{exam.userCategory || '指挥管理军官'}</span>
              </div>
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
                {exam.status === 'completed' || exam.status === 'timeout' ? (
                  <Button disabled className="w-full">
                    {exam.status === 'completed' ? '已完成' : '已超时'}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleRequestExam(exam)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {exam.status === 'in-progress' ? '继续考试' : '开始考试'}
                  </Button>
                )}
            </div>
          </Card>
        ))}
      </div>
      
      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-8 space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>上一页</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              第 {currentPage} 页，共 {totalPages} 页
            </span>
            <span className="text-sm text-gray-500">
              （共 {sortedExams.length} 个考试）
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center space-x-2"
          >
            <span>下一页</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
        </>
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
