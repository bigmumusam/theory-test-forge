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
    questionType?: string;
    questionOptions?: string[];
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
                  {selectedRecord.answers.map((answer, index) => {
                    // 判断题类型标识
                    const JUDGE_TYPES = ['judgment', '判断题'];
                    const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                    const isJudge = answer.questionType && JUDGE_TYPES.includes(answer.questionType);
                    let optionsToShow: string[] = answer.questionOptions || [];
                    if (isJudge) {
                      optionsToShow = ['正确', '错误'];
                    }
                    
                    // 解析答案的函数
                    const parseAndMapAnswers = (answerStr: string | string[]): number[] => {
                      if (Array.isArray(answerStr)) {
                        return answerStr.map((idx: any) => Number(idx));
                      }
                      if (typeof answerStr === 'string') {
                        const a = answerStr.trim();
                        if (a === '') return [];
                        if (a.includes(',')) {
                          return a.split(',').map((s: string) => Number(s.trim()));
                        } else if (/^[A-Za-z]+$/.test(a)) {
                          // 字母格式：如 "BDAC"，转换为索引数组
                          return a.toUpperCase().split('').map((char: string) => {
                            return char.charCodeAt(0) - 'A'.charCodeAt(0);
                          });
                        } else {
                          return [Number(a)];
                        }
                      }
                      return [Number(answerStr)];
                    };
                    
                    return (
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
                        
                        {/* 多选题答案顺序显示 */}
                        {answer.questionType === 'multi' && !isJudge && (
                          <div className="mb-3 space-y-2">
                            {/* 正确答案顺序 */}
                            {(() => {
                              const correctIndexes = parseAndMapAnswers(answer.correctAnswer);
                              const correctOrder = correctIndexes.map(idx => OPTION_LETTERS[idx] || '').filter(Boolean).join('→');
                              return correctOrder ? (
                                <div className="text-sm">
                                  <span className="font-semibold text-gray-700">正确答案顺序：</span>
                                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 font-bold rounded">{correctOrder}</span>
                                </div>
                              ) : null;
                            })()}
                            {/* 用户答案顺序 */}
                            <div className="text-sm">
                              <span className="font-semibold text-gray-700">您的答案顺序：</span>
                              {(() => {
                                const userIndexes = parseAndMapAnswers(answer.userAnswer);
                                const userOrder = userIndexes.map(idx => OPTION_LETTERS[idx] || '').filter(Boolean).join('→');
                                return userOrder ? (
                                  <span className={`ml-2 px-2 py-1 font-bold rounded ${answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{userOrder}</span>
                                ) : (
                                  <span className="ml-2 px-2 py-1 font-bold rounded bg-gray-100 text-gray-500 italic">未作答</span>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                        
                        {/* 显示选项（如果有） */}
                        {optionsToShow && optionsToShow.length > 0 ? (
                          <ul className="space-y-1">
                            {optionsToShow.map((opt: string, i: number) => {
                              // 根据题目类型处理答案比较
                              let isCorrect = false;
                              let isUserSelected = false;
                              
                              if (isJudge) {
                                // 判断题：比较字符串答案
                                const correctAnswer = parseAndMapAnswers(answer.correctAnswer)[0];
                                const userAnswer = parseAndMapAnswers(answer.userAnswer)[0];
                                isCorrect = correctAnswer === i;
                                isUserSelected = userAnswer === i;
                              } else {
                                // 选择题：比较数字索引
                                const correctIndexes = parseAndMapAnswers(answer.correctAnswer);
                                const userIndexes = parseAndMapAnswers(answer.userAnswer);
                                
                                isCorrect = correctIndexes.includes(i);
                                isUserSelected = userIndexes.includes(i);
                              }
                              
                              let highlightClass = '';
                              if (isCorrect && isUserSelected) {
                                highlightClass = 'bg-green-100 text-green-700 font-bold'; // 选对
                              } else if (isCorrect) {
                                highlightClass = 'bg-green-50 text-green-700 font-bold'; // 正确但未选
                              } else if (isUserSelected) {
                                highlightClass = 'bg-red-100 text-red-700 font-bold'; // 选错
                              }
                              
                              // 获取选项在选择顺序中的位置（仅多选题）
                              let correctOrderIndex: number | null = null;
                              let userOrderIndex: number | null = null;
                              if (answer.questionType === 'multi' && !isJudge) {
                                const correctIndexes = parseAndMapAnswers(answer.correctAnswer);
                                if (correctIndexes.includes(i)) {
                                  correctOrderIndex = correctIndexes.indexOf(i) + 1;
                                }
                                const userIndexes = parseAndMapAnswers(answer.userAnswer);
                                if (userIndexes.includes(i)) {
                                  userOrderIndex = userIndexes.indexOf(i) + 1;
                                }
                              }
                              
                              return (
                                <li
                                  key={i}
                                  className={`flex items-center w-full px-4 py-1 rounded text-sm transition-all ${highlightClass}`}
                                >
                                  <span className="inline-block w-5 text-center mr-2 font-bold">{OPTION_LETTERS[i] || ''}.</span>
                                  <span className="break-all flex-1">{opt}</span>
                                  {/* 显示顺序信息（仅多选题） */}
                                  {answer.questionType === 'multi' && !isJudge && (correctOrderIndex !== null || userOrderIndex !== null) && (
                                    <div className="ml-2 flex items-center space-x-1">
                                      {correctOrderIndex !== null && (
                                        <span className="px-1.5 py-0.5 bg-green-200 text-green-800 text-xs font-bold rounded">
                                          正确答案第{correctOrderIndex}个
                                        </span>
                                      )}
                                      {userOrderIndex !== null && (
                                        <span className={`px-1.5 py-0.5 text-xs font-bold rounded ${answer.isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                          您的第{userOrderIndex}个选择
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          // 如果没有选项，显示简单的答案对比
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 font-semibold mb-1">您的答案：</p>
                              <p className={`font-medium ${answer.userAnswer && answer.userAnswer.toString().trim() ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                                {(() => {
                                  if (!answer.userAnswer) return '未作答';
                                  const ua = answer.userAnswer.toString().trim();
                                  if (!ua) return '未作答';
                                  
                                  // 判断题：直接返回原值
                                  if (isJudge) return ua;
                                  
                                  // 尝试转换为字母格式显示
                                  let indexes: number[] = [];
                                  if (ua.includes(',')) {
                                    // 多选题：多个索引，如 "0,1,2"
                                    indexes = ua.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
                                  } else {
                                    // 单选题：单个索引，如 "2"
                                    const num = Number(ua);
                                    if (!isNaN(num)) {
                                      indexes = [num];
                                    }
                                  }
                                  
                                  if (indexes.length > 0) {
                                    const letters = indexes.map((idx: number) => OPTION_LETTERS[idx] || '').filter(Boolean).join('');
                                    return letters || ua;
                                  }
                                  
                                  return ua;
                                })()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 font-semibold mb-1">正确答案：</p>
                              <p className="font-medium text-gray-800">
                                {(() => {
                                  if (!answer.correctAnswer) return '-';
                                  const ca = answer.correctAnswer.toString().trim();
                                  if (!ca) return '-';
                                  
                                  // 判断题：直接返回原值
                                  if (isJudge) return ca;
                                  
                                  // 尝试转换为字母格式显示
                                  let indexes: number[] = [];
                                  if (ca.includes(',')) {
                                    // 多选题：多个索引，如 "0,1,2"
                                    indexes = ca.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
                                  } else {
                                    // 单选题：单个索引，如 "2"
                                    const num = Number(ca);
                                    if (!isNaN(num)) {
                                      indexes = [num];
                                    }
                                  }
                                  
                                  if (indexes.length > 0) {
                                    const letters = indexes.map((idx: number) => OPTION_LETTERS[idx] || '').filter(Boolean).join('');
                                    return letters || ca;
                                  }
                                  
                                  return ca;
                                })()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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