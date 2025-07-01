import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Eye, Calendar, Clock, Award } from 'lucide-react';
import { post } from '@/lib/request';

interface ExamRecord {
  id: string;
  examName: string;
  score: number;
  totalScore: number;
  status: string;
  startTime: string;
  endTime: string;
  duration: number;
}

interface ExamRecordDetail {
  id: string;
  examName: string;
  score: number;
  totalScore: number;
  status: string;
  startTime: string;
  endTime: string;
  duration: number;
  answers: Array<{
    questionId: string;
    questionContent: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    score: number;
  }>;
}

const ExamRecords: React.FC = () => {
  const { toast } = useToast();
  const [records, setRecords] = useState<ExamRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ExamRecordDetail | null>(null);

  // 获取考试记录列表
  const fetchRecords = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await post('/exam/records', {
        page,
        size: pageSize
      });
      
      if (response.code === 200) {
        setRecords(response.data.list || []);
        setTotal(response.data.total || 0);
      } else {
        toast({
          title: "加载失败",
          description: response.message || "获取考试记录失败",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('获取考试记录失败:', error);
      toast({
        title: "加载失败",
        description: "获取考试记录失败，请重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取考试记录详情
  const fetchRecordDetail = async (recordId: string) => {
    try {
      const response = await post(`/exam/records/${recordId}`, {});
      
      if (response.code === 200) {
        setSelectedRecord(response.data);
        setDetailDialogOpen(true);
      } else {
        toast({
          title: "加载失败",
          description: response.message || "获取考试详情失败",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('获取考试详情失败:', error);
      toast({
        title: "加载失败",
        description: "获取考试详情失败，请重试",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchRecords(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewDetail = (record: ExamRecord) => {
    fetchRecordDetail(record.id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">已完成</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">进行中</Badge>;
      case 'timeout':
        return <Badge variant="destructive">超时</Badge>;
      case 'pending':
        return <Badge variant="secondary">待开始</Badge>;
      default:
        return <Badge variant="secondary">未知</Badge>;
    }
  };

  const getScoreColor = (score: number, totalScore: number) => {
    const percentage = (score / totalScore) * 100;
    if (percentage >= 90) return 'text-green-600 font-semibold';
    if (percentage >= 80) return 'text-blue-600 font-semibold';
    if (percentage >= 70) return 'text-yellow-600 font-semibold';
    if (percentage >= 60) return 'text-orange-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">我的考试记录</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>共 {total} 条记录</span>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="text-center">
            <p className="text-blue-100 text-sm">总考试次数</p>
            <p className="text-2xl font-bold">{total}</p>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="text-center">
            <p className="text-green-100 text-sm">完成率</p>
            <p className="text-2xl font-bold">
              {total > 0 ? Math.round((records.filter(r => r.status === 'completed').length / total) * 100) : 0}%
            </p>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="text-center">
            <p className="text-purple-100 text-sm">平均分</p>
            <p className="text-2xl font-bold">
              {records.filter(r => r.status === 'completed').length > 0 
                ? Math.round(records.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.score, 0) / 
                    records.filter(r => r.status === 'completed').length)
                : 0}
            </p>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="text-center">
            <p className="text-orange-100 text-sm">最高分</p>
            <p className="text-2xl font-bold">
              {records.length > 0 ? Math.max(...records.map(r => r.score)) : 0}
            </p>
          </div>
        </Card>
      </div>

      {/* 考试记录表格 */}
      <Card>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">加载中...</div>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">暂无考试记录</p>
              <p className="text-sm text-gray-400 mt-2">开始您的第一次考试吧！</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>考试名称</TableHead>
                    <TableHead>得分</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>开始时间</TableHead>
                    <TableHead>用时</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.examName}</TableCell>
                      <TableCell>
                        <span className={getScoreColor(record.score, record.totalScore)}>
                          {record.score}/{record.totalScore}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{formatDate(record.startTime)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{record.duration || 0}分钟</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(record)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          查看详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            className={currentPage === page ? 'bg-blue-600 text-white' : 'cursor-pointer'}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(currentPage + 1)}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {/* 考试详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>考试详情</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">考试名称</p>
                  <p className="font-medium">{selectedRecord.examName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">考试得分</p>
                  <p className={getScoreColor(selectedRecord.score, selectedRecord.totalScore)}>
                    {selectedRecord.score}/{selectedRecord.totalScore}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">开始时间</p>
                  <p className="font-medium">{formatDate(selectedRecord.startTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">结束时间</p>
                  <p className="font-medium">{selectedRecord.endTime ? formatDate(selectedRecord.endTime) : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">用时</p>
                  <p className="font-medium">{selectedRecord.duration || 0}分钟</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">状态</p>
                  <div>{getStatusBadge(selectedRecord.status)}</div>
                </div>
              </div>

              {/* 答题详情 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">答题详情</h3>
                <div className="space-y-4">
                  {selectedRecord.answers.map((answer, index) => (
                    <div key={answer.questionId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-gray-600">第{index + 1}题</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">得分：{answer.score}</span>
                          <Badge variant={answer.isCorrect ? "default" : "destructive"}>
                            {answer.isCorrect ? "正确" : "错误"}
                          </Badge>
                        </div>
                      </div>
                      <p className="font-medium mb-3">{answer.questionContent}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">您的答案：</p>
                          <p className="font-medium">{answer.userAnswer}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">正确答案：</p>
                          <p className="font-medium">{answer.correctAnswer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamRecords; 