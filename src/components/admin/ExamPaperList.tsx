import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Eye, Download, Trash2, RefreshCw, Search, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOptions } from '@/context/OptionsContext';
import { post } from '@/lib/request';
import { ExamPaperListItem, ExamPaperQueryParams, ExamPaperListResponse } from '@/types/exam';
import PreviewExamPaperDialog from './PreviewExamPaperDialog';
import { ApiResponse } from '@/types/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

// 递归渲染分类选项
const renderCategoryOptions = (categories: any[], level = 0): React.ReactNode[] => {
  return categories.map(category => {
    const indent = '　'.repeat(level); // 使用全角空格进行缩进
    const label = `${indent}${category.categoryName}`;
    const hasChildren = category.children && category.children.length > 0;
    
    return [
      <SelectItem key={category.categoryId} value={category.categoryId} disabled={hasChildren}>
        {label}
      </SelectItem>,
      ...(hasChildren 
        ? renderCategoryOptions(category.children, level + 1) 
        : []
      )
    ];
  }).flat();
};

// 递归查找分类名称
const getCategoryNameById = (categories: any[], categoryId: string): string | null => {
  if (!categories) return null;
  
  for (const category of categories) {
    if (category.categoryId === categoryId) {
      return category.categoryName;
    }
    if (category.children && category.children.length > 0) {
      const found = getCategoryNameById(category.children, categoryId);
      if (found) return found;
    }
  }
  return null;
};

const ALL_VALUE = "__ALL__";

const ExamPaperList: React.FC = () => {
  const [papers, setPapers] = useState<ExamPaperListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  
  // 筛选条件
  const [filters, setFilters] = useState<ExamPaperQueryParams>({
    paperName: '',
    categoryId: '',
    status: '',
    pageNumber: 1,
    pageSize: 10
  });

  const { toast } = useToast();
  const { options } = useOptions();

  // 考试情况相关状态
  const [examStatusDialogOpen, setExamStatusDialogOpen] = useState(false);
  const [examStatusData, setExamStatusData] = useState<any>(null);
  const [examDetailData, setExamDetailData] = useState<any[]>([]);
  const [loadingExamStatus, setLoadingExamStatus] = useState(false);

  const [previewPaper, setPreviewPaper] = useState<ExamPaperListItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // 删除确认对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState<ExamPaperListItem | null>(null);

  // 获取试卷列表
  const fetchPapers = async (params: ExamPaperQueryParams) => {
    setLoading(true);
    try {
      const response = await post<ApiResponse<ExamPaperListResponse>>('/admin/generated-papers/list', params);
      
      if (response.code === 200) {
        const data = response.data;
        console.log('试卷列表响应数据:', data); // 调试信息
        
        // MyBatis-Flex Page 对象的字段名可能是 records, total, pages, current
        setPapers(data.records || data.list || []);
        setTotal(data.total || data.totalRow || 0);
        setTotalPages(data.pages || Math.ceil((data.total || data.totalRow || 0) / pageSize));
        setCurrentPage(data.current || data.pageNumber || 1);
        
        console.log('分页信息:', {
          papers: data.records || data.list || [],
          total: data.total || data.totalRow || 0,
          pages: data.pages || Math.ceil((data.total || data.totalRow || 0) / pageSize),
          current: data.current || data.pageNumber || 1
        });
      } else {
        toast({
          title: "加载失败",
          description: response.message || "获取试卷列表失败",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('获取试卷列表失败:', error);
      toast({
        title: "加载失败",
        description: "获取试卷列表失败，请重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers(filters);
  }, [filters]);

  // 处理筛选条件变化
  const handleFilterChange = (key: keyof ExamPaperQueryParams, value: string | number) => {
    let realValue = value;
    if (key === 'categoryId' && value === ALL_VALUE) realValue = '';
    if (key === 'status' && value === ALL_VALUE) realValue = '';
    setFilters(prev => ({
      ...prev,
      [key]: realValue,
      pageNumber: 1 // 重置到第一页
    }));
  };

  // 处理搜索
  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      pageNumber: 1
    }));
  };

  // 重置筛选
  const handleReset = () => {
    setFilters({
      paperName: '',
      categoryId: '',
      status: '',
      pageNumber: 1,
      pageSize: 10
    });
  };

  // 查看试卷详情，弹出预览对话框
  const handleViewPaper = async (paper: ExamPaperListItem) => {
    setPreviewPaper(paper);
    setPreviewOpen(true);
  };

  // 启用/停用试卷
  const handleToggleStatus = async (paper: ExamPaperListItem) => {
    const newStatus = paper.status === '1' ? '0' : '1';
    try {
      const response = await post<ApiResponse<any>>('/admin/generated-papers/update', { paperId: paper.paperId, status: newStatus });
      if (response.code === 200) {
        toast({ title: '操作成功', description: `试卷已${newStatus === '1' ? '启用' : '停用'}` });
        fetchPapers(filters);
      } else {
        toast({ title: '操作失败', description: response.message || '操作失败', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: '操作失败', description: String(e), variant: 'destructive' });
    }
  };

  // 删除试卷
  const handleDeletePaper = (paper: ExamPaperListItem) => {
    setPaperToDelete(paper);
    setDeleteDialogOpen(true);
  };

  // 确认删除试卷
  const confirmDeletePaper = async () => {
    if (!paperToDelete) return;
    
    setLoading(true);
    try {
      const response = await post<ApiResponse<any>>('/admin/generated-papers/delete', { paperId: paperToDelete.paperId });
      if (response.code === 200) {
        toast({ title: '删除成功', description: '试卷已删除' });
        fetchPapers(filters);
      } else {
        toast({ title: '删除失败', description: response.message || '删除失败', variant: 'destructive' });
      }
    } catch (error: any) {
      console.error('删除试卷失败:', error);
      const errorMessage = error?.response?.data?.message || error?.message || "删除试卷失败，请重试";
      toast({ title: '删除失败', description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setPaperToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === '1' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">启用</Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">停用</Badge>
    );
  };

  const handleRefresh = () => {
    fetchPapers(filters);
  };

  // 查看考试情况
  const handleViewExamStatus = async (paper: ExamPaperListItem) => {
    setLoadingExamStatus(true);
    try {
      // 获取考试情况统计
      const statusRes = await post('/admin/paper-exam-status', { paperId: paper.paperId });
      setExamStatusData(statusRes.data);
      
      // 获取详细考试情况
      const detailRes = await post('/admin/paper-exam-detail', { paperId: paper.paperId });
      setExamDetailData(detailRes.data);
      
      setExamStatusDialogOpen(true);
    } catch (error) {
      toast({ 
        title: '获取失败', 
        description: '获取考试情况失败，请重试', 
        variant: 'destructive' 
      });
    } finally {
      setLoadingExamStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">试卷列表</h3>
      </div>

      {/* 筛选区域 */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <div className="flex space-x-2">
              <Input
                placeholder="请输入试卷名称"
                value={filters.paperName}
                onChange={(e) => handleFilterChange('paperName', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          <div>
            <Select
              value={filters.categoryId || ALL_VALUE}
              onValueChange={(value) => handleFilterChange('categoryId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择题目分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>全部题目分类</SelectItem>
                {Array.isArray(options?.categories) && renderCategoryOptions(options.categories)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              value={filters.status || ALL_VALUE}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>全部状态</SelectItem>
                <SelectItem value="1">启用</SelectItem>
                <SelectItem value="0">停用</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2">
          <Button 
            variant="outline" 
              onClick={handleReset}
              className="flex-1"
          >
              重置
          </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>加载中...</span>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold text-gray-900">试卷名称</TableHead>
                  <TableHead className="font-bold text-gray-900">题目分类</TableHead>
                  <TableHead className="font-bold text-gray-900">人员类别</TableHead>
                  <TableHead className="font-bold text-gray-900">题目数量</TableHead>
                  <TableHead className="font-bold text-gray-900">总分</TableHead>
                  <TableHead className="font-bold text-gray-900">时长</TableHead>
                  <TableHead className="font-bold text-gray-900">创建时间</TableHead>
                  <TableHead className="font-bold text-gray-900">状态</TableHead>
                  <TableHead className="font-bold text-gray-900">使用次数</TableHead>
                  <TableHead className="font-bold text-gray-900">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {papers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  papers.map((paper) => (
                    <TableRow key={paper.paperId}>
                      <TableCell className="font-medium">{paper.paperName}</TableCell>
                      <TableCell>{paper.categoryName || getCategoryNameById(options?.categories, paper.categoryId) || paper.categoryId}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {paper.userCategory || '指挥管理军官'}
                        </Badge>
                      </TableCell>
                      <TableCell>{paper.totalQuestions}</TableCell>
                    <TableCell>{paper.totalScore}分</TableCell>
                    <TableCell>{paper.duration}分钟</TableCell>
                      <TableCell>{paper.createTime}</TableCell>
                    <TableCell>{getStatusBadge(paper.status)}</TableCell>
                    <TableCell>{paper.usageCount}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                            onClick={() => handleViewPaper(paper)}
                        >
                            查看
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewExamStatus(paper)}
                          disabled={loadingExamStatus}
                        >
                          <Users className="w-4 h-4 mr-1" />
                          考试情况
                        </Button>
                        <Button 
                          size="sm" 
                            variant={paper.status === '1' ? 'secondary' : 'default'}
                            onClick={() => handleToggleStatus(paper)}
                        >
                            {paper.status === '1' ? '停用' : '启用'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeletePaper(paper)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {previewPaper && (
              <PreviewExamPaperDialog
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                paper={previewPaper}
                readOnly
              />
            )}

            {/* 分页信息和组件 */}
            {totalPages > 0 && (
              <div className="mt-4 flex items-center justify-between">
                {/* 分页信息显示 */}
                <div className="text-sm text-gray-600">
                  共 {total} 条记录，第 {currentPage} 页，共 {totalPages} 页
                </div>
                
                {/* 分页组件 */}
                <div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handleFilterChange('pageNumber', Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {/* 显示页码，最多显示5个页码 */}
                    {(() => {
                      const pages = [];
                      const maxVisiblePages = 5;
                      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                      
                      if (endPage - startPage + 1 < maxVisiblePages) {
                        startPage = Math.max(1, endPage - maxVisiblePages + 1);
                      }
                      
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(i);
                      }
                      
                      return pages.map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handleFilterChange('pageNumber', page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ));
                    })()}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handleFilterChange('pageNumber', Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* 考试情况对话框 */}
      <Dialog open={examStatusDialogOpen} onOpenChange={setExamStatusDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>考试情况统计</DialogTitle>
          </DialogHeader>
          
          {examStatusData && (
            <div className="space-y-6">
              {/* 统计信息 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600">试卷名称</div>
                  <div className="text-lg font-semibold text-blue-800">{examStatusData.paperName}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600">人员类别</div>
                  <div className="text-lg font-semibold text-green-800">{examStatusData.userCategory}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600">总人数</div>
                  <div className="text-lg font-semibold text-purple-800">{examStatusData.totalUsers}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-orange-600">考试率</div>
                  <div className="text-lg font-semibold text-orange-800">{examStatusData.examRate}%</div>
                </div>
              </div>

              {/* 考试情况统计 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600">已考试人数</div>
                  <div className="text-2xl font-bold text-green-800">{examStatusData.examedUsers}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-600">未考试人数</div>
                  <div className="text-2xl font-bold text-red-800">{examStatusData.notExamedUsers}</div>
                </div>
              </div>

              {/* 详细列表 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">详细情况</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>姓名</TableHead>
                        <TableHead>身份证号</TableHead>
                        <TableHead>部门</TableHead>
                        <TableHead>考试状态</TableHead>
                        <TableHead>考试日期</TableHead>
                        <TableHead>分数</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {examDetailData.map((detail, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{detail.userName}</TableCell>
                          <TableCell className="font-mono text-sm">{detail.idNumber}</TableCell>
                          <TableCell>{detail.department}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={detail.examStatus === '已考试' ? 'default' : 'secondary'}
                              className={detail.examStatus === '已考试' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                            >
                              {detail.examStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>{detail.examDate || '-'}</TableCell>
                          <TableCell>
                            {detail.score !== null ? (
                              <span className={`font-semibold ${
                                detail.score >= 60 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {detail.score}分
                              </span>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除试卷"{paperToDelete?.paperName}"吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeletePaper}
              className="bg-red-600 hover:bg-red-700"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamPaperList;