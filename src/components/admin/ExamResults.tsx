import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Eye, RotateCcw, Download, Trash2 } from 'lucide-react';
import { post } from '@/lib/request';

interface ExamResult {
  recordId: string;
  id?: string;
  idNumber?: string;
  userName?: string;
  studentName?: string;
  examName?: string;
  categoryName?: string;
  category?: string;
  score?: number | string;
  totalScore?: number | string;
  duration?: number | string;
  examDate?: string;
  completedAt?: string;
  status?: string;
  retake?: number | string; // 0/1
}

interface ExamDetailAnswer {
  questionType: string;
  questionContent: string;
  questionOptions: string[];
  correctAnswer: string;
  userAnswer: string | string[];
  isCorrect: number; // 0/1
  score: string | number;
}

interface ExamDetail {
  answers: ExamDetailAnswer[];
}

// 判断题类型的标识（可根据后端实际类型调整）
const JUDGE_TYPES = ['judgment', '判断题'];

// 选项字母序列
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

if (typeof window !== 'undefined' && !document.getElementById('draggable-dialog-style')) {
  const style = document.createElement('style');
  style.id = 'draggable-dialog-style';
  style.innerHTML = `
    .draggable-dialog {
      left: 50% !important;
      top: 50% !important;
      transform: translate(-50%, -50%) !important;
      position: fixed !important;
      z-index: 50;
    }
    .draggable-dialog-handle {
      cursor: move;
      user-select: none;
    }
  `;
  document.head.appendChild(style);
}

const ExamResults: React.FC = () => {
  const { toast } = useToast();
  const [summary, setSummary] = useState<any>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ExamDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const categories = ['消化内科', '肝胆外科', '心血管内科', '呼吸内科'];
  // 答题详情展开状态
  const [expanded, setExpanded] = React.useState<string | null>(null);

  // 获取汇总信息
  useEffect(() => {
    post('/exam/exam-summary').then(res => {
      setSummary(res.data);
    });
  }, []);

  // 获取考试结果列表
  const fetchResults = async () => {
    const params = {
      category: filterCategory === 'all' ? undefined : filterCategory,
      status: filterStatus === 'all' ? undefined : filterStatus,
      keyword: searchTerm,
      page: currentPage,
      size: pageSize
    };
    const res = await post('/exam/exam-results', params);
    setResults(res.data.records || []);
    setTotal(res.data.totalRow || 0);
    setSelectedResults([]); // 切页时清空多选
  };

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line
  }, [filterCategory, filterStatus, searchTerm, currentPage]);

  // 排序：待开始 > 进行中 > 已完成/超时
  const sortedResults = [...results].sort((a, b) => {
    const statusOrder = {
      'pending': 0,
      'notStarted': 0,
      'in-progress': 1,
      'completed': 2,
      'timeout': 2
    };
    return (statusOrder[a.status || ''] ?? 99) - (statusOrder[b.status || ''] ?? 99);
  });
  const paginatedResults = sortedResults;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">已完成</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">进行中</Badge>;
      case 'timeout':
        return <Badge variant="destructive">超时</Badge>;
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

  // 全选只选未重考的行
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResults(paginatedResults.filter(r => r.retake != 1).map(r => r.recordId));
    } else {
      setSelectedResults([]);
    }
  };

  const handleSelectResult = (resultId: string, checked: boolean) => {
    if (checked) {
      setSelectedResults(prev => Array.from(new Set([...prev, resultId])));
    } else {
      setSelectedResults(prev => prev.filter(id => id !== resultId));
    }
  };

  // 批量重考
  const handleBatchRetake = async () => {
    if (selectedResults.length === 0) {
      toast({
        title: "请选择记录",
        description: "请先选择要重新考试的记录",
        variant: "destructive"
      });
      return;
    }
    try {
      // selectedResults存的就是recordId
      await post('/exam/exam-results/batch-retake', { recordIds: selectedResults });
    toast({
      title: "批量重新考试",
      description: `已为 ${selectedResults.length} 位考生安排重新考试`
    });
    setSelectedResults([]);
      fetchResults();
    } catch (e) {
      toast({
        title: "操作失败",
        description: "批量重考失败，请重试",
        variant: "destructive"
      });
    }
  };

  // 查看详情
  const handleViewDetail = async (result: ExamResult) => {
    setLoadingDetail(true);
    setDetailDialogOpen(true);
    try {
      const res = await post(`/exam/exam-results/getDetail`, { recordId: result.recordId });
      // 适配后端真实结构
      const answers: ExamDetailAnswer[] = Array.isArray(res.data) ? res.data.map((item: any) => ({
        questionType: item.questionType,
        questionContent: item.questionContent,
        questionOptions: Array.isArray(item.questionOptions) ? item.questionOptions : (typeof item.questionOptions === 'string' ? JSON.parse(item.questionOptions) : []),
        correctAnswer: item.correctAnswer,
        userAnswer: item.userAnswer,
        isCorrect: item.isCorrect,
        score: item.score,
      })) : [];
      setSelectedResult({ answers });
    } catch (e) {
      toast({ title: '加载失败', description: '获取考试详情失败', variant: 'destructive' });
      setSelectedResult(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const exportResults = () => {
    const csvContent = [
      ['姓名', '身份证号', '考试名称', '题目分类', '得分', '总分', '用时(分钟)', '完成时间', '状态'],
      ...results.map(result => [
        result.userName || result.studentName,
        result.idNumber || '',
        result.examName,
        result.categoryName || result.category,
        result.score?.toString() || '',
        result.totalScore?.toString() || '',
        result.duration?.toString() || '',
        result.examDate || result.completedAt || '',
        result.status === 'completed' ? '已完成' : result.status === 'timeout' ? '超时' : '进行中'
      ])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '考试结果.csv';
    link.click();
  };

  // 拖动逻辑
  useEffect(() => {
    const dialog = document.querySelector('.draggable-dialog') as HTMLElement | null;
    const handle = document.querySelector('.draggable-dialog-handle') as HTMLElement | null;
    if (!dialog || !handle) return;
    let isDragging = false;
    let startX = 0, startY = 0, origX = 0, origY = 0;
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = dialog.getBoundingClientRect();
      origX = rect.left;
      origY = rect.top;
      document.body.style.userSelect = 'none';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      dialog.style.left = `${origX + dx}px`;
      dialog.style.top = `${Math.max(0, origY + dy)}px`;
      dialog.style.right = 'auto';
      dialog.style.margin = '0';
      dialog.style.transform = '';
    };
    const onMouseUp = () => {
      isDragging = false;
      document.body.style.userSelect = '';
    };
    handle.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      handle.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [detailDialogOpen]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">考试结果</h2>
        <div className="flex space-x-2">
          {selectedResults.length > 0 && paginatedResults.some(r => r.retake != 1 && selectedResults.includes(r.recordId)) && (
            <Button onClick={handleBatchRetake} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              批量重新考试 ({selectedResults.length})
            </Button>
          )}
          <Button onClick={exportResults} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出结果
          </Button>
        </div>
      </div>
      {/* 汇总信息 */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="text-center">
            <p className="text-blue-100 text-sm">总考试次数</p>
            <p className="text-2xl font-bold">{summary ? summary.examCount : '--'}</p>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="text-center">
            <p className="text-green-100 text-sm">参与人数</p>
            <p className="text-2xl font-bold">{summary ? summary.participantCount : '--'}</p>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="text-center">
            <p className="text-purple-100 text-sm">平均分</p>
            <p className="text-2xl font-bold">{summary ? summary.avgScore : '--'}</p>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="text-center">
            <p className="text-orange-100 text-sm">及格人数</p>
            <p className="text-2xl font-bold">{summary ? summary.passCount : '--'}</p>
          </div>
        </Card>
      </div>
      {/* 筛选和搜索 */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <Input 
              placeholder="搜索姓名或身份证号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="筛选题目分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部题目分类</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
              <SelectItem value="in-progress">进行中</SelectItem>
              <SelectItem value="timeout">超时</SelectItem>
            </SelectContent>
          </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setFilterCategory('all');
                setFilterStatus('all');
                setSearchTerm('');
                setCurrentPage(1);
              }}
            >
              清除筛选
            </Button>
        </div>
      </Card>
      {/* 结果表格 */}
      <Card className="p-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={paginatedResults.filter(r => r.retake != 1).length > 0 && paginatedResults.filter(r => r.retake != 1).every(r => selectedResults.includes(r.recordId))}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="font-bold text-gray-900">考生姓名</TableHead>
                <TableHead className="font-bold text-gray-900">身份证号</TableHead>
                <TableHead className="font-bold text-gray-900">考试名称</TableHead>
                <TableHead className="font-bold text-gray-900">题目分类</TableHead>
                <TableHead className="font-bold text-gray-900">考试得分</TableHead>
                <TableHead className="font-bold text-gray-900">用时</TableHead>
                <TableHead className="font-bold text-gray-900">完成时间</TableHead>
                <TableHead className="font-bold text-gray-900">状态</TableHead>
                <TableHead className="font-bold text-gray-900">是否重考过</TableHead>
                <TableHead className="font-bold text-gray-900 w-32">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedResults.map(result => {
                const rowKey = result.recordId;
                return (
                  <TableRow key={rowKey}>
                  <TableCell>
                      {result.retake == 1 ? null : (
                    <Checkbox
                          checked={selectedResults.includes(rowKey)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedResults(prev => Array.from(new Set([...prev, rowKey])));
                            } else {
                              setSelectedResults(prev => prev.filter(id => id !== rowKey));
                            }
                          }}
                        />
                      )}
                  </TableCell>
                  <TableCell>
                    <div>
                        <p className="font-medium">{result.userName || result.studentName}</p>
                    </div>
                  </TableCell>
                    <TableCell className="font-mono text-sm">{result.idNumber}</TableCell>
                  <TableCell>{result.examName}</TableCell>
                    <TableCell>{result.categoryName || result.category}</TableCell>
                  <TableCell>
                    <div>
                        <p className={getScoreColor(Number(result.score), Number(result.totalScore || 100))}>
                          {result.score}/{result.totalScore || 100}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{result.duration}分钟</TableCell>
                  <TableCell>
                    <div>
                        <p className="text-sm">{result.examDate || result.completedAt || '-'}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(result.status)}</TableCell>
                    <TableCell>
                      <span className={result.retake == 1 ? 'text-green-600 font-bold' : 'text-gray-600'}>
                        {result.retake == 1 ? '是' : '否'}
                      </span>
                    </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetail(result)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {result.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                            onClick={() => handleBatchRetake()}
                            disabled={result.retake == 1}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {/* 分页 */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-6 gap-2">
          <div className="text-sm text-gray-500 mb-2 md:mb-0 whitespace-nowrap">
            {total === 0
              ? '0 到 0 条，共 0 条记录'
              : `${(currentPage - 1) * pageSize + 1} 到 ${Math.min(currentPage * pageSize, total)} 条，共 ${total} 条记录`}
          </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                >上一页</PaginationPrevious>
                </PaginationItem>
              <PaginationItem>
                    <PaginationLink
                  isActive
                  className="font-bold text-blue-700 cursor-default"
                    >
                  {currentPage}
                    </PaginationLink>
                  </PaginationItem>
                <PaginationItem>
                  <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                >下一页</PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
      </Card>
      {/* 详情弹窗优化 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-5xl min-h-[75vh] relative draggable-dialog flex flex-col items-stretch pt-0">
          <div className="draggable-dialog-handle h-6 w-full cursor-move select-none" />
          <DialogHeader className="mb-2">
            <DialogTitle>答题详情</DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="text-center py-8 text-gray-400">加载中...</div>
          ) : selectedResult ? (
            (() => {
              const detailData = selectedResult;
              return (
                <div className="flex-1 flex flex-col">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 overflow-y-auto" style={{ maxHeight: '60vh', minHeight: '200px' }}>
                    {detailData.answers && detailData.answers.length > 0 ? (
                      detailData.answers.map((ans, idx) => {
                        const userAnswers = Array.isArray(ans.userAnswer) ? ans.userAnswer : [ans.userAnswer];
                        // 判断题特殊处理
                        const isJudge = JUDGE_TYPES.includes(ans.questionType);
                        let optionsToShow: string[] = ans.questionOptions;
                        if (isJudge) {
                          optionsToShow = ['正确', '错误'];
                        }
                        return (
                          <div
                            key={idx}
                            className={`rounded border bg-gray-50 mb-2 transition-all duration-200 ${expanded === String(idx) ? 'shadow-lg' : ''}`}
                            style={{ minHeight: '44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                          >
                            <div
                              className="flex items-center select-none cursor-pointer px-4 py-2"
                              style={{ minHeight: '36px' }}
                              onClick={() => setExpanded(expanded === String(idx) ? null : String(idx))}
                            >
                              <span className="mr-2 text-gray-500">{idx + 1}.</span>
                              <span className="font-medium mr-2">{ans.questionContent}</span>
                              <span className="ml-2 text-xs text-gray-500">得分：<span className="font-bold text-gray-800">{ans.score}</span></span>
                              <span className={`ml-2 px-2 py-0.5 rounded text-xs ${ans.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{ans.isCorrect ? '✔ 正确' : '✘ 错误'}</span>
                </div>
                            {optionsToShow && optionsToShow.length > 0 && expanded === String(idx) && (
                              <div className="pl-8 pb-2">
                                <ul className="space-y-1">
                                  {optionsToShow.map((opt: string, i: number) => {
                                    let displayOpt = opt;
                                    let letter = OPTION_LETTERS[i] || '';
                                    // 判断题特殊处理
                                    if (isJudge) {
                                      displayOpt = opt;
                                      letter = OPTION_LETTERS[i] || '';
                                    }
                                    // 适配下标型 correctAnswer/userAnswer
                                    const correctIndexes = Array.isArray(ans.correctAnswer) ? ans.correctAnswer : [ans.correctAnswer];
                                    const userIndexes = Array.isArray(ans.userAnswer) ? ans.userAnswer : [ans.userAnswer];
                                    const isCorrect = correctIndexes.includes(i);
                                    const isUserSelected = userIndexes.includes(i);
                                    let highlightClass = '';
                                    if (isCorrect && isUserSelected) {
                                      highlightClass = 'bg-green-100 text-green-700 font-bold'; // 选对
                                    } else if (isCorrect) {
                                      highlightClass = 'bg-green-50 text-green-700 font-bold'; // 正确但未选
                                    } else if (isUserSelected) {
                                      highlightClass = 'bg-red-100 text-red-700 font-bold'; // 选错
                                    }
                                    return (
                                      <li
                                        key={i}
                                        className={`flex items-center w-full px-4 py-1 rounded text-sm transition-all ${highlightClass}`}
                                        style={{ fontSize: '0.95em' }}
                                      >
                                        <span className="inline-block w-5 text-center mr-2 font-bold">{letter}.</span>
                                        <span className="break-all">{displayOpt}</span>
                                      </li>
                                    );
                                  })}
                                </ul>
                </div>
                            )}
                </div>
                        );
                      })
                    ) : (
                      <div className="text-gray-400 text-center py-8">暂无答题数据</div>
                    )}
                </div>
                </div>
              );
            })()
          ) : null}
          <Button variant="outline" className="absolute right-6 bottom-6" onClick={() => setDetailDialogOpen(false)}>
                    关闭
                  </Button>
        </DialogContent>
      </Dialog>
      {results.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500">暂无考试结果</p>
        </Card>
      )}
    </div>
  );
};

export default ExamResults;
