
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User } from '../../types/auth';
import { ExamPaper, Question } from '../../types/exam';
import { useToast } from '@/hooks/use-toast';

interface ExamSessionProps {
  exam: ExamPaper;
  user: User;
  onComplete: () => void;
}

const ExamSession: React.FC<ExamSessionProps> = ({ exam, user, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(exam.duration * 60); // 转换为秒
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [examResult, setExamResult] = useState<{ score: number; totalScore: number } | null>(null);
  const { toast } = useToast();

  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;

  // 倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (): string => {
    const totalTime = exam.duration * 60;
    const percentage = (timeRemaining / totalTime) * 100;
    
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAnswerSelect = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = (): { score: number; totalScore: number } => {
    let score = 0;
    const totalScore = exam.questions.reduce((sum, q) => sum + q.score, 0);

    exam.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer !== undefined && userAnswer === question.correctAnswer) {
        score += question.score;
      }
    });

    return { score, totalScore };
  };

  const handleSubmit = () => {
    const result = calculateScore();
    setExamResult(result);
    setShowSubmitDialog(true);
  };

  const handleAutoSubmit = () => {
    toast({
      title: "时间到！",
      description: "考试时间已结束，系统已自动提交试卷",
      variant: "destructive"
    });
    handleSubmit();
  };

  const handleConfirmSubmit = () => {
    toast({
      title: "考试完成",
      description: `您的得分：${examResult?.score}/${examResult?.totalScore}分`,
    });
    onComplete();
  };

  const getAnsweredCount = (): number => {
    return Object.keys(answers).length;
  };

  const isCurrentQuestionAnswered = (): boolean => {
    return answers[currentQuestion.id] !== undefined;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 考试头部 */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">正在考试</h1>
                <p className="text-sm text-gray-600">{user.name} - {user.department}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-gray-600">剩余时间</p>
                <p className={`text-xl font-bold ${getTimeColor()}`}>
                  {formatTime(timeRemaining)}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-600">进度</p>
                <p className="text-lg font-bold text-blue-600">
                  {currentQuestionIndex + 1}/{exam.questions.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* 答题区域 */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-sm rounded ${
                    currentQuestion.type === 'choice' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {currentQuestion.type === 'choice' ? '选择题' : '判断题'}
                  </span>
                  <span className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded">
                    {currentQuestion.score}分
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  第{currentQuestionIndex + 1}题
                </div>
              </div>
              
              <h2 className="text-xl font-medium text-gray-800 mb-8 leading-relaxed">
                {currentQuestion.content}
              </h2>
              
              {currentQuestion.type === 'choice' && currentQuestion.options && (
                <div className="space-y-4">
                  {currentQuestion.options.map((option, index) => (
                    <div 
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        answers[currentQuestion.id] === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          answers[currentQuestion.id] === index
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {answers[currentQuestion.id] === index && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="font-medium text-gray-700">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span className="text-gray-800">{option}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {currentQuestion.type === 'judgment' && (
                <div className="space-y-4">
                  {['正确', '错误'].map((option) => (
                    <div 
                      key={option}
                      onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        answers[currentQuestion.id] === option
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          answers[currentQuestion.id] === option
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        }`}>
                          {answers[currentQuestion.id] === option && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-gray-800 font-medium">{option}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            
            {/* 导航按钮 */}
            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                上一题
              </Button>
              
              <div className="flex space-x-3">
                {currentQuestionIndex === exam.questions.length - 1 ? (
                  <Button 
                    onClick={handleSubmit}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    提交试卷
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext}
                    disabled={currentQuestionIndex === exam.questions.length - 1}
                  >
                    下一题
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* 答题卡 */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">答题卡</h3>
              
              <div className="text-sm text-gray-600 mb-4">
                已答题：{getAnsweredCount()}/{exam.questions.length}
              </div>
              
              <div className="grid grid-cols-5 gap-2 mb-6">
                {exam.questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-10 h-10 text-sm font-medium rounded ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : answers[question.id] !== undefined
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                    } hover:opacity-80 transition-opacity`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span className="text-gray-600">当前题目</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span className="text-gray-600">已答题</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                  <span className="text-gray-600">未答题</span>
                </div>
              </div>
              
              <Button 
                onClick={handleSubmit}
                className="w-full mt-6 bg-green-600 hover:bg-green-700"
              >
                提交试卷
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* 提交确认对话框 */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>考试结果</DialogTitle>
          </DialogHeader>
          
          {examResult && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">考试完成！</h3>
                <p className="text-gray-600">您的考试已成功提交</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <p className="text-3xl font-bold text-blue-600 mb-2">
                  {examResult.score}/{examResult.totalScore}
                </p>
                <p className="text-lg text-gray-600 mb-1">
                  {Math.round((examResult.score / examResult.totalScore) * 100)}%
                </p>
                <p className={`text-sm font-medium ${
                  (examResult.score / examResult.totalScore) >= 0.6 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(examResult.score / examResult.totalScore) >= 0.6 ? '考试通过' : '考试未通过'}
                </p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">答题数量：</span>
                  <span>{getAnsweredCount()}/{exam.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">用时：</span>
                  <span>{formatTime((exam.duration * 60) - timeRemaining)}</span>
                </div>
              </div>
              
              <Button onClick={handleConfirmSubmit} className="w-full">
                返回主页
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamSession;
