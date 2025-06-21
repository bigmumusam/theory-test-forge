
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ExamConfig } from '../../types/exam';
import ExamPaperGenerator from './ExamPaperGenerator';
import ExamPaperList from './ExamPaperList';

const ExamConfigManager: React.FC = () => {
  const [examConfigs, setExamConfigs] = useState<ExamConfig[]>([]);
  const [loading, setLoading] = useState(false);

  const [newConfig, setNewConfig] = useState<Partial<ExamConfig>>({
    name: '',
    categories: [],
    questionTypes: {
      choice: { count: 40, score: 2 },
      judgment: { count: 20, score: 1 }
    },
    duration: 90,
    totalScore: 100
  });

  const { toast } = useToast();
  const categories = ['消化内科', '肝胆外科', '心血管内科', '呼吸内科'];

  // 模拟API调用 - 获取考试配置列表
  const fetchExamConfigs = async () => {
    setLoading(true);
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockConfigs: ExamConfig[] = [
        {
          id: '1',
          name: '消化内科理论考试',
          categories: ['消化内科'],
          questionTypes: {
            choice: { count: 40, score: 2 },
            judgment: { count: 20, score: 1 }
          },
          duration: 90,
          totalScore: 100
        },
        {
          id: '2',
          name: '肝胆外科专业考试',
          categories: ['肝胆外科'],
          questionTypes: {
            choice: { count: 35, score: 2 },
            judgment: { count: 30, score: 1 }
          },
          duration: 120,
          totalScore: 100
        }
      ];

      setExamConfigs(mockConfigs);
      console.log('考试配置列表加载成功');
    } catch (error) {
      console.error('获取考试配置失败:', error);
      toast({
        title: "加载失败",
        description: "获取考试配置失败，请重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamConfigs();
  }, []);

  const calculateTotalScore = (config: Partial<ExamConfig>) => {
    if (!config.questionTypes) return 0;
    const choiceTotal = config.questionTypes.choice.count * config.questionTypes.choice.score;
    const judgmentTotal = config.questionTypes.judgment.count * config.questionTypes.judgment.score;
    return choiceTotal + judgmentTotal;
  };

  const [paperGeneratorOpen, setPaperGeneratorOpen] = useState(false);
  const [selectedConfigForPaper, setSelectedConfigForPaper] = useState<ExamConfig | null>(null);

  // 模拟API调用 - 添加考试配置
  const handleAddConfig = async () => {
    if (!newConfig.name || !newConfig.categories?.length) {
      toast({
        title: "请填写完整信息",
        description: "考试名称和科室为必填项",
        variant: "destructive"
      });
      return;
    }

    const totalScore = calculateTotalScore(newConfig);
    if (totalScore !== 100) {
      toast({
        title: "分数配置错误",
        description: "总分必须等于100分",
        variant: "destructive"
      });
      return;
    }

    try {
      // 模拟API调用
      console.log('创建考试配置:', newConfig);
      await new Promise(resolve => setTimeout(resolve, 500));

      const config: ExamConfig = {
        id: Date.now().toString(),
        name: newConfig.name,
        categories: newConfig.categories,
        questionTypes: newConfig.questionTypes!,
        duration: newConfig.duration || 90,
        totalScore: 100
      };

      setExamConfigs([...examConfigs, config]);
      
      // 重置表单
      setNewConfig({
        name: '',
        categories: [],
        questionTypes: {
          choice: { count: 40, score: 2 },
          judgment: { count: 20, score: 1 }
        },
        duration: 90,
        totalScore: 100
      });

      toast({
        title: "考试配置创建成功",
        description: `已创建考试配置：${config.name}`
      });
    } catch (error) {
      console.error('创建考试配置失败:', error);
      toast({
        title: "创建失败",
        description: "创建考试配置失败，请重试",
        variant: "destructive"
      });
    }
  };

  // 模拟API调用 - 删除考试配置
  const handleDeleteConfig = async (configId: string) => {
    try {
      console.log('删除考试配置:', configId);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setExamConfigs(examConfigs.filter(config => config.id !== configId));
      toast({
        title: "配置删除成功",
        description: "已删除考试配置"
      });
    } catch (error) {
      console.error('删除考试配置失败:', error);
      toast({
        title: "删除失败",
        description: "删除考试配置失败，请重试",
        variant: "destructive"
      });
    }
  };

  const handleGeneratePaper = (config: ExamConfig) => {
    setSelectedConfigForPaper(config);
    setPaperGeneratorOpen(true);
  };

  const handleEditConfig = (config: ExamConfig) => {
    // TODO: 实现编辑功能
    toast({
      title: "编辑功能",
      description: "编辑功能正在开发中",
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">考试配置管理</h2>
      </div>

      <Tabs defaultValue="configs" className="w-full">
        <TabsList>
          <TabsTrigger value="configs">考试配置</TabsTrigger>
          <TabsTrigger value="papers">试卷列表</TabsTrigger>
        </TabsList>
        
        <TabsContent value="configs" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* 新建配置表单 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">新建考试配置</h3>
              
              <div className="space-y-4">
                <div>
                  <Label>考试名称</Label>
                  <Input 
                    value={newConfig.name} 
                    onChange={(e) => setNewConfig({...newConfig, name: e.target.value})}
                    placeholder="请输入考试名称"
                  />
                </div>

                <div>
                  <Label>考试科室</Label>
                  <Select onValueChange={(value) => setNewConfig({...newConfig, categories: [value]})}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择考试科室" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>题型配置</Label>
                  
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <span className="text-sm font-medium">选择题</span>
                    <Input 
                      type="number" 
                      placeholder="题目数量"
                      value={newConfig.questionTypes?.choice.count}
                      onChange={(e) => setNewConfig({
                        ...newConfig, 
                        questionTypes: {
                          ...newConfig.questionTypes!,
                          choice: { ...newConfig.questionTypes!.choice, count: parseInt(e.target.value) || 0 }
                        }
                      })}
                    />
                    <div className="flex items-center space-x-1">
                      <Input 
                        type="number" 
                        placeholder="分值"
                        value={newConfig.questionTypes?.choice.score}
                        onChange={(e) => setNewConfig({
                          ...newConfig, 
                          questionTypes: {
                            ...newConfig.questionTypes!,
                            choice: { ...newConfig.questionTypes!.choice, score: parseInt(e.target.value) || 0 }
                          }
                        })}
                      />
                      <span className="text-sm text-gray-600">分/题</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center">
                    <span className="text-sm font-medium">判断题</span>
                    <Input 
                      type="number" 
                      placeholder="题目数量"
                      value={newConfig.questionTypes?.judgment.count}
                      onChange={(e) => setNewConfig({
                        ...newConfig, 
                        questionTypes: {
                          ...newConfig.questionTypes!,
                          judgment: { ...newConfig.questionTypes!.judgment, count: parseInt(e.target.value) || 0 }
                        }
                      })}
                    />
                    <div className="flex items-center space-x-1">
                      <Input 
                        type="number" 
                        placeholder="分值"
                        value={newConfig.questionTypes?.judgment.score}
                        onChange={(e) => setNewConfig({
                          ...newConfig, 
                          questionTypes: {
                            ...newConfig.questionTypes!,
                            judgment: { ...newConfig.questionTypes!.judgment, score: parseInt(e.target.value) || 0 }
                          }
                        })}
                      />
                      <span className="text-sm text-gray-600">分/题</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">
                      计算总分：{calculateTotalScore(newConfig)}分 
                      {calculateTotalScore(newConfig) === 100 ? 
                        <span className="text-green-600 ml-2">✓</span> : 
                        <span className="text-red-600 ml-2">✗ 需要等于100分</span>
                      }
                    </p>
                  </div>
                </div>

                <div>
                  <Label>考试时长（分钟）</Label>
                  <Input 
                    type="number" 
                    value={newConfig.duration} 
                    onChange={(e) => setNewConfig({...newConfig, duration: parseInt(e.target.value)})}
                    placeholder="考试时长"
                  />
                </div>

                <Button onClick={handleAddConfig} className="w-full">
                  创建考试配置
                </Button>
              </div>
            </Card>

            {/* 现有配置列表 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">现有配置</h3>
              
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <span>加载中...</span>
                </div>
              ) : (
                examConfigs.map(config => (
                  <Card key={config.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-medium text-gray-800">{config.name}</h4>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeleteConfig(config.id)}
                      >
                        删除
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">考试科室：</span>
                        <span>{config.categories.join(', ')}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">考试时长：</span>
                        <span>{config.duration}分钟</span>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded">
                        <h5 className="text-sm font-medium text-gray-800 mb-2">题型配置：</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>选择题：</span>
                            <span>{config.questionTypes.choice.count}题 × {config.questionTypes.choice.score}分 = {config.questionTypes.choice.count * config.questionTypes.choice.score}分</span>
                          </div>
                          <div className="flex justify-between">
                            <span>判断题：</span>
                            <span>{config.questionTypes.judgment.count}题 × {config.questionTypes.judgment.score}分 = {config.questionTypes.judgment.count * config.questionTypes.judgment.score}分</span>
                          </div>
                          <hr className="my-2" />
                          <div className="flex justify-between font-medium">
                            <span>总计：</span>
                            <span>{config.totalScore}分</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditConfig(config)}
                        >
                          编辑
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleGeneratePaper(config)}
                        >
                          生成试卷
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="papers">
          <ExamPaperList />
        </TabsContent>
      </Tabs>

      {/* 试卷生成对话框 */}
      <ExamPaperGenerator
        isOpen={paperGeneratorOpen}
        onClose={() => {
          setPaperGeneratorOpen(false);
          setSelectedConfigForPaper(null);
        }}
        config={selectedConfigForPaper || undefined}
      />
    </div>
  );
};

export default ExamConfigManager;

