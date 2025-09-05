import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Footer from '../ui/footer';
import { User } from '../../types/auth';
import ExamList from './ExamList';
import ExamSession from './ExamSession';
import { ExamPaper } from '../../types/exam';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const [currentExam, setCurrentExam] = useState<ExamPaper | null>(null);

  const handleStartExam = (exam: ExamPaper) => {
    setCurrentExam({
      ...exam,
      status: 'in-progress',
      startTime: new Date()
    });
  };

  const handleExamComplete = () => {
    setCurrentExam(null);
  };

  if (currentExam) {
    return (
      <ExamSession 
        exam={currentExam} 
        user={user}
        onComplete={handleExamComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img 
                src="/image/905-logo.jpeg" 
                alt="中国人民解放军海军第九〇五医院" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-800">考试中心</h1>
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
        {/* 欢迎信息 */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">欢迎，{user.name}！</h2>
              <p className="text-gray-600">请选择您要参加的考试项目</p>
            </div>
          </div>
        </Card>

        {/* 考试列表 */}
        <ExamList user={user} onStartExam={handleStartExam} />
      </div>
      
      <Footer />
    </div>
  );
};

export default StudentDashboard;
