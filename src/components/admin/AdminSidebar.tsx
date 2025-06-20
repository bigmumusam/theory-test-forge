
import React from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Users, BookOpen, FileText, BarChart3, Settings, Shield, LogOut } from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: '仪表盘', icon: BarChart3 },
    { id: 'users', label: '人员管理', icon: Users },
    { id: 'roles', label: '角色管理', icon: Shield },
    { id: 'questions', label: '题库管理', icon: BookOpen },
    { id: 'exams', label: '考试管理', icon: FileText },
    { id: 'results', label: '考试结果', icon: BarChart3 },
    { id: 'settings', label: '系统设置', icon: Settings },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold">医学考试系统</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    onClick={() => onTabChange(item.id)}
                    className="w-full justify-start"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onLogout} className="w-full justify-start text-red-600 hover:text-red-700">
                  <LogOut className="w-4 h-4" />
                  <span>退出登录</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
