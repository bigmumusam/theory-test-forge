import React, { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import UserManager from './UserManager';
import RoleManager from './RoleManager';
import QuestionBankManager from './QuestionBankManager';
import ExamConfigManager from './ExamConfigManager';
import ExamResults from './ExamResults';
import AdminSidebar from './AdminSidebar';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
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
      case 'dashboard':
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">系统概览</h2>
            {/* Dashboard content */}
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onLogout={handleLogout}
        />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <SidebarTrigger />
            <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>退出登录</span>
            </Button>
          </div>
          {renderContent()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
