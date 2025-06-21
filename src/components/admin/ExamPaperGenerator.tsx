
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, RefreshCw, Check, X } from 'lucide-react';
import { ExamConfig } from '../../types/exam';

interface ExamPaperGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  config?: ExamConfig;
}

interface GeneratedQuestion {
  id: string;
  type: 'choice' | 'judgment';
  content: string;
  options?: string[];
  score: number;
  selected: boolean;
}

interface GeneratedPaper {
  id: string;
  name: string;
  config: ExamConfig;
  questions: GeneratedQuestion[];
  generateTime: Date;
}

const ExamPaperGenerator: React.FC<ExamPaperGeneratorProps> = ({
  isOpen,
  onClose,
  config
}) => {
  const { toast } = useToast();
  const [paperName, setPaperName] = useState('');
  const [generatedPaper, setGeneratedPaper] = useState<GeneratedPaper | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [replacingQuestionId, setReplacingQuestionId] = useState<string | null>(null);

  // 模拟题库数据
  const questionBank = {
    choice: [
      {
        content: '胃溃疡最常见的并发症是？',
        options: ['穿孔', '出血', '幽门梗阻', '癌变']
      },
      {
        content: '以下哪种药物是质子泵抑制剂？',
        options: ['雷尼替丁', '奥美拉唑', '多潘立酮', '铝碳酸镁']
      },
      {
        content: '慢性胃炎最常见的病因是？',
        options: ['幽门螺杆菌感染', '药物刺激', '胆汁反流', '自身免疫']
      },
      {
        content: '肝硬化最常见的并发症是？',
        options: ['腹水', '食管胃底静脉曲张破裂出血', '肝性脑病', '感染']
      },
      {
        content: '急性心肌梗死最特异的心电图表现是？',
        options: ['ST段抬高', 'T波倒置', 'Q波出现', 'ST段压低']
      }
    ],
    judgment: [
      {
        content: '胆囊炎患者应避免高脂饮食。'
      },
      {
        content: '糖尿病患者可以随意进食水果。'
      },
      {
        content: '高血压患者应限制钠盐摄入。'
      },
      {
        content: '慢性肾病患者应增加蛋白质摄入。'
      },
      {
        content: '心房颤动患者需要终生抗凝治疗。'
      }
    ]
  };

  const handleGenerate = async () => {
    if (!config) return;
    
    if (!paperName.trim()) {
      toast({
        title: "请输入试卷名称",
        description: "试卷名称不能为空",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // 模拟生成试卷
    setTimeout(() => {
      const questions: GeneratedQuestion[] = [];
      
      // 生成选择题
      for (let i = 0; i < config.questionTypes.choice.count; i++) {
        const randomChoice = questionBank.choice[Math.floor(Math.random() * questionBank.choice.length)];
        questions.push({
          id: `choice_${i + 1}`,
          type: 'choice',
          content: randomChoice.content,
          options: randomChoice.options,
          score: config.questionTypes.choice.score,
          selected: false
        });
      }
      
      // 生成判断题
      for (let i = 0; i < config.questionTypes.judgment.count; i++) {
        const randomJudgment = questionBank.judgment[Math.floor(Math.random() * questionBank.judgment.length)];
        questions.push({
          id: `judgment_${i + 1}`,
          type: 'judgment',
          content: randomJudgment.content,
          score: config.questionTypes.judgment.score,
          selected: false
        });
      }

      const paper: GeneratedPaper = {
        id: Date.now().toString(),
        name: paperName,
        config: config,
        questions: questions,
        generateTime: new Date()
      };

      setGeneratedPaper(paper);
      setIsGenerating(false);
      
      toast({
        title: "试卷生成成功",
        description: `已生成 ${paper.name}，共 ${paper.questions.length} 题`
      });
    }, 2000);
  };

  const handleReplaceQuestion = (questionId: string) => {
    if (!generatedPaper) return;
    
    setReplacingQuestionId(questionId);
    
    setTimeout(() => {
      const question = generatedPaper.questions.find(q => q.id === questionId);
      if (!question) return;
      
      const bankQuestions = questionBank[question.type];
      const randomQuestion = bankQuestions[Math.floor(Math.random() * bankQuestions.length)];
      
      const updatedQuestions = generatedPaper.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            content: randomQuestion.content,
            options: 'options' in randomQuestion ? randomQuestion.options : undefined
          };
        }
        return q;
      });
      
      setGeneratedPaper({
        ...generatedPaper,
        questions: updatedQuestions
      });
      
      setReplacingQuestionId(null);
      
      toast({
        title: "题目已替换",
        description: "已从题库中随机选择新题目"
      });
    }, 1000);
  };

  const toggleQuestionSelection = (questionId: string) => {
    if (!generatedPaper) return;
    
    const updatedQuestions = generatedPaper.questions.map(q => {
      if (q.id === questionId) {
        return { ...q, selected: !q.selected };
      }
      return q;
    });
    
    setGeneratedPaper({
      ...generatedPaper,
      questions: updatedQuestions
    });
  };

  const handleBatchReplace = () => {
    if (!generatedPaper) return;
    
    const selectedQuestions = generatedPaper.questions.filter(q => q.selected);
    if (selectedQuestions.length === 0) {
      toast({
        title: "请选择要替换的题目",
        description: "请先勾选要替换的题目",
        variant: "destructive"
      });
      return;
    }
    
    selectedQuestions.forEach(q => {
      handleReplaceQuestion(q.id);
    });
  };

  const handleExport = () => {
    if (!generatedPaper) return;
    
    const content = `试卷名称：${generatedPaper.name}\n科室：${generatedPaper.config.categories.join(', ')}\n总题数：${generatedPaper.questions.length}\n总分：${generatedPaper.config.totalScore}\n时长：${generatedPaper.config.duration}分钟\n\n题目列表：\n${generatedPaper.questions.map((q, i) => `${i + 1}. ${q.content}${q.options ? '\n' + q.options.map((opt, j) => `   ${String.fromCharCode(65 + j)}. ${opt}`).join('\n') : ''}`).join('\n\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${generatedPaper.name}.txt`;
    link.click();
  };

  const resetForm = () => {
    setPaperName('');
    setGeneratedPaper(null);
    setReplacingQuestionId(null);
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>生成试卷 - {config.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 配置信息 */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">配置信息</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">考试名称：</span>
                <span>{config.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">科室：</span>
                <span>{config.categories.join(', ')}</span>
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
            </div>

            {!generatedPaper && (
              <div className="mt-6 space-y-4">
                <div>
                  <Label>试卷名称</Label>
                  <Input
                    value={paperName}
                    onChange={(e) => setPaperName(e.target.value)}
                    placeholder="请输入试卷名称"
                  />
                </div>
                
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isGenerating ? '生成中...' : '生成试卷'}
                </Button>
              </div>
            )}
          </Card>

          {/* 生成结果 */}
          <div className="lg:col-span-2">
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">生成结果</h3>
                {generatedPaper && (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleBatchReplace}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      批量替换选中
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                      <Download className="w-4 h-4 mr-2" />
                      导出试卷
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetForm}>
                      重新生成
                    </Button>
                  </div>
                )}
              </div>
              
              {!generatedPaper && !isGenerating && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>请输入试卷名称并点击生成试卷</p>
                </div>
              )}

              {isGenerating && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-blue-600">正在从题库中随机抽取题目...</p>
                </div>
              )}

              {generatedPaper && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <h4 className="font-semibold text-green-800 mb-2">{generatedPaper.name}</h4>
                    <p className="text-sm text-green-700">
                      生成时间：{generatedPaper.generateTime.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium">题目列表</h5>
                      <p className="text-sm text-gray-600">
                        已选择 {generatedPaper.questions.filter(q => q.selected).length} 题
                      </p>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {generatedPaper.questions.map((question, index) => (
                        <div key={question.id} className="border border-gray-200 rounded p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <input
                                type="checkbox"
                                checked={question.selected}
                                onChange={() => toggleQuestionSelection(question.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {index + 1}. {question.content}
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {question.type === 'choice' ? '选择题' : '判断题'} - {question.score}分
                                  </span>
                                </p>
                                {question.options && (
                                  <div className="mt-2 text-sm text-gray-600">
                                    {question.options.map((option, i) => (
                                      <p key={i} className="ml-4">
                                        {String.fromCharCode(65 + i)}. {option}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReplaceQuestion(question.id)}
                              disabled={replacingQuestionId === question.id}
                            >
                              {replacingQuestionId === question.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                              ) : (
                                <RefreshCw className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExamPaperGenerator;
