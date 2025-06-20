
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Eye } from 'lucide-react';

interface ExamPaperGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GeneratedPaper {
  id: string;
  name: string;
  category: string;
  totalQuestions: number;
  totalScore: number;
  duration: number;
  questions: Array<{
    id: string;
    type: string;
    content: string;
    options?: string[];
    score: number;
  }>;
  generateTime: Date;
}

const ExamPaperGenerator: React.FC<ExamPaperGeneratorProps> = ({
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    duration: 30,
    choiceCount: 5,
    judgmentCount: 5,
    choiceScore: 2,
    judgmentScore: 1
  });
  const [generatedPaper, setGeneratedPaper] = useState<GeneratedPaper | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const categories = ['消化内科', '肝胆外科', '心血管内科', '呼吸内科'];

  const handleGenerate = async () => {
    if (!formData.name || !formData.category) {
      toast({
        title: "请填写完整信息",
        description: "请填写试卷名称和选择科室",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // 模拟生成试卷
    setTimeout(() => {
      const mockQuestions = [
        {
          id: '1',
          type: 'choice',
          content: '胃溃疡最常见的并发症是？',
          options: ['穿孔', '出血', '幽门梗阻', '癌变'],
          score: formData.choiceScore
        },
        {
          id: '2',
          type: 'judgment',
          content: '胆囊炎患者应避免高脂饮食。',
          score: formData.judgmentScore
        },
        {
          id: '3',
          type: 'choice',
          content: '以下哪种药物是质子泵抑制剂？',
          options: ['雷尼替丁', '奥美拉唑', '多潘立酮', '铝碳酸镁'],
          score: formData.choiceScore
        }
      ];

      const paper: GeneratedPaper = {
        id: Date.now().toString(),
        name: formData.name,
        category: formData.category,
        totalQuestions: formData.choiceCount + formData.judgmentCount,
        totalScore: (formData.choiceCount * formData.choiceScore) + (formData.judgmentCount * formData.judgmentScore),
        duration: formData.duration,
        questions: mockQuestions,
        generateTime: new Date()
      };

      setGeneratedPaper(paper);
      setIsGenerating(false);
      
      toast({
        title: "试卷生成成功",
        description: `已生成 ${paper.name}，共 ${paper.totalQuestions} 题，总分 ${paper.totalScore} 分`
      });
    }, 2000);
  };

  const handleExport = () => {
    if (!generatedPaper) return;
    
    const content = `试卷名称：${generatedPaper.name}\n科室：${generatedPaper.category}\n总题数：${generatedPaper.totalQuestions}\n总分：${generatedPaper.totalScore}\n时长：${generatedPaper.duration}分钟\n\n题目列表：\n${generatedPaper.questions.map((q, i) => `${i + 1}. ${q.content}`).join('\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${generatedPaper.name}.txt`;
    link.click();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      duration: 30,
      choiceCount: 5,
      judgmentCount: 5,
      choiceScore: 2,
      judgmentScore: 1
    });
    setGeneratedPaper(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>生成试卷</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 配置表单 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">试卷配置</h3>
            
            <div className="space-y-4">
              <div>
                <Label>试卷名称</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="请输入试卷名称"
                />
              </div>

              <div>
                <Label>所属科室</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
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

              <div>
                <Label>考试时长（分钟）</Label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  min="1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>选择题数量</Label>
                  <Input
                    type="number"
                    value={formData.choiceCount}
                    onChange={(e) => setFormData({...formData, choiceCount: parseInt(e.target.value)})}
                    min="0"
                  />
                </div>
                <div>
                  <Label>选择题分值</Label>
                  <Input
                    type="number"
                    value={formData.choiceScore}
                    onChange={(e) => setFormData({...formData, choiceScore: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>判断题数量</Label>
                  <Input
                    type="number"
                    value={formData.judgmentCount}
                    onChange={(e) => setFormData({...formData, judgmentCount: parseInt(e.target.value)})}
                    min="0"
                  />
                </div>
                <div>
                  <Label>判断题分值</Label>
                  <Input
                    type="number"
                    value={formData.judgmentScore}
                    onChange={(e) => setFormData({...formData, judgmentScore: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  预计总题数：{formData.choiceCount + formData.judgmentCount} 题<br/>
                  预计总分：{(formData.choiceCount * formData.choiceScore) + (formData.judgmentCount * formData.judgmentScore)} 分
                </p>
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
          </Card>

          {/* 生成结果 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">生成结果</h3>
            
            {!generatedPaper && !isGenerating && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>请配置参数并点击生成试卷</p>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-blue-600">正在生成试卷...</p>
              </div>
            )}

            {generatedPaper && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h4 className="font-semibold text-green-800 mb-2">{generatedPaper.name}</h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>科室：{generatedPaper.category}</p>
                    <p>题目数量：{generatedPaper.totalQuestions} 题</p>
                    <p>总分：{generatedPaper.totalScore} 分</p>
                    <p>考试时长：{generatedPaper.duration} 分钟</p>
                    <p>生成时间：{generatedPaper.generateTime.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="font-medium">题目预览</h5>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {generatedPaper.questions.map((question, index) => (
                      <div key={question.id} className="text-sm p-2 bg-gray-50 rounded">
                        <p className="font-medium">{index + 1}. {question.content}</p>
                        {question.options && (
                          <div className="mt-1 text-gray-600">
                            {question.options.map((option, i) => (
                              <p key={i} className="ml-4">{String.fromCharCode(65 + i)}. {option}</p>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-blue-600 mt-1">分值: {question.score}分</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    导出试卷
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    重新生成
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExamPaperGenerator;
