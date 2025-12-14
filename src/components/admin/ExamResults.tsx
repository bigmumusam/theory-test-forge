import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Eye, RotateCcw, Download, Trash2 } from 'lucide-react';
import { post } from '@/lib/request';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [passStatus, setPassStatus] = useState<string>('all');
  const [retakeStatus, setRetakeStatus] = useState<string>('all');
  const [examNameFilter, setExamNameFilter] = useState<string>('');
  const [examNameDebounced, setExamNameDebounced] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ExamDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [retakeDialogOpen, setRetakeDialogOpen] = useState(false);
  const [retakeType, setRetakeType] = useState<'single' | 'batch'>('single');
  const [retakeRecordId, setRetakeRecordId] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<ExamResult | null>(null);

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
    try {
      // 构建查询参数，移除空值和'all'值
      const params: any = {
        pageNumber: currentPage,
        pageSize: pageSize
      };
      
      // 只添加有效的筛选条件
      // 如果状态是"已删除"，使用特殊的查询逻辑
      if (filterStatus === 'deleted') {
        // 查询已删除的记录
        params.includeDeleted = true;
        params.onlyDeleted = true;
        // 不设置 status 参数，因为已删除记录可能有各种状态
      } else {
        // 其他状态正常筛选（默认只查询未删除的记录）
        params.includeDeleted = false;
        params.onlyDeleted = false;
        if (filterStatus && filterStatus !== 'all') {
          params.status = filterStatus;
        }
      }
      
      if (passStatus && passStatus !== 'all') {
        params.passStatus = passStatus;
      }
      if (retakeStatus && retakeStatus !== 'all') {
        params.retakeStatus = retakeStatus;
      }
      if (examNameDebounced && examNameDebounced.trim()) {
        params.examName = examNameDebounced.trim();
      }
      if (searchTerm && searchTerm.trim()) {
        params.keyword = searchTerm.trim();
      }
      
      const res = await post('/exam/exam-results', params);
      
      // 检查响应数据是否存在
      if (res && res.data) {
        // 兼容不同的响应结构
        const pageData = res.data;
        setResults(pageData.records || pageData.list || []);
        setTotal(pageData.totalRow || pageData.total || 0);
      } else {
        setResults([]);
        setTotal(0);
        toast({
          title: "查询失败",
          description: "获取考试结果数据失败，请稍后重试",
          variant: "destructive"
        });
      }
      setSelectedResults([]); // 切页时清空多选
    } catch (error) {
      console.error('获取考试结果失败:', error);
      setResults([]);
      setTotal(0);
      setSelectedResults([]);
      toast({
        title: "查询失败",
        description: "获取考试结果数据失败，请稍后重试",
        variant: "destructive"
      });
    }
  };

  // 防抖处理考试名称筛选
  useEffect(() => {
    const timer = setTimeout(() => {
      setExamNameDebounced(examNameFilter);
    }, 500);
    return () => clearTimeout(timer);
  }, [examNameFilter]);

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line
  }, [filterStatus, passStatus, retakeStatus, examNameDebounced, searchTerm, currentPage]);

  // 直接使用后端返回的数据，不进行前端排序
  const paginatedResults = results;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getStatusBadge = (status: string) => {
    // 如果当前筛选的是"已删除"状态，显示"已删除"标识
    if (filterStatus === 'deleted') {
      return <Badge variant="destructive" className="bg-red-100 text-red-800">已删除</Badge>;
    }
    
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">已完成</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">进行中</Badge>;
      default:
        return <Badge variant="secondary">未知</Badge>;
    }
  };

  const getScoreColor = (score: number, totalScore: number) => {
    // 处理 NaN 和 null 值
    if (isNaN(score) || score === null || score === undefined) {
      return 'text-gray-500 font-semibold';
    }
    if (isNaN(totalScore) || totalScore === null || totalScore === undefined || totalScore === 0) {
      return 'text-gray-500 font-semibold';
    }
    
    const percentage = (score / totalScore) * 100;
    if (percentage >= 90) return 'text-green-600 font-semibold';
    if (percentage >= 80) return 'text-blue-600 font-semibold';
    if (percentage >= 70) return 'text-yellow-600 font-semibold';
    if (percentage >= 60) return 'text-orange-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  // 全选所有已完成的行
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResults(paginatedResults.filter(r => r.status === 'completed').map(r => r.recordId));
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

  // 单个重考确认
  const handleSingleRetake = (recordId: string) => {
    setRetakeType('single');
    setRetakeRecordId(recordId);
    setRetakeDialogOpen(true);
  };

  // 执行单个重考
  const executeSingleRetake = async () => {
    try {
      await post('/exam/exam-results/batch-retake', { recordIds: [retakeRecordId] });
      toast({
        title: "重新考试",
        description: "已为该考生安排重新考试"
      });
      setRetakeDialogOpen(false);
      fetchResults();
    } catch (e) {
      toast({
        title: "操作失败",
        description: "重考失败，请重试",
        variant: "destructive"
      });
    }
  };

  // 批量重考确认
  const handleBatchRetake = () => {
    if (selectedResults.length === 0) {
      toast({
        title: "请选择记录",
        description: "请先选择要重新考试的记录",
        variant: "destructive"
      });
      return;
    }
    setRetakeType('batch');
    setRetakeDialogOpen(true);
  };

  // 执行批量重考
  const executeBatchRetake = async () => {
    try {
      // selectedResults存的就是recordId
      await post('/exam/exam-results/batch-retake', { recordIds: selectedResults });
      toast({
        title: "批量重新考试",
        description: `已为 ${selectedResults.length} 位考生安排重新考试`
      });
      setSelectedResults([]);
      setRetakeDialogOpen(false);
      fetchResults();
    } catch (e) {
      toast({
        title: "操作失败",
        description: "批量重考失败，请重试",
        variant: "destructive"
      });
    }
  };

  // 删除考试记录
  const handleDelete = (result: ExamResult) => {
    console.log('点击删除按钮，考试记录:', result);
    setRecordToDelete(result);
    setDeleteDialogOpen(true);
  };

  // 确认删除
  const confirmDelete = async () => {
    if (!recordToDelete) return;
    
    try {
      console.log('开始删除考试记录，recordId:', recordToDelete.recordId);
      const response = await post('/exam/exam-results/delete', { recordId: recordToDelete.recordId });
      console.log('删除接口响应:', response);
      toast({
        title: "删除成功",
        description: "考试记录已删除"
      });
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
      fetchResults();
    } catch (error: any) {
      console.error('删除考试记录失败:', error);
      console.error('删除接口错误详情:', {
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        data: error?.response?.data
      });
      const errorMessage = error?.response?.data?.message || error?.message || "删除考试记录失败，请重试";
      toast({
        title: "删除失败",
        description: errorMessage,
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

  const exportResults = async () => {
    try {
      // 构建查询参数（导出时不需要分页参数，获取所有符合条件的数据）
      const queryParams: any = {};

      // 根据筛选状态设置参数
      if (filterStatus === 'deleted') {
        // 筛选已删除的记录
        queryParams.includeDeleted = true;
        queryParams.onlyDeleted = true;
        // 不设置 status 参数，因为已删除记录可能有各种状态
      } else {
        // 其他状态正常筛选（默认只查询未删除的记录）
        queryParams.includeDeleted = false;
        queryParams.onlyDeleted = false;
        if (filterStatus && filterStatus !== 'all') {
          queryParams.status = filterStatus;
        }
      }
      
      if (passStatus && passStatus !== 'all') {
        queryParams.passStatus = passStatus;
      }
      if (retakeStatus && retakeStatus !== 'all') {
        queryParams.retakeStatus = retakeStatus;
      }
      if (examNameDebounced && examNameDebounced.trim()) {
        queryParams.examName = examNameDebounced.trim();
      }
      if (searchTerm && searchTerm.trim()) {
        queryParams.keyword = searchTerm.trim();
      }

      // 调用后端导出API
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/exam/exam-results/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(queryParams)
      });

      if (!response.ok) {
        throw new Error('导出失败');
      }

      // 获取文件名
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'exam_results.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.+)/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // 下载文件
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "导出成功",
        description: "考试结果已导出到Excel文件"
      });
    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: "导出失败",
        description: "导出考试结果时发生错误，请重试",
        variant: "destructive"
      });
    }
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
          {selectedResults.length > 0 && paginatedResults.some(r => r.status === 'completed' && selectedResults.includes(r.recordId)) && filterStatus !== 'deleted' && (
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

          <div className="w-48">
            <Input 
              placeholder="筛选考试名称..."
              value={examNameFilter}
              onChange={(e) => setExamNameFilter(e.target.value)}
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
              <SelectItem value="in-progress">进行中</SelectItem>
              <SelectItem value="deleted">已删除</SelectItem>
            </SelectContent>
          </Select>

          <Select value={passStatus} onValueChange={setPassStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="及格状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="pass">及格</SelectItem>
              <SelectItem value="fail">不及格</SelectItem>
            </SelectContent>
          </Select>

          <Select value={retakeStatus} onValueChange={setRetakeStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="重考状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="normal">正常考试</SelectItem>
              <SelectItem value="retake">重考</SelectItem>
            </SelectContent>
          </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setFilterStatus('all');
                setPassStatus('all');
                setRetakeStatus('all');
                setExamNameFilter('');
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
                  {filterStatus !== 'deleted' && (
                    <Checkbox
                      checked={paginatedResults.filter(r => r.status === 'completed').length > 0 && paginatedResults.filter(r => r.status === 'completed').every(r => selectedResults.includes(r.recordId))}
                      onCheckedChange={handleSelectAll}
                    />
                  )}
                </TableHead>
                <TableHead className="font-bold text-gray-900">考生姓名</TableHead>
                <TableHead className="font-bold text-gray-900">身份证号</TableHead>
                <TableHead className="font-bold text-gray-900">考试名称</TableHead>

                <TableHead className="font-bold text-gray-900">考试得分</TableHead>
                <TableHead className="font-bold text-gray-900">用时</TableHead>
                <TableHead className="font-bold text-gray-900">完成时间</TableHead>
                <TableHead className="font-bold text-gray-900">状态</TableHead>
                <TableHead className="font-bold text-gray-900">重考</TableHead>
                <TableHead className="font-bold text-gray-900 w-32">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedResults.map(result => {
                const rowKey = result.recordId;
                return (
                  <TableRow key={rowKey}>
                  <TableCell>
                      {result.status === 'completed' && filterStatus !== 'deleted' && (
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
                  <TableCell>
                    <div>
                        <p className={getScoreColor(Number(result.score), Number(result.totalScore || 100))}>
                          {result.score !== null && result.score !== undefined ? 
                            `${result.score}/${result.totalScore || 100}` : 
                            '未评分'
                          }
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
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {/* 已完成且未删除的记录才能重考 */}
                      {result.status === 'completed' && filterStatus !== 'deleted' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSingleRetake(result.recordId)}
                          disabled={false}
                          title="重新考试"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                      {/* 已删除的记录不显示删除按钮 */}
                      {filterStatus !== 'deleted' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(result)}
                          title="删除记录"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
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
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-6 gap-2">
            <div className="text-sm text-gray-500 mb-2 md:mb-0 whitespace-nowrap">
              {total === 0
                ? '暂无记录'
                : `第 ${currentPage} 页，共 ${totalPages} 页 | 显示 ${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, total)} 条，共 ${total} 条记录`}
            </div>
            <div className="w-full md:w-auto min-w-0">
              <Pagination className="max-w-full">
                <PaginationContent className="flex-wrap justify-center gap-1">
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  >
                    上一页
                  </PaginationPrevious>
                </PaginationItem>
                {/* 显示页码 - 智能分页，最多显示7个页码，使用省略号 */}
                {(() => {
                  const maxVisiblePages = 7;
                  const pages: (number | 'ellipsis')[] = [];
                  
                  if (totalPages <= maxVisiblePages) {
                    // 如果总页数少于等于7，显示所有页码
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // 始终显示第一页
                    pages.push(1);
                    
                    if (currentPage <= 4) {
                      // 当前页在前4页，显示 1 2 3 4 5 ... 最后一页
                      for (let i = 2; i <= 5; i++) {
                        pages.push(i);
                      }
                      pages.push('ellipsis');
                      pages.push(totalPages);
                    } else if (currentPage >= totalPages - 3) {
                      // 当前页在后4页，显示 1 ... 倒数4页 最后一页
                      pages.push('ellipsis');
                      for (let i = totalPages - 4; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // 当前页在中间，显示 1 ... 当前页前后各2页 ... 最后一页
                      pages.push('ellipsis');
                      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                        pages.push(i);
                      }
                      pages.push('ellipsis');
                      pages.push(totalPages);
                    }
                  }
                  
                  return pages.map((page, index) => {
                    if (page === 'ellipsis') {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className={currentPage === page ? 'font-bold text-blue-700 bg-blue-50' : 'cursor-pointer'}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  });
                })()}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  >
                    下一页
                  </PaginationNext>
                </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
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
                            {expanded === String(idx) && (optionsToShow && optionsToShow.length > 0 ? (
                              <div className="pl-8 pb-2">
                                {/* 多选题答案顺序显示 */}
                                {ans.questionType === 'multi' && !isJudge && (
                                  <div className="mb-3 space-y-2">
                                    {/* 正确答案顺序 */}
                                    {(() => {
                                      let correctIndexes: number[] = [];
                                      if (Array.isArray(ans.correctAnswer)) {
                                        correctIndexes = ans.correctAnswer.map((idx: any) => Number(idx));
                                      } else if (typeof ans.correctAnswer === 'string') {
                                        const ca = ans.correctAnswer.trim();
                                        if (ca.includes(',')) {
                                          // 索引格式：如 "1,3,0,2"
                                          correctIndexes = ca.split(',').map((s: string) => Number(s.trim()));
                                        } else if (/^[A-Za-z]+$/.test(ca)) {
                                          // 字母格式：如 "BDAC"，转换为索引数组
                                          correctIndexes = ca.toUpperCase().split('').map((char: string) => {
                                            return char.charCodeAt(0) - 'A'.charCodeAt(0);
                                          });
                                        } else {
                                          correctIndexes = [Number(ca)];
                                        }
                                      }
                                      const correctOrder = correctIndexes.map(idx => OPTION_LETTERS[idx] || '').filter(Boolean).join('→');
                                      return correctOrder ? (
                                        <div className="text-sm">
                                          <span className="font-semibold text-gray-700">正确答案顺序：</span>
                                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 font-bold rounded">{correctOrder}</span>
                                        </div>
                                      ) : null;
                                    })()}
                                    {/* 用户答案顺序 */}
                                    {(() => {
                                      let userIndexes: number[] = [];
                                      if (Array.isArray(ans.userAnswer)) {
                                        userIndexes = ans.userAnswer.map((idx: any) => Number(idx));
                                      } else if (typeof ans.userAnswer === 'string') {
                                        const ua = ans.userAnswer.trim();
                                        if (ua && ua.includes(',')) {
                                          userIndexes = ua.split(',').map((s: string) => Number(s.trim()));
                                        } else if (ua) {
                                          userIndexes = [Number(ua)];
                                        }
                                      }
                                      const userOrder = userIndexes.map(idx => OPTION_LETTERS[idx] || '').filter(Boolean).join('→');
                                      return (
                                        <div className="text-sm">
                                          <span className="font-semibold text-gray-700">您的答案顺序：</span>
                                          {userOrder ? (
                                            <span className={`ml-2 px-2 py-1 font-bold rounded ${ans.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{userOrder}</span>
                                          ) : (
                                            <span className="ml-2 px-2 py-1 font-bold rounded bg-gray-100 text-gray-500 italic">未作答</span>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                )}
                                <ul className="space-y-1">
                                  {optionsToShow.map((opt: string, i: number) => {
                                    let displayOpt = opt;
                                    let letter = OPTION_LETTERS[i] || '';
                                    // 判断题特殊处理
                                    if (isJudge) {
                                      displayOpt = opt;
                                      letter = OPTION_LETTERS[i] || '';
                                    }
                                    
                                    // 根据题目类型处理答案比较
                                    let isCorrect = false;
                                    let isUserSelected = false;
                                    
                                    if (isJudge) {
                                      // 判断题：比较字符串答案
                                      const correctAnswer = Array.isArray(ans.correctAnswer) ? ans.correctAnswer[0] : ans.correctAnswer;
                                      const userAnswer = Array.isArray(ans.userAnswer) ? ans.userAnswer[0] : ans.userAnswer;
                                      isCorrect = correctAnswer === opt;
                                      isUserSelected = userAnswer === opt;
                                    } else {
                                      // 选择题：比较数字索引
                                      let correctIndexes: number[] = [];
                                      let userIndexes: number[] = [];
                                      
                                      // 处理正确答案（支持索引格式和字母格式）
                                      if (Array.isArray(ans.correctAnswer)) {
                                        correctIndexes = ans.correctAnswer.map((idx: any) => Number(idx));
                                      } else if (typeof ans.correctAnswer === 'string') {
                                        const ca = ans.correctAnswer.trim();
                                        if (ca.includes(',')) {
                                          // 索引格式：如 "1,3,0,2"
                                          correctIndexes = ca.split(',').map((s: string) => Number(s.trim()));
                                        } else if (/^[A-Za-z]+$/.test(ca)) {
                                          // 字母格式：如 "BDAC"，转换为索引数组
                                          correctIndexes = ca.toUpperCase().split('').map((char: string) => {
                                            return char.charCodeAt(0) - 'A'.charCodeAt(0);
                                          });
                                        } else {
                                          correctIndexes = [Number(ca)];
                                        }
                                      } else {
                                        correctIndexes = [Number(ans.correctAnswer)];
                                      }
                                      
                                      // 处理用户答案
                                      if (Array.isArray(ans.userAnswer)) {
                                        userIndexes = ans.userAnswer.map((idx: any) => Number(idx));
                                      } else if (typeof ans.userAnswer === 'string') {
                                        const ua = ans.userAnswer.trim();
                                        if (ua === '') {
                                          // 未作答：保持 userIndexes 为空数组，不高亮任何选项
                                          userIndexes = [];
                                        } else if (ua.includes(',')) {
                                          userIndexes = ua.split(',').map((s: string) => Number(s.trim()));
                                        } else {
                                          userIndexes = [Number(ua)];
                                        }
                                      } else {
                                        userIndexes = [Number(ans.userAnswer)];
                                      }
                                      
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
                                    
                                    return (
                                      <li
                                        key={i}
                                        className={`flex items-center w-full px-4 py-1 rounded text-sm transition-all ${highlightClass}`}
                                        style={{ fontSize: '0.95em' }}
                                      >
                                        <span className="inline-block w-5 text-center mr-2 font-bold">{letter}.</span>
                                        <span className="break-all flex-1">{displayOpt}</span>
                                      </li>
                                    );
                                  })}
                                </ul>
                                {/* 显示用户答案文本（仅单选题和判断题，多选题已有顺序显示） */}
                                {ans.questionType !== 'multi' && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="text-gray-600 font-semibold mb-1">您的答案：</p>
                                        <p className={`font-medium ${ans.userAnswer && ans.userAnswer.toString().trim() ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                                          {(() => {
                                            if (!ans.userAnswer) return '未作答';
                                            const ua = ans.userAnswer.toString().trim();
                                            if (!ua) return '未作答';
                                            
                                            // 判断题：直接返回原值
                                            if (isJudge) return ua;
                                            
                                            // 单选题：转换为字母格式显示
                                            const num = Number(ua);
                                            if (!isNaN(num)) {
                                              return OPTION_LETTERS[num] || ua;
                                            }
                                            
                                            return ua;
                                          })()}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-600 font-semibold mb-1">正确答案：</p>
                                        <p className="font-medium text-gray-800">
                                          {(() => {
                                            if (!ans.correctAnswer) return '-';
                                            const ca = ans.correctAnswer.toString().trim();
                                            if (!ca) return '-';
                                            
                                            // 判断题：直接返回原值
                                            if (isJudge) return ca;
                                            
                                            // 单选题：转换为字母格式显示
                                            const num = Number(ca);
                                            if (!isNaN(num)) {
                                              return OPTION_LETTERS[num] || ca;
                                            }
                                            
                                            return ca;
                                          })()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              // 如果选项列表为空，直接显示答案对比（仅单选题和判断题）
                              ans.questionType !== 'multi' && (
                                <div className="pl-8 pb-2">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="text-gray-600 font-semibold mb-1">您的答案：</p>
                                      <p className={`font-medium ${ans.userAnswer && ans.userAnswer.toString().trim() ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                                        {(() => {
                                          if (!ans.userAnswer) return '未作答';
                                          const ua = ans.userAnswer.toString().trim();
                                          if (!ua) return '未作答';
                                          
                                          // 判断题：直接返回原值
                                          if (isJudge) return ua;
                                          
                                          // 单选题：转换为字母格式显示
                                          const num = Number(ua);
                                          if (!isNaN(num)) {
                                            return OPTION_LETTERS[num] || ua;
                                          }
                                          
                                          return ua;
                                        })()}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600 font-semibold mb-1">正确答案：</p>
                                      <p className="font-medium text-gray-800">
                                        {(() => {
                                          if (!ans.correctAnswer) return '-';
                                          const ca = ans.correctAnswer.toString().trim();
                                          if (!ca) return '-';
                                          
                                          // 判断题：直接返回原值
                                          if (isJudge) return ca;
                                          
                                          // 单选题：转换为字母格式显示
                                          const num = Number(ca);
                                          if (!isNaN(num)) {
                                            return OPTION_LETTERS[num] || ca;
                                          }
                                          
                                          return ca;
                                        })()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )
                            ))}
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

      {/* 重考确认弹窗 */}
      <Dialog open={retakeDialogOpen} onOpenChange={setRetakeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>确认重新考试</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {retakeType === 'single' ? '确认重新考试' : '确认批量重新考试'}
              </h3>
              <p className="text-gray-600 text-sm">
                {retakeType === 'single' 
                  ? '确定要为该考生安排重新考试吗？' 
                  : `确定要为 ${selectedResults.length} 位考生安排重新考试吗？`
                }
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">重要提醒：</p>
                  <p>• 考生需要重新完成所有题目</p>
                  <p>• 此操作不可撤销</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setRetakeDialogOpen(false)}
                className="flex-1"
              >
                取消
              </Button>
              <Button 
                onClick={retakeType === 'single' ? executeSingleRetake : executeBatchRetake}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                确认重新考试
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除该考试记录吗？此操作将逻辑删除该记录，删除后可以通过筛选条件查看已删除的记录。此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {results.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500">暂无考试结果</p>
        </Card>
      )}
    </div>
  );
};

export default ExamResults;
