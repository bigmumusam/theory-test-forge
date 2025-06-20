
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileText, Settings } from 'lucide-react';

interface ExamPaperGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
}

const ExamPaperGenerator: React.FC<ExamPaperGeneratorProps> = ({
  open,
  onOpenChange,
  categories
}) => {
  const [config, setConfig] = useState({
    name: '',
    category: '',
    duration: 60,
    totalScore: 100,
    questionCount: 10,
    easyCount: 3,
    mediumCount: 5,
    hardCount: 2
  });
  const [generatedPaper, setGeneratedPaper] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!config.name || !config.category) {
      toast({
        title: "请填写完整信息",
        description: "考试名称和科室为必填项",
        variant: "destructive"
      });
      return;
    }

    if (config.easyCount + config.mediumCount + config.hardCount !== config.questionCount) {
      toast({
        title: "题目数量不匹配",
        description: "各难度题目总数应等于总题目数",
        variant: "destructive"
      });
      return;
    }

    // 模拟生成试卷
    const paper = {
      id: Date.now().toString(),
      name: config.name,
      category: config.category,
      duration: config.duration,
      totalScore: config.totalScore,
      questionCount: config.questionCount,
      questions: [
        {
          id: '1',
          type: 'choice',
          content: '胃溃疡最常见的并发症是？',
          options: ['穿孔', '出血', '幽门梗阻', '癌变'],
          correctAnswer: 1,
          score: 10,
          difficulty: 'medium'
        },
        {
          id: '2',
          type: 'judgment',
          content: 'Hp感染是胃溃疡的主要病因之一',
          correctAnswer: '正确',
          score: 10,
          difficulty: 'easy'
        }
      ],
      createdAt: new Date().toLocaleString()
    };

    setGeneratedPaper(paper);
    toast({
      title: "试卷生成成功",
      description: `已生成试卷：${config.name}`
    });
  };

  const handleSave = () => {
    // 这里应该调用后端API保存试卷
    toast({
      title: "保存成功",
      description: "试卷已保存到系统中"
    });
    onOpenChange(false);
    setGeneratedPaper(null);
    setConfig({
      name: '',
      category: '',
      duration: 60,
      totalScore: 100,
      questionCount: 10,
      easyCount: 3,
      mediumCount: 5,
      hardCount: 2
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>生成试卷</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* 配置区域 */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-5 h-5" />
              <h3 className="text-lg font-semibold">试卷配置</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>考试名称</Label>
                <Input
                  value={config.name}
                  onChange={(e) => setConfig({...config, name: e.target.value})}
                  placeholder="请输入考试名称"
                />
              </div>
              
              <div>
                <Label>所属科室</Label>
                <Select 
                  value={config.category} 
                  onValueChange={(value) => setConfig({...config, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择科室" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>考试时长(分钟)</Label>
                  <Input
                    type="number"
                    value={config.duration}
                    onChange={(e) => setConfig({...config, duration: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>总分</Label>
                  <Input
                    type="number"
                    value={config.totalScore}
                    onChange={(e) => setConfig({...config, totalScore: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div>
                <Label>总题目数</Label>
                <Input
                  type="number"
                  value={config.questionCount}
                  onChange={(e) => setConfig({...config, questionCount: parseInt(e.target.value)})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>难度分布</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs text-green-600">简单</Label>
                    <Input
                      type="number"
                      value={config.easyCount}
                      onChange={(e) => setConfig({...config, easyCount: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-yellow-600">中等</Label>
                    <Input
                      type="number"
                      value={config.mediumCount}
                      onChange={(e) => setConfig({...config, mediumCount: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-red-600">困难</Label>
                    <Input
                      type="number"
                      value={config.hardCount}
                      onChange={(e) => setConfig({...config, hardCount: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={handleGenerate} className="w-full">
                生成试卷
              </Button>
            </div>
          </Card>
          
          {/* 预览区域 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">试卷预览</h3>
            
            {generatedPaper ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-bold text-lg">{generatedPaper.name}</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <span>科室：{generatedPaper.category}</span>
                    <span>时长：{generatedPaper.duration}分钟</span>
                    <span>总分：{generatedPaper.totalScore}分</span>
                    <span>题目数：{generatedPaper.questionCount}题</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h5 className="font-semibold">题目预览：</h5>
                  {generatedPaper.questions.map((q: any, index: number) => (
                    <div key={q.id} className="border p-3 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">第{index + 1}题</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {q.score}分
                        </span>
                      </div>
                      <p className="text-sm mb-2">{q.content}</p>
                      {q.options && (
                        <div className="text-xs space-y-1">
                          {q.options.map((option: string, i: number) => (
                            <div key={i} className={`${q.correctAnswer === i ? 'text-green-600 font-medium' : ''}`}>
                              {String.fromCharCode(65 + i)}. {option}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <Button onClick={handleSave} className="w-full">
                  保存试卷
                </Button>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>请配置试卷参数并点击生成</p>
              </div>
            )}
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExamPaperGenerator;
