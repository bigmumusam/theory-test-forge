import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '../../types/auth';
import QuestionBankManager from './QuestionBankManager';
import ExamConfigManager from './ExamConfigManager';
import ExamResults from './ExamResults';
import UserManager from './UserManager';
import RoleManager from './RoleManager';
import { post } from '@/lib/request';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

// 题目分类分布子组件
interface CategorySummaryItem {
  categoryName: string;
  questionCount: number;
}

const barGradients = [
  'from-blue-500 to-blue-400',
  'from-green-500 to-green-400',
  'from-purple-500 to-purple-400',
  'from-orange-500 to-orange-400',
  'from-red-500 to-red-400',
];

const DepartmentDistribution: React.FC<{ summary?: CategorySummaryItem[] }> = ({ summary }) => {
  if (!summary || summary.length === 0) {
    return <div className="text-center text-gray-400 py-8">暂无记录</div>;
  }
  const maxCount = Math.max(...summary.map(c => c.questionCount || 0), 1);
  return (
    <div className="space-y-3">
      {summary.map((c, idx) => (
        <div key={c.categoryName}>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{c.categoryName}</span>
            <span className="text-sm font-medium">{c.questionCount}题</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${barGradients[idx % barGradients.length]}`}
              style={{ width: `${Math.round((c.questionCount / maxCount) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    post('/admin/statistics/dashboard').then(res => {
      setDashboard(res.data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">管理员控制台</h1>
                <p className="text-sm text-gray-600">理论考试系统</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-600">{user.department}</p>
              </div>
              <Button variant="outline" onClick={onLogout}>
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white p-1 h-12">
            <TabsTrigger value="overview" className="h-10">系统概览</TabsTrigger>
            {user.role === 'admin' && (
              <TabsTrigger value="users" className="h-10">人员管理</TabsTrigger>
            )}
            {user.role === 'admin' && (
              <TabsTrigger value="roles" className="h-10">角色管理</TabsTrigger>
            )}
            <TabsTrigger value="questions" className="h-10">题库管理</TabsTrigger>
            <TabsTrigger value="config" className="h-10">考试配置</TabsTrigger>
            <TabsTrigger value="results" className="h-10">考试结果</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">题库总数</p>
                    <p className="text-2xl font-bold">{dashboard ? dashboard.questionCount : '--'}</p>
                  </div>
                  <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">今日考试</p>
                    <p className="text-2xl font-bold">{dashboard ? dashboard.examResultCountToday : '--'}</p>
                  </div>
                  <svg className="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">题目分类数量</p>
                    <p className="text-2xl font-bold">{dashboard ? dashboard.categoryCount : '--'}</p>
                  </div>
                  <svg className="w-8 h-8 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">平均分数</p>
                    <p className="text-2xl font-bold">{dashboard ? dashboard.avgExamScore : '--'}</p>
                  </div>
                  <svg className="w-8 h-8 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </Card>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">最近活动</h3>
                <div className="space-y-4">
                  {dashboard && dashboard.sysLogs && dashboard.sysLogs.length > 0 ? (
                    dashboard.sysLogs.map((log: any, idx: number) => (
                      <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{log.userName ? `${log.userName} ${log.content}` : log.content}</p>
                          <p className="text-xs text-gray-600">{log.createTime ? new Date(log.createTime).toLocaleString() : ''}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-8">暂无记录</div>
                  )}
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">题目分类分布</h3>
                <DepartmentDistribution summary={dashboard?.categorySummary} />
              </Card>
            </div>
          </TabsContent>

          {user.role === 'admin' && (
            <TabsContent value="users">
              <UserManager />
            </TabsContent>
          )}

          {user.role === 'admin' && (
            <TabsContent value="roles">
              <RoleManager />
            </TabsContent>
          )}

          <TabsContent value="questions">
            <QuestionBankManager />
          </TabsContent>

          <TabsContent value="config">
            <ExamConfigManager />
          </TabsContent>

          <TabsContent value="results">
            <ExamResults />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
