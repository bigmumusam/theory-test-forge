import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, RotateCcw, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    }
  ]);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
  const paginatedResults = filteredResults.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSelectResult = (resultId: string, checked: boolean) => {
    if (checked) {
      setSelectedResults([...selectedResults, resultId]);
    } else {
      setSelectedResults(selectedResults.filter(id => id !== resultId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResults(paginatedResults.map(result => result.id));
    } else {
      setSelectedResults([]);
    }
  };

  const handleViewDetail = (result: ExamResult) => {
    setSelectedResult(result);
    setIsDetailOpen(true);
  };

  const handleRetakeExam = (resultId: string) => {
    toast({
      title: "重新考试",
      description: "已为考生安排重新考试"
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
      description: `已为 ${selectedResults.length} 名考生安排重新考试`
    });
    setSelectedResults([]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">已完成</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">进行中</Badge>;
      case 'timeout':
        return <Badge className="bg-red-100 text-red-800">超时</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">未知</Badge>;
    }
  };

  const getScoreColor = (score: number, totalScore: number) => {
    const percentage = (score / totalScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">考试结果</h2>
        <div className="flex space-x-2">
          {selectedResults.length > 0 && (
            <Button onClick={handleBatchRetake} className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4" />
              <span>批量重新考试 ({selectedResults.length})</span>
            </Button>
          )}
          <Button onClick={() => {/* exportResults logic */}} variant="outline">
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
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="搜索姓名或身份证号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
              <TableRow>
                <TableHead className="w-12 font-bold">
                  <Checkbox
                    checked={paginatedResults.length > 0 && selectedResults.length === paginatedResults.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="font-bold">考生信息</TableHead>
                <TableHead className="font-bold">身份证</TableHead>
                <TableHead className="font-bold">考试名称</TableHead>
                <TableHead className="font-bold">考试得分</TableHead>
                <TableHead className="font-bold">用时</TableHead>
                <TableHead className="font-bold">完成时间</TableHead>
                <TableHead className="font-bold">状态</TableHead>
                <TableHead className="font-bold w-32">操作</TableHead>
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
                  <TableCell className="font-medium">{result.studentName}</TableCell>
                  <TableCell>{result.studentId}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{result.examName}</div>
                      <div className="text-sm text-gray-500">{result.category}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`font-bold ${getScoreColor(result.score, result.totalScore)}`}>
                      {result.score}/{result.totalScore}
                    </div>
                    <div className="text-sm text-gray-500">
                      {Math.round((result.score / result.totalScore) * 100)}%
                    </div>
                  </TableCell>
                  <TableCell>{result.duration}分钟</TableCell>
                  <TableCell>
                    <div>{result.completedAt.toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">{result.completedAt.toLocaleTimeString()}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(result.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(result)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {result.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetakeExam(result.id)}
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

        {/* 分页控件 */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, filteredResults.length)} 项，共 {filteredResults.length} 项
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              上一页
            </Button>
            <span className="flex items-center px-3 text-sm">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              下一页
            </Button>
          </div>
        </div>

        {filteredResults.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            暂无符合条件的考试结果
          </div>
        )}
      </Card>

      {/* 详情对话框 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>考试详情</DialogTitle>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">考生姓名</Label>
                  <p className="font-medium">{selectedResult.studentName}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">身份证号</Label>
                  <p className="font-medium">{selectedResult.studentId}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">考试名称</Label>
                  <p className="font-medium">{selectedResult.examName}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">科室</Label>
                  <p className="font-medium">{selectedResult.category}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">考试得分</Label>
                  <p className={`text-lg font-bold ${getScoreColor(selectedResult.score, selectedResult.totalScore)}`}>
                    {selectedResult.score}/{selectedResult.totalScore} ({Math.round((selectedResult.score / selectedResult.totalScore) * 100)}%)
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">用时</Label>
                  <p className="font-medium">{selectedResult.duration}分钟</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-gray-600">完成时间</Label>
                <p className="font-medium">{selectedResult.completedAt.toLocaleString()}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-600">状态</Label>
                <div className="mt-1">{getStatusBadge(selectedResult.status)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamResults;
