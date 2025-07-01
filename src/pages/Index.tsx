import React, { useState, useEffect } from 'react';
import LoginForm from '../components/auth/LoginForm';
import AdminDashboard from '../components/admin/AdminDashboard';
import StudentDashboard from '../components/student/StudentDashboard';
import { User } from '../types/auth';
import { Card } from '@/components/ui/card';
import { useOptions } from '../context/OptionsContext';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const { setOptions } = useOptions();

  // 自动恢复登录态和options
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const optionsStr = localStorage.getItem('options');
    
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {}
    }
    
    if (optionsStr) {
      try {
        setOptions(JSON.parse(optionsStr));
      } catch {}
    }
  }, [setOptions]);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              理论考试系统
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              专业、安全、高效的在线考试平台
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <Card className="p-8 shadow-xl bg-white/80 backdrop-blur-sm border-0">
              <LoginForm onLogin={handleLogin} />
            </Card>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white/60 rounded-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">安全认证</h3>
              <p className="text-gray-600 text-sm">实名制登录，确保考试公平公正</p>
            </div>
            
            <div className="text-center p-6 bg-white/60 rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">专业题库</h3>
              <p className="text-gray-600 text-sm">分题目分类题库管理，内容专业权威</p>
            </div>
            
            <div className="text-center p-6 bg-white/60 rounded-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">智能生成</h3>
              <p className="text-gray-600 text-sm">自动生成试卷，实时评分反馈</p>
            </div>
          </div>
          <div className="mt-8 max-w-2xl mx-auto text-center text-gray-700 text-sm">
            <div className="mb-2 font-semibold">演示账号</div>
            <div>学员：管理员创建的真实账号登录</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user.role === 'admin' ? (
        <AdminDashboard user={user} onLogout={handleLogout} />
      ) : (
        <StudentDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default Index;
