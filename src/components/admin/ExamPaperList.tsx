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
import { Eye, Download, Trash2, RefreshCw, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOptions } from '@/context/OptionsContext';
import { post } from '@/lib/request';
import { ExamPaperListItem, ExamPaperQueryParams, ExamPaperListResponse } from '@/types/exam';
import PreviewExamPaperDialog from './PreviewExamPaperDialog';
import { ApiResponse } from '@/types/api';

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

  const [previewPaper, setPreviewPaper] = useState<ExamPaperListItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // 获取试卷列表
  const fetchPapers = async (params: ExamPaperQueryParams) => {
    setLoading(true);
    try {
      const response = await post<ApiResponse<ExamPaperListResponse>>('/admin/generated-papers/list', params);
      
      if (response.code === 200) {
        const data = response.data;
        setPapers(data.records || []);
        setTotal(data.total || 0);
        setTotalPages(data.pages || 1);
        setCurrentPage(data.current || 1);
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
                {options.categories && Object.entries(options.categories).map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
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
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  papers.map((paper) => (
                    <TableRow key={paper.paperId}>
                      <TableCell className="font-medium">{paper.paperName}</TableCell>
                      <TableCell>{paper.categoryName}</TableCell>
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
                            variant={paper.status === '1' ? 'secondary' : 'default'}
                            onClick={() => handleToggleStatus(paper)}
                        >
                            {paper.status === '1' ? '停用' : '启用'}
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

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handleFilterChange('pageNumber', Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handleFilterChange('pageNumber', page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handleFilterChange('pageNumber', Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default ExamPaperList;