
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Eye, Download, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExamPaper {
  id: string;
  name: string;
  category: string;
  questionCount: number;
  totalScore: number;
  duration: number;
  createdAt: string;
  createdBy: string;
  status: 'active' | 'inactive';
  usageCount: number;
}

const ExamPaperList: React.FC = () => {
  const [papers, setPapers] = useState<ExamPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  // 模拟API调用 - 获取试卷列表
  const fetchPapers = async (page: number = 1, category?: string, status?: string) => {
    setLoading(true);
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模拟数据
      const mockData = [
        {
          id: '1',
          name: '消化内科理论考试-试卷A',
          category: '消化内科',
          questionCount: 60,
          totalScore: 100,
          duration: 90,
          createdAt: '2024-01-15 14:30',
          createdBy: '管理员',
          status: 'active' as const,
          usageCount: 23
        },
        {
          id: '2',
          name: '肝胆外科专业考试-试卷B',
          category: '肝胆外科',
          questionCount: 65,
          totalScore: 100,
          duration: 120,
          createdAt: '2024-01-14 10:20',
          createdBy: '管理员',
          status: 'active' as const,
          usageCount: 15
        },
        {
          id: '3',
          name: '心血管内科综合测试',
          category: '心血管内科',
          questionCount: 50,
          totalScore: 100,
          duration: 80,
          createdAt: '2024-01-13 16:45',
          createdBy: '管理员',
          status: 'inactive' as const,
          usageCount: 8
        }
      ];

      setPapers(mockData);
      setTotalPages(Math.ceil(mockData.length / itemsPerPage));
      
      console.log('试卷列表加载成功');
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
    fetchPapers(currentPage);
  }, [currentPage]);

  const paginatedPapers = papers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 模拟API调用 - 查看试卷详情
  const handleViewPaper = async (paperId: string) => {
    try {
      console.log('查看试卷详情:', paperId);
      // 模拟API调用
      toast({
        title: "查看试卷",
        description: `正在查看试卷 ID: ${paperId}`
      });
    } catch (error) {
      console.error('查看试卷失败:', error);
    }
  };

  // 模拟API调用 - 下载试卷
  const handleDownloadPaper = async (paperId: string) => {
    try {
      console.log('下载试卷:', paperId);
      // 模拟下载过程
      toast({
        title: "开始下载",
        description: "试卷下载中..."
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "下载完成",
        description: "试卷已下载到本地"
      });
    } catch (error) {
      console.error('下载试卷失败:', error);
      toast({
        title: "下载失败",
        description: "试卷下载失败，请重试",
        variant: "destructive"
      });
    }
  };

  // 模拟API调用 - 删除试卷
  const handleDeletePaper = async (paperId: string) => {
    try {
      console.log('删除试卷:', paperId);
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPapers(papers.filter(paper => paper.id !== paperId));
      
      toast({
        title: "删除成功",
        description: "试卷已删除"
      });
    } catch (error) {
      console.error('删除试卷失败:', error);
      toast({
        title: "删除失败",
        description: "删除试卷失败，请重试",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">启用</Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">停用</Badge>
    );
  };

  const handleRefresh = () => {
    fetchPapers(currentPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">试卷列表</h3>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <div className="text-sm text-gray-600">
            共 {papers.length} 份试卷
          </div>
        </div>
      </div>

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
                  <TableHead className="font-bold text-gray-900">科室</TableHead>
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
                {paginatedPapers.map((paper) => (
                  <TableRow key={paper.id}>
                    <TableCell className="font-medium">{paper.name}</TableCell>
                    <TableCell>{paper.category}</TableCell>
                    <TableCell>{paper.questionCount}</TableCell>
                    <TableCell>{paper.totalScore}分</TableCell>
                    <TableCell>{paper.duration}分钟</TableCell>
                    <TableCell>{paper.createdAt}</TableCell>
                    <TableCell>{getStatusBadge(paper.status)}</TableCell>
                    <TableCell>{paper.usageCount}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewPaper(paper.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadPaper(paper.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeletePaper(paper.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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

