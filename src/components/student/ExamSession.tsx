import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User } from '../../types/auth';
import { ExamPaper, Question } from '../../types/exam';
import { useToast } from '@/hooks/use-toast';
import { post } from '@/lib/request';

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
  const [examResult, setExamResult] = useState<{ score: number; totalScore: number; correctCount: number; totalQuestions: number } | null>(null);
  const [isExamCompleted, setIsExamCompleted] = useState(false);
  const [showRefreshWarning, setShowRefreshWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // 解析多选题 correctAnswer 并修正 type 字段
  const parsedQuestions = exam.questions.map(q => {
    let correctAnswer = q.correctAnswer;
    // 兼容后端字段为 questionType 或 type
    const qType = (q as any).questionType || q.type;
    
    // 处理多选格式的正确答案（支持 choice 和 multi 类型）
    if ((qType === 'multi' || qType === 'choice') && typeof correctAnswer === 'string') {
      if (correctAnswer.includes(',')) {
        // 多选格式 "0,1,2,3,4,5"
        correctAnswer = correctAnswer.split(',').map((s: string) => Number(s.trim()));
      } else {
        // 单选格式，转换为数字
        correctAnswer = Number(correctAnswer);
      }
    }
    
    return {
      ...q,
      type: qType,
      correctAnswer,
    };
  });
  const currentQuestion = parsedQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;

  // 防止页面刷新
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isExamCompleted) {
        e.preventDefault();
        e.returnValue = '考试进行中，刷新页面将丢失答题进度，确定要离开吗？';
        return e.returnValue;
      }
    };

    const handleVisibilityChange = () => {
      if (!isExamCompleted && document.visibilityState === 'hidden') {
        // 页面即将被隐藏（如切换标签页、最小化等）
        toast({
          title: "考试提醒",
          description: "请勿切换标签页或最小化窗口，以免影响考试",
          variant: "destructive"
        });
      }
    };

    // 监听键盘快捷键刷新
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isExamCompleted && (e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        setShowRefreshWarning(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExamCompleted, toast]);

  // 倒计时
  useEffect(() => {
    if (!isExamCompleted) {
      timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
            clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isExamCompleted]);

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

  const calculateScore = (): { score: number; totalScore: number; correctCount: number; totalQuestions: number } => {
    let score = 0;
    let correctCount = 0;
    const totalScore = exam.questions.reduce((sum, q) => sum + q.score, 0);

    exam.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer !== undefined) {
        if (question.type === 'multi') {
          // 多选题：答案为数组，需与标准答案数组全等
          if (Array.isArray(userAnswer) &&
              Array.isArray(question.correctAnswer) &&
              userAnswer.length === question.correctAnswer.length &&
              userAnswer.every((v: number) => Array.isArray(question.correctAnswer) && question.correctAnswer.includes(v)) &&
              Array.isArray(question.correctAnswer) && question.correctAnswer.every((v: number) => userAnswer.includes(v))) {
            score += question.score;
            correctCount++;
          }
        } else if (userAnswer === question.correctAnswer) {
          score += question.score;
          correctCount++;
        }
      }
    });

    return { score, totalScore, correctCount, totalQuestions: exam.questions.length };
  };

  const handleSubmit = async () => {
    // 检查是否所有题目都已答题
    const answeredCount = getAnsweredCount();
    const totalQuestions = exam.questions.length;
    
    if (answeredCount < totalQuestions) {
      toast({
        title: "无法提交",
        description: `还有 ${totalQuestions - answeredCount} 道题目未完成，请完成所有题目后再提交`,
        variant: "destructive"
      });
      return;
    }

    // 防止重复提交
    if (submitting) {
      toast({
        title: "提交中",
        description: "正在提交考试，请稍候...",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      // 准备提交数据
      const submitData = {
        recordId: exam.id, // 使用试卷ID作为记录ID
        answers: exam.questions.map(question => ({
          questionId: question.id,
          userAnswer: question.type === 'multi'
            ? (Array.isArray(answers[question.id]) ? answers[question.id].join(',') : '')
            : (answers[question.id] !== undefined ? answers[question.id].toString() : '')
        }))
      };

      // 调用后端提交接口
      const response = await post('/exam/submit', submitData);
      
      if (response.code === 200) {
        // 使用后端返回的分数信息
        const result = {
          score: response.data.score,
          totalScore: response.data.totalScore,
          correctCount: response.data.correctCount,
          totalQuestions: response.data.totalQuestions
        };
        setExamResult(result);
        setIsExamCompleted(true);
        setShowSubmitDialog(true);
        // 停止计时器
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      } else {
        toast({
          title: "提交失败",
          description: response.message || "考试提交失败，请重试",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('考试提交失败:', error);
      toast({
        title: "提交失败",
        description: "考试提交失败，请重试",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    const answeredCount = getAnsweredCount();
    const totalQuestions = exam.questions.length;
    
    if (answeredCount < totalQuestions) {
      toast({
        title: "时间到！",
        description: `考试时间已结束，但您还有 ${totalQuestions - answeredCount} 道题目未完成。系统将提交已完成的题目。`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "时间到！",
        description: "考试时间已结束，系统已自动提交试卷",
        variant: "destructive"
      });
    }
    handleSubmit();
  };

  const handleConfirmSubmit = () => {
    // 清除倒计时
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    toast({
      title: "考试完成",
      description: `您的得分：${examResult?.score}分`,
    });
    onComplete();
  };

  // 倒计时逻辑
  useEffect(() => {
    if (showSubmitDialog && examResult) {
      setCountdown(15);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            setShowSubmitDialog(false);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [showSubmitDialog, examResult, onComplete]);

  const getAnsweredCount = (): number => {
    let count = 0;
    exam.questions.forEach(question => {
      const answer = answers[question.id];
      if (answer !== undefined) {
        if (question.type === 'multi') {
          // 多选题：检查是否有选择选项
          if (Array.isArray(answer) && answer.length > 0) {
            count++;
          }
        } else {
          // 单选题和判断题：检查是否有答案
          if (answer !== '' && answer !== null) {
            count++;
          }
        }
      }
    });
    return count;
  };

  const isCurrentQuestionAnswered = (): boolean => {
    const ans = answers[currentQuestion.id];
    if (currentQuestion.type === 'multi') {
      return Array.isArray(ans) && ans.length > 0;
    }
    return ans !== undefined && ans !== '';
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
                    currentQuestion.type === 'choice' ? 'bg-blue-100 text-blue-800' :
                    currentQuestion.type === 'multi' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {currentQuestion.type === 'choice' ? '选择题' :
                     currentQuestion.type === 'multi' ? '多选题' :
                     '判断题'}
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
              {currentQuestion.type === 'multi' && currentQuestion.options && (
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => {
                    const ans = answers[currentQuestion.id];
                    let selected = false;
                    if (Array.isArray(ans)) {
                      selected = ans.includes(index);
                    }
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          let prev: number[] = Array.isArray(ans) ? ans : [];
                          if (selected) {
                            prev = prev.filter((i: number) => i !== index);
                          } else {
                            prev = [...prev, index];
                          }
                          handleAnswerSelect(currentQuestion.id, prev);
                        }}
                        className={`flex items-center space-x-2 p-4 rounded border cursor-pointer transition-all select-none ${
                          selected
                            ? 'bg-yellow-50 border-yellow-500 text-yellow-800 font-bold'
                            : 'bg-gray-50 border-transparent'
                        }`}
                      >
                        <span className="w-8 text-center font-medium">{String.fromCharCode(65 + index)}.</span>
                        <span className="flex-1 text-gray-800 text-left">{option}</span>
                        <input
                          type="checkbox"
                          checked={selected}
                          readOnly
                          className="w-4 h-4 border-2 rounded"
                        />
                      </div>
                    );
                  })}
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
                {currentQuestionIndex < exam.questions.length - 1 && (
                  <Button 
                    onClick={handleNext}
                    disabled={!isCurrentQuestionAnswered()}
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
                {getAnsweredCount() < exam.questions.length && (
                  <div className="text-red-600 text-xs mt-1">
                    还需完成 {exam.questions.length - getAnsweredCount()} 道题目
                  </div>
                )}
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
                disabled={submitting || getAnsweredCount() < exam.questions.length}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? '提交中...' : 
                 getAnsweredCount() < exam.questions.length ? 
                 `提交试卷 (${getAnsweredCount()}/${exam.questions.length})` : 
                 '提交试卷'}
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* 提交确认对话框 */}
      <Dialog open={showSubmitDialog} onOpenChange={(open) => {
        if (!open) {
          // 手动关闭时清除倒计时
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
          }
        }
        setShowSubmitDialog(open);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>考试结果</span>
              <span className="text-sm text-gray-500">
                {countdown}s后自动关闭
              </span>
            </DialogTitle>
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
                <p className="text-lg font-bold text-blue-600 mb-2">
                  正确数量：{examResult.correctCount}/{examResult.totalQuestions}
                </p>
                <p className="text-2xl font-bold text-green-600 mb-2">
                  您的分数是 {examResult.score}分
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">答题数量：</span>
                  <span>{getAnsweredCount()}/{exam.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">考试用时：</span>
                  <span>{formatTime((exam.duration * 60) - timeRemaining)}</span>
                </div>
              </div>
              
              <Button onClick={handleConfirmSubmit} className="w-full">
                立即返回主页 ({countdown}s)
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 刷新警告弹窗 */}
      <Dialog open={showRefreshWarning} onOpenChange={setShowRefreshWarning}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>考试进行中</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">确定要刷新页面吗？</h3>
              <p className="text-gray-600 text-sm">
                刷新页面将丢失当前答题进度，需要重新开始考试。
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">温馨提示：</p>
                  <p>• 已答题：{getAnsweredCount()}/{exam.questions.length} 题</p>
                  <p>• 剩余时间：{formatTime(timeRemaining)}</p>
                  <p>• 刷新后将重新开始考试</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowRefreshWarning(false)}
                className="flex-1"
              >
                继续考试
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  setShowRefreshWarning(false);
                  window.location.reload();
                }}
                className="flex-1"
              >
                确认刷新
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamSession;
