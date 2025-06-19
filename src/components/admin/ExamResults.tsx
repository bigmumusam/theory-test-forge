
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = ['消化内科', '肝胆外科', '心血管内科', '呼吸内科'];

  const filteredResults = results.filter(result => {
    return (
      (!filterCategory || result.category === filterCategory) &&
      (!filterStatus || result.status === filterStatus) &&
      (!searchTerm || 
        result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.studentId.includes(searchTerm)
      )
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">已完成</span>;
      case 'in-progress':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">进行中</span>;
      case 'timeout':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">超时</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">未知</span>;
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

  const exportResults = () => {
    // 简单的CSV导出实现
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
        <Button onClick={exportResults} variant="outline">
          导出结果
        </Button>
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
              <SelectItem value="">全部科室</SelectItem>
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
              <SelectItem value="">全部状态</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
              <SelectItem value="in-progress">进行中</SelectItem>
              <SelectItem value="timeout">超时</SelectItem>
            </SelectContent>
          </Select>
          
          {(filterCategory || filterStatus || searchTerm) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setFilterCategory('');
                setFilterStatus('');
                setSearchTerm('');
              }}
            >
              清除筛选
            </Button>
          )}
        </div>
      </Card>

      {/* 结果列表 */}
      <div className="space-y-4">
        {filteredResults.map(result => (
          <Card key={result.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1 grid md:grid-cols-6 gap-4">
                <div>
                  <p className="text-sm text-gray-600">考生信息</p>
                  <p className="font-medium">{result.studentName}</p>
                  <p className="text-xs text-gray-500">{result.studentId}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">考试名称</p>
                  <p className="font-medium">{result.examName}</p>
                  <p className="text-xs text-gray-500">{result.category}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">考试得分</p>
                  <p className={`text-lg font-bold ${getScoreColor(result.score, result.totalScore)}`}>
                    {result.score}/{result.totalScore}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round((result.score / result.totalScore) * 100)}%
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">用时</p>
                  <p className="font-medium">{result.duration}分钟</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">完成时间</p>
                  <p className="font-medium">{result.completedAt.toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">{result.completedAt.toLocaleTimeString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">状态</p>
                  {getStatusBadge(result.status)}
                </div>
              </div>
              
              <div className="ml-4 flex flex-col space-y-2">
                <Button size="sm" variant="outline">
                  查看详情
                </Button>
                {result.status === 'completed' && (
                  <Button size="sm" variant="outline">
                    重新考试
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredResults.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500">暂无符合条件的考试结果</p>
        </Card>
      )}
    </div>
  );
};

export default ExamResults;
