
import React, { useState } from 'react';
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

interface ExamResult {
  id: string;
  studentName: string;
  studentId: string;
  examName: string;
  category: string;
  score: number;
  totalScore: number;
  duration: number;
  completedAt: Date;
  status: 'completed' | 'in-progress' | 'timeout';
}

const ExamResults: React.FC = () => {
  const { toast } = useToast();
  const [results] = useState<ExamResult[]>([
    {
      id: '1',
      studentName: '张医生',
      studentId: '110101199001011111',
      examName: '消化内科理论考试',
      category: '消化内科',
      score: 85,
      totalScore: 100,
      duration: 75,
      completedAt: new Date('2024-01-15T10:30:00'),
      status: 'completed'
    },
    {
      id: '2',
      studentName: '李护士',
      studentId: '110101199002022222',
      examName: '肝胆外科专业考试',
      category: '肝胆外科',
      score: 92,
      totalScore: 100,
      duration: 110,
      completedAt: new Date('2024-01-15T14:45:00'),
      status: 'completed'
    },
    {
      id: '3',
      studentName: '王医生',
      studentId: '110101199003033333',
      examName: '消化内科理论考试',
      category: '消化内科',
      score: 78,
      totalScore: 100,
      duration: 90,
      completedAt: new Date('2024-01-16T09:15:00'),
      status: 'completed'
    },
    {
      id: '4',
      studentName: '赵技师',
      studentId: '110101199004044444',
      examName: '心血管内科考试',
      category: '心血管内科',
      score: 0,
      totalScore: 100,
      duration: 0,
      completedAt: new Date('2024-01-16T11:00:00'),
      status: 'timeout'
    },
    // 添加更多模拟数据以测试分页
    ...Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 5}`,
      studentName: `考生${i + 5}`,
      studentId: `11010119900101${String(i + 5).padStart(4, '0')}`,
      examName: '模拟考试',
      category: '消化内科',
      score: Math.floor(Math.random() * 100),
      totalScore: 100,
      duration: Math.floor(Math.random() * 120) + 30,
      completedAt: new Date(),
      status: 'completed' as const
    }))
  ]);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

  const pageSize = 10;
  const categories = ['消化内科', '肝胆外科', '心血管内科', '呼吸内科'];

  const filteredResults = results.filter(result => {
    return (
      (filterCategory === 'all' || result.category === filterCategory) &&
      (filterStatus === 'all' || result.status === filterStatus) &&
      (!searchTerm || 
        result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.studentId.includes(searchTerm)
      )
    );
  });

  const totalPages = Math.ceil(filteredResults.length / pageSize);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResults(paginatedResults.map(r => r.id));
    } else {
      setSelectedResults([]);
    }
  };

  const handleSelectResult = (resultId: string, checked: boolean) => {
    if (checked) {
      setSelectedResults([...selectedResults, resultId]);
    } else {
      setSelectedResults(selectedResults.filter(id => id !== resultId));
    }
  };

  const handleViewDetail = (result: ExamResult) => {
    setSelectedResult(result);
    setDetailDialogOpen(true);
  };

  const handleRetakeExam = (result: ExamResult) => {
    toast({
      title: "重新考试",
      description: `已为 ${result.studentName} 安排重新考试：${result.examName}`
    });
  };

  const handleBatchRetake = () => {
    if (selectedResults.length === 0) {
      toast({
        title: "请选择记录",
        description: "请先选择要重新考试的记录",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "批量重新考试",
      description: `已为 ${selectedResults.length} 位考生安排重新考试`
    });
    setSelectedResults([]);
  };

  const exportResults = () => {
    const csvContent = [
      ['姓名', '身份证号', '考试名称', '科室', '得分', '总分', '用时(分钟)', '完成时间', '状态'],
      ...filteredResults.map(result => [
        result.studentName,
        result.studentId,
        result.examName,
        result.category,
        result.score.toString(),
        result.totalScore.toString(),
        result.duration.toString(),
        result.completedAt.toLocaleString(),
        result.status === 'completed' ? '已完成' : result.status === 'timeout' ? '超时' : '进行中'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '考试结果.csv';
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">考试结果</h2>
        <div className="flex space-x-2">
          {selectedResults.length > 0 && (
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

      {/* 统计概览 */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="text-center">
            <p className="text-blue-100 text-sm">总考试次数</p>
            <p className="text-2xl font-bold">{results.length}</p>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="text-center">
            <p className="text-green-100 text-sm">完成率</p>
            <p className="text-2xl font-bold">
              {Math.round((results.filter(r => r.status === 'completed').length / results.length) * 100)}%
            </p>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="text-center">
            <p className="text-purple-100 text-sm">平均分</p>
            <p className="text-2xl font-bold">
              {Math.round(results.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.score, 0) / 
                results.filter(r => r.status === 'completed').length)}
            </p>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="text-center">
            <p className="text-orange-100 text-sm">及格率</p>
            <p className="text-2xl font-bold">
              {Math.round((results.filter(r => r.score >= 60).length / results.filter(r => r.status === 'completed').length) * 100)}%
            </p>
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
              <SelectValue placeholder="筛选科室" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部科室</SelectItem>
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
          
          {(filterCategory !== 'all' || filterStatus !== 'all' || searchTerm) && (
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
          )}
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
                    checked={selectedResults.length === paginatedResults.length && paginatedResults.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="font-bold text-gray-900">考生信息</TableHead>
                <TableHead className="font-bold text-gray-900">身份证号</TableHead>
                <TableHead className="font-bold text-gray-900">考试名称</TableHead>
                <TableHead className="font-bold text-gray-900">考试得分</TableHead>
                <TableHead className="font-bold text-gray-900">用时</TableHead>
                <TableHead className="font-bold text-gray-900">完成时间</TableHead>
                <TableHead className="font-bold text-gray-900">状态</TableHead>
                <TableHead className="font-bold text-gray-900 w-32">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedResults.map(result => (
                <TableRow key={result.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedResults.includes(result.id)}
                      onCheckedChange={(checked) => handleSelectResult(result.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{result.studentName}</p>
                      <p className="text-sm text-gray-500">{result.category}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{result.studentId}</TableCell>
                  <TableCell>{result.examName}</TableCell>
                  <TableCell>
                    <div>
                      <p className={getScoreColor(result.score, result.totalScore)}>
                        {result.score}/{result.totalScore}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round((result.score / result.totalScore) * 100)}%
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{result.duration}分钟</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{result.completedAt.toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">{result.completedAt.toLocaleTimeString()}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(result.status)}</TableCell>
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
                          onClick={() => handleRetakeExam(result)}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, filteredResults.length)} 条，
              共 {filteredResults.length} 条记录
            </p>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
      </Card>

      {/* 详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>考试详情</DialogTitle>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">考生姓名</Label>
                  <p>{selectedResult.studentName}</p>
                </div>
                <div>
                  <Label className="font-semibold">身份证号</Label>
                  <p className="font-mono">{selectedResult.studentId}</p>
                </div>
                <div>
                  <Label className="font-semibold">考试名称</Label>
                  <p>{selectedResult.examName}</p>
                </div>
                <div>
                  <Label className="font-semibold">所属科室</Label>
                  <p>{selectedResult.category}</p>
                </div>
                <div>
                  <Label className="font-semibold">考试得分</Label>
                  <p className={getScoreColor(selectedResult.score, selectedResult.totalScore)}>
                    {selectedResult.score}/{selectedResult.totalScore} 
                    ({Math.round((selectedResult.score / selectedResult.totalScore) * 100)}%)
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">用时</Label>
                  <p>{selectedResult.duration} 分钟</p>
                </div>
                <div>
                  <Label className="font-semibold">完成时间</Label>
                  <p>{selectedResult.completedAt.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="font-semibold">考试状态</Label>
                  <div>{getStatusBadge(selectedResult.status)}</div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                    关闭
                  </Button>
                  {selectedResult.status === 'completed' && (
                    <Button onClick={() => handleRetakeExam(selectedResult)}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      重新考试
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {filteredResults.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500">暂无符合条件的考试结果</p>
        </Card>
      )}
    </div>
  );
};

export default ExamResults;
