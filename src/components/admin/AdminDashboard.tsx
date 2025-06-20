
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, Users, BookOpen, FileText, BarChart3, Settings, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { User } from '../../types/auth';
import UserManager from './UserManager';
import RoleManager from './RoleManager';
import QuestionBankManager from './QuestionBankManager';
import ExamConfigManager from './ExamConfigManager';
import ExamResults from './ExamResults';

interface AdminDashboardProps {
  user?: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast({
      title: "退出成功",
      description: "您已成功退出系统"
    });
    onLogout();
  };

  const menuItems = [
    { id: 'dashboard', label: '系统概览', icon: BarChart3, description: '查看系统运行状态和统计信息' },
    { id: 'users', label: '人员管理', icon: Users, description: '管理系统用户信息' },
    { id: 'roles', label: '角色管理', icon: Shield, description: '配置用户权限和角色' },
    { id: 'questions', label: '题库管理', icon: BookOpen, description: '管理考试题目和分类' },
    { id: 'exams', label: '考试管理', icon: FileText, description: '创建和配置考试' },
    { id: 'results', label: '考试结果', icon: BarChart3, description: '查看考试成绩和统计' },
    { id: 'settings', label: '系统设置', icon: Settings, description: '配置系统参数' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManager />;
      case 'roles':
        return <RoleManager />;
      case 'questions':
        return <QuestionBankManager />;
      case 'exams':
        return <ExamConfigManager />;
      case 'results':
        return <ExamResults />;
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">系统设置</h2>
            <Card className="p-6">
              <p className="text-gray-600">系统设置功能正在开发中...</p>
            </Card>
          </div>
        );
      case 'dashboard':
      default:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">系统概览</h2>
              <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>退出登录</span>
              </Button>
            </div>
            
            {/* Dashboard content */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.slice(1).map((item) => (
                <Card 
                  key={item.id} 
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab(item.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <item.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{item.label}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Statistics cards */}
            <div className="grid md:grid-cols-4 gap-6 mt-8">
              <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="text-center">
                  <p className="text-blue-100 text-sm">总用户数</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                <div className="text-center">
                  <p className="text-green-100 text-sm">题库总数</p>
                  <p className="text-2xl font-bold">1,248</p>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <div className="text-center">
                  <p className="text-purple-100 text-sm">考试场次</p>
                  <p className="text-2xl font-bold">89</p>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <div className="text-center">
                  <p className="text-orange-100 text-sm">今日考试</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </Card>
            </div>
          </div>
        );
    }
  };

  if (activeTab === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation breadcrumb */}
        <div className="flex items-center space-x-2 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab('dashboard')}
            className="text-blue-600 hover:text-blue-800"
          >
            首页
          </Button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">
            {menuItems.find(item => item.id === activeTab)?.label}
          </span>
          <div className="ml-auto">
            <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>退出登录</span>
            </Button>
          </div>
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
