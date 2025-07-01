import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileText, RefreshCw } from 'lucide-react';
import { ExamConfig } from '../../types/exam';
import { request } from '@/lib/request';
import { useOptions } from '../../context/OptionsContext';
import { v4 as uuidv4 } from 'uuid';

interface ExamPaperGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  config?: ExamConfig;
}

const ExamPaperGenerator: React.FC<ExamPaperGeneratorProps> = ({ isOpen, onClose, config }) => {
  const { toast } = useToast();
  const { options } = useOptions();
  const [paperName, setPaperName] = useState('');
  const [step, setStep] = useState<'preview' | 'confirm'>('preview');
  const [loading, setLoading] = useState(false);
  const [allQuestions, setAllQuestions] = useState<{ choice: any[]; judgment: any[] }>({ choice: [], judgment: [] });
  const [selectedQuestions, setSelectedQuestions] = useState<{ choice: any[]; judgment: any[] }>({ choice: [], judgment: [] });
  const [replaceType, setReplaceType] = useState<'choice' | 'judgment' | null>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPaperName('');
      setStep('preview');
      setLoading(false);
      setAllQuestions({ choice: [], judgment: [] });
      setSelectedQuestions({ choice: [], judgment: [] });
      setReplaceType(null);
      setReplaceIndex(null);
    }
  }, [isOpen]);

  if (!config) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>生成试卷</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-500">请先选择考试配置</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 预览：拉取题库并随机抽题
  const handlePreview = async () => {
    if (!paperName.trim()) {
      toast({ title: '请输入试卷名称', description: '试卷名称不能为空', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await request('/admin/questions/listWithCategoryId', {
        method: 'POST',
        body: JSON.stringify({ categoryId: config.categories[0] })
      });
      const all = {
        choice: res.data.filter((q: any) => q.questionType === 'choice'),
        judgment: res.data.filter((q: any) => q.questionType === 'judgment')
      };
      setAllQuestions(all);
      setSelectedQuestions({
        choice: getRandomItems(all.choice, config.questionTypes.choice.count),
        judgment: getRandomItems(all.judgment, config.questionTypes.judgment.count)
      });
      setStep('confirm');
    } catch (e) {
      toast({ title: '题库加载失败', description: String(e), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  function getRandomItems(arr: any[], n: number) {
    const shuffled = arr.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  }

  // 替换题目
  const handleReplace = (type: 'choice' | 'judgment', idx: number) => {
    setReplaceType(type);
    setReplaceIndex(idx);
  };
  const handleSelectReplace = (q: any) => {
    if (replaceType && replaceIndex !== null) {
      setSelectedQuestions(prev => ({
        ...prev,
        [replaceType]: prev[replaceType].map((item, i) => i === replaceIndex ? q : item)
      }));
      setReplaceType(null);
      setReplaceIndex(null);
    }
  };

  // 确认生成
  const handleConfirm = async () => {
    setLoading(true);
    try {
      const examPaperList = [
        ...selectedQuestions.choice.map((q, i) => ({
          questionId: q.questionId,
          questionOrder: i + 1,
          score: config.questionTypes.choice.score
        })),
        ...selectedQuestions.judgment.map((q, i) => ({
          questionId: q.questionId,
          questionOrder: selectedQuestions.choice.length + i + 1,
          score: config.questionTypes.judgment.score
        }))
      ];
      await request('/admin/generate-paper', {
        method: 'POST',
        body: JSON.stringify({
          paperId: `paperId_${uuidv4()}`,
          paperName,
          configId: config.id,
          categoryId: config.categories[0],
          totalQuestions: examPaperList.length,
          totalScore: config.totalScore,
          duration: config.duration,
          examPaperList
        })
      });
      toast({ title: '试卷生成成功', description: `已生成试卷：${paperName}` });
      setTimeout(() => {
        setPaperName('');
        setStep('preview');
        setLoading(false);
        setAllQuestions({ choice: [], judgment: [] });
        setSelectedQuestions({ choice: [], judgment: [] });
        setReplaceType(null);
        setReplaceIndex(null);
        onClose();
      }, 2000);
    } catch (e) {
      toast({ title: '生成失败', description: String(e), variant: 'destructive' });
      setLoading(false);
    }
  };

  // 可用题目（用于替换时弹窗）
  const availableReplace = replaceType && replaceIndex !== null
    ? allQuestions[replaceType].filter(q => !selectedQuestions[replaceType].some(sq => sq.questionId === q.questionId))
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[66vw] h-[66vh] max-h-[66vh] overflow-y-auto flex flex-col justify-between">
        <DialogHeader>
          <DialogTitle>生成试卷 - {config.name}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* 配置信息 */}
          <Card className="p-4 h-full flex flex-col justify-between">
            <h3 className="text-lg font-semibold mb-4">配置信息</h3>
            <div className="space-y-3 text-sm flex-1">
              <div className="flex justify-between">
                <span className="text-gray-600">考试名称：</span>
                <span>{config.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">题目分类：</span>
                <span>{options?.categories?.[config.categories[0]] || config.categories[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">时长：</span>
                <span>{config.duration}分钟</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">选择题：</span>
                <span>{config.questionTypes.choice.count}题 × {config.questionTypes.choice.score}分</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">判断题：</span>
                <span>{config.questionTypes.judgment.count}题 × {config.questionTypes.judgment.score}分</span>
              </div>
              <hr />
              <div className="flex justify-between font-medium">
                <span>总分：</span>
                <span>{config.totalScore}分</span>
              </div>
              <div className="mt-2">
                  <Label>试卷名称</Label>
                {step === 'preview' ? (
                  <Input
                    value={paperName}
                    onChange={e => setPaperName(e.target.value)}
                    placeholder="请输入试卷名称"
                    className="mt-2"
                  />
                ) : (
                  <div className="py-2 px-3 border rounded bg-gray-50 text-gray-800 mt-2">{paperName}</div>
                )}
              </div>
            </div>
            {step === 'preview' && (
              <Button onClick={handlePreview} disabled={loading} className="w-full mt-6">
                <FileText className="w-4 h-4 mr-2" />
                {loading ? '加载中...' : '试卷预览'}
              </Button>
            )}
            {step === 'confirm' && (
              <Button onClick={handleConfirm} disabled={loading} className="w-full mt-6">
                {loading ? '生成中...' : '确认生成试卷'}
              </Button>
            )}
          </Card>
          {/* 题目列表 */}
          <div className="lg:col-span-2 h-full">
            <Card className="p-4 h-full flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">题目列表</h3>
              </div>
              <div className="flex-1 flex flex-col">
                {step === 'preview' && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>点击"试卷预览"后可查看题目</p>
                  </div>
                )}
                {step === 'confirm' && (
                  <div className="h-full max-h-full overflow-y-auto space-y-3">
                    {selectedQuestions.choice.map((q, idx) => (
                      <div key={q.questionId} className="border border-gray-200 rounded p-3 flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                            {idx + 1}. {q.questionContent || q.content}
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              选择题 - {config.questionTypes.choice.score}分
                                  </span>
                                </p>
                          {q.options && (
                                  <div className="mt-2 text-sm text-gray-600">
                              {q.options.map((option: string, i: number) => (
                                      <p key={i} className="ml-4">
                                        {String.fromCharCode(65 + i)}. {option}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                        <Button size="sm" variant="outline" onClick={() => handleReplace('choice', idx)}>
                          <RefreshCw className="w-4 h-4" /> 替换
                            </Button>
                          </div>
                    ))}
                    {selectedQuestions.judgment.map((q, idx) => (
                      <div key={q.questionId} className="border border-gray-200 rounded p-3 flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {selectedQuestions.choice.length + idx + 1}. {q.questionContent || q.content}
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              判断题 - {config.questionTypes.judgment.score}分
                            </span>
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleReplace('judgment', idx)}>
                          <RefreshCw className="w-4 h-4" /> 替换
                        </Button>
                        </div>
                      ))}
                  </div>
                )}
                </div>
            </Card>
          </div>
        </div>
        {/* 替换题目弹窗 */}
        {replaceType && replaceIndex !== null && (
          <Dialog open onOpenChange={() => { setReplaceType(null); setReplaceIndex(null); }}>
            <DialogContent className="max-w-2xl h-[66vh] max-h-[66vh]">
              <DialogHeader>
                <DialogTitle>选择替换题目</DialogTitle>
              </DialogHeader>
              <div className="max-h-[50vh] overflow-y-auto space-y-2">
                {availableReplace.length === 0 && <div className="text-gray-500 text-center">暂无可替换题目</div>}
                {availableReplace.map(q => (
                  <div key={q.questionId} className="border rounded p-2 flex items-center justify-between">
                    <div>
                      <span className="font-medium">{q.questionContent || q.content}</span>
                      {q.options && (
                        <div className="mt-1 text-xs text-gray-600">
                          {q.options.map((option: string, i: number) => (
                            <span key={i} className="ml-2">{String.fromCharCode(65 + i)}. {option}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button size="sm" onClick={() => handleSelectReplace(q)}>选择</Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExamPaperGenerator;
