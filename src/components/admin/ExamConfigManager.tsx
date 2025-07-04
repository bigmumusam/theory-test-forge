import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ExamConfig } from '../../types/exam';
import { request } from '@/lib/request';
import ExamPaperGenerator from './ExamPaperGenerator';
import ExamPaperList from './ExamPaperList';
import { useOptions } from '../../context/OptionsContext';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const ExamConfigManager: React.FC = () => {
  const [examConfigs, setExamConfigs] = useState<ExamConfig[]>([]);
  const [loading, setLoading] = useState(false);

  const [newConfig, setNewConfig] = useState<Partial<ExamConfig>>({
    name: '',
    categories: [],
    questionTypes: {
      choice: { count: 30, score: 2 },
      multi: { count: 0, score: 4 },
      judgment: { count: 20, score: 2 }
    },
    duration: 90,
    totalScore: 100
  });

  const { toast } = useToast();
  const { options } = useOptions();
  const categories = options?.categories ? Object.entries(options.categories) : [];

  const [configPage, setConfigPage] = useState(1);
  const configsPerPage = 6;
  const totalConfigPages = Math.max(1, Math.ceil(examConfigs.length / configsPerPage));

  const [globalLoading, setGlobalLoading] = useState(false);

  // 真实API调用 - 获取考试配置列表
  const fetchExamConfigs = async () => {
    setLoading(true);
    try {
      const res = await request('/admin/exam-configs', {
        method: 'POST',
        body: JSON.stringify({ pageNumber: 1, pageSize: 100 })
      });
      let list: any[] = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res.records)) {
        list = res.records;
      } else if (Array.isArray(res.data)) {
        list = res.data;
      } else if (res.data && Array.isArray(res.data.records)) {
        list = res.data.records;
      }
      const configs = list.map((item: any) => ({
        id: item.configId,
        name: item.configName,
        categories: item.categoryId ? [item.categoryId] : [],
          questionTypes: {
          choice: { count: item.choiceCount, score: item.choiceScore },
          multi: { count: item.multiCount, score: item.multiScore },
          judgment: { count: item.judgmentCount, score: item.judgmentScore }
          },
        duration: item.duration,
        totalScore: item.totalScore
      }));
      setExamConfigs(configs);
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
    const multiTotal = config.questionTypes.multi.count * config.questionTypes.multi.score;
    const judgmentTotal = config.questionTypes.judgment.count * config.questionTypes.judgment.score;
    return choiceTotal + multiTotal + judgmentTotal;
  };

  const [paperGeneratorOpen, setPaperGeneratorOpen] = useState(false);
  const [selectedConfigForPaper, setSelectedConfigForPaper] = useState<ExamConfig | null>(null);

  // 1. 新建配置时，选择题目分类后自动获取题型数量
  const [availableCounts, setAvailableCounts] = useState<{ choice: number; multi: number; judgment: number } | null>(null);
  useEffect(() => {
    const categoryId = newConfig.categories?.[0];
    if (categoryId) {
      request('/admin/categories/get-questions', {
        method: 'POST',
        body: JSON.stringify({ categoryId })
      }).then(res => {
        // 解析data数组
        let choice = 0, multi = 0, judgment = 0;
        const arr = Array.isArray(res.data) ? res.data : [];
        arr.forEach(item => {
          if (item.questionType === 'choice') choice = item.questionCount;
          if (item.questionType === 'multi') multi = item.questionCount;
          if (item.questionType === 'judgment') judgment = item.questionCount;
        });
        setAvailableCounts({ choice, multi, judgment });
        setNewConfig(prev => ({
          ...prev,
          questionTypes: {
            ...prev.questionTypes!,
            choice: {
              ...prev.questionTypes!.choice,
              count: (!prev.questionTypes!.choice.count || prev.questionTypes!.choice.count === 0) ? choice : prev.questionTypes!.choice.count
            },
            multi: {
              ...prev.questionTypes!.multi,
              count: (!prev.questionTypes!.multi.count || prev.questionTypes!.multi.count === 0) ? multi : prev.questionTypes!.multi.count
            },
            judgment: {
              ...prev.questionTypes!.judgment,
              count: (!prev.questionTypes!.judgment.count || prev.questionTypes!.judgment.count === 0) ? judgment : prev.questionTypes!.judgment.count
            }
          }
        }));
      }).catch(() => setAvailableCounts(null));
    } else {
      setAvailableCounts(null);
    }
  }, [newConfig.categories]);

  // 真实API调用 - 添加考试配置
  const handleAddConfig = async () => {
    if (!newConfig.name || !newConfig.categories?.length) {
      toast({
        title: "请填写完整信息",
        description: "考试配置名称和题目分类为必填项",
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
    if (
      availableCounts && (
        newConfig.questionTypes?.choice.count > availableCounts.choice ||
        newConfig.questionTypes?.multi.count > availableCounts.multi ||
        newConfig.questionTypes?.judgment.count > availableCounts.judgment
      )
    ) {
      toast({
        title: "题目数量超出",
        description: "题目数量不能大于可选数量",
        variant: "destructive"
      });
      return;
    }
    setGlobalLoading(true);
    try {
      const body = {
        configName: newConfig.name,
        categoryId: newConfig.categories?.[0],
        duration: newConfig.duration,
        totalScore: 100,
        passScore: 60, // 可根据需要调整
        choiceCount: newConfig.questionTypes?.choice.count,
        multiCount: newConfig.questionTypes?.multi.count,
        judgmentCount: newConfig.questionTypes?.judgment.count,
        choiceScore: 2,
        multiScore: 4,
        judgmentScore: 2,
        remark: '',
      };
      await request('/admin/exam-configs/add', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      toast({
        title: "考试配置创建成功",
        description: `已创建考试配置：${newConfig.name}`
      });
      fetchExamConfigs();
      setNewConfig({
        name: '',
        categories: [],
        questionTypes: {
          choice: { count: 30, score: 2 },
          multi: { count: 0, score: 4 },
          judgment: { count: 20, score: 2 }
        },
        duration: 90,
        totalScore: 100
      });
    } catch (error) {
      console.error('创建考试配置失败:', error);
      toast({
        title: "创建失败",
        description: "创建考试配置失败，请重试",
        variant: "destructive"
      });
    } finally {
      setGlobalLoading(false);
    }
  };

  // 真实API调用 - 删除考试配置
  const handleDeleteConfig = async (configId: string) => {
    setGlobalLoading(true);
    try {
      await request('/admin/exam-configs/delete', {
        method: 'POST',
        body: JSON.stringify({ id: configId })
      });
      toast({
        title: "配置删除成功",
        description: "已删除考试配置"
      });
      fetchExamConfigs();
    } catch (error) {
      console.error('删除考试配置失败:', error);
      toast({
        title: "删除失败",
        description: "删除考试配置失败，请重试",
        variant: "destructive"
      });
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleGeneratePaper = (config: ExamConfig) => {
    setSelectedConfigForPaper(config);
    setPaperGeneratorOpen(true);
  };

  // 编辑考试配置（弹窗/表单可扩展，这里仅示例API调用）
  const handleEditConfig = async (config: ExamConfig) => {
    setGlobalLoading(true);
    try {
      const body = {
        configId: config.id,
        configName: config.name,
        categoryId: config.categories?.[0],
        duration: config.duration,
        totalScore: config.totalScore,
        passScore: 60, // 可根据需要调整
        choiceCount: config.questionTypes.choice.count,
        multiCount: config.questionTypes.multi.count,
        judgmentCount: config.questionTypes.judgment.count,
        choiceScore: 2,
        multiScore: 4,
        judgmentScore: 2,
        remark: '',
      };
      await request('/admin/exam-configs/update', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      toast({
        title: "考试配置已更新",
        description: `已更新考试配置：${config.name}`
      });
      fetchExamConfigs();
    } catch (error) {
      toast({
        title: "编辑失败",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setGlobalLoading(false);
    }
  };

  const [editConfig, setEditConfig] = useState<ExamConfig | null>(null);
  const [editForm, setEditForm] = useState<Partial<ExamConfig> | null>(null);

  const openEditDialog = (config: ExamConfig) => {
    setEditConfig(config);
    setEditForm({ ...config });
  };

  const closeEditDialog = () => {
    setEditConfig(null);
    setEditForm(null);
  };

  const submitEditConfig = async () => {
    if (!editForm?.name || !editForm.categories?.length) {
      toast({
        title: '请填写完整信息',
        description: '考试配置名称和题目分类为必填项',
        variant: 'destructive',
      });
      return;
    }
    const totalScore = calculateTotalScore(editForm);
    if (totalScore !== 100) {
      toast({
        title: '分数配置错误',
        description: '总分必须等于100分',
        variant: 'destructive',
      });
      return;
    }
    await handleEditConfig({ ...editConfig!, ...editForm });
    closeEditDialog();
  };

  const [editAvailableCounts, setEditAvailableCounts] = useState<{ choice: number; multi: number; judgment: number } | null>(null);
  // 监听editForm.categories变化，获取可选数量
  useEffect(() => {
    const categoryId = editForm?.categories?.[0];
    if (categoryId) {
      request('/admin/categories/get-questions', {
        method: 'POST',
        body: JSON.stringify({ categoryId })
      }).then(res => {
        let choice = 0, multi = 0, judgment = 0;
        const arr = Array.isArray(res.data) ? res.data : [];
        arr.forEach(item => {
          if (item.questionType === 'choice') choice = item.questionCount;
          if (item.questionType === 'multi') multi = item.questionCount;
          if (item.questionType === 'judgment') judgment = item.questionCount;
        });
        setEditAvailableCounts({ choice, multi, judgment });
      }).catch(() => setEditAvailableCounts(null));
    } else {
      setEditAvailableCounts(null);
    }
  }, [editForm?.categories]);

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
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
            {/* 新建配置表单 */}
            <div className="lg:col-span-2 flex flex-col h-full">
              <Card className="p-6 flex-1 flex flex-col h-full min-h-[520px]">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">新建考试配置</h3>
                <div className="space-y-4 flex-1">
                <div>
                  <Label>考试配置名称</Label>
                  <Input 
                    value={newConfig.name} 
                    onChange={(e) => setNewConfig({...newConfig, name: e.target.value})}
                    placeholder="请输入考试配置名称"
                  />
                </div>
                <div>
                  <Label>考试题目分类</Label>
                    <Select value={newConfig.categories?.[0] || ''} onValueChange={(value) => setNewConfig({...newConfig, categories: [value]})}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="选择题目分类" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.length > 0 ? (
                          categories.map(([key, value]) => (
                            <SelectItem key={key} value={key}>{value}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>暂无题目分类数据</SelectItem>
                        )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>题型配置</Label>
                    <div className="grid grid-cols-4 gap-1 items-center">
                    <span className="text-sm font-medium">选择题</span>
                      <span className="text-xs text-gray-500">{availableCounts ? `可选数量${availableCounts.choice}` : ''}</span>
                    <Input 
                      type="number" 
                        placeholder="数量"
                        className="w-14 px-2 text-center"
                      value={newConfig.questionTypes?.choice.count}
                      onChange={(e) => setNewConfig({
                        ...newConfig, 
                        questionTypes: {
                          ...newConfig.questionTypes!,
                          choice: { ...newConfig.questionTypes!.choice, count: parseInt(e.target.value) || 0 }
                        }
                      })}
                    />
                      <div className="flex items-center space-x-1 whitespace-nowrap flex-nowrap">
                      <Input 
                        type="number" 
                        placeholder="分值"
                          className="w-14 px-2 text-center"
                        value={2}
                        disabled
                      />
                        <span className="text-sm text-gray-600 whitespace-nowrap">分/题</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1 items-center">
                    <span className="text-sm font-medium">多选题</span>
                      <span className="text-xs text-gray-500">{availableCounts ? `可选数量${availableCounts.multi}` : ''}</span>
                    <Input 
                      type="number" 
                        placeholder="数量"
                        className="w-14 px-2 text-center"
                      value={newConfig.questionTypes?.multi.count}
                      onChange={(e) => setNewConfig({
                        ...newConfig, 
                        questionTypes: {
                          ...newConfig.questionTypes!,
                          multi: { ...newConfig.questionTypes!.multi, count: parseInt(e.target.value) || 0 }
                        }
                      })}
                    />
                      <div className="flex items-center space-x-1 whitespace-nowrap flex-nowrap">
                      <Input 
                        type="number" 
                        placeholder="分值"
                          className="w-14 px-2 text-center"
                        value={4}
                        disabled
                      />
                        <span className="text-sm text-gray-600 whitespace-nowrap">分/题</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1 items-center">
                    <span className="text-sm font-medium">判断题</span>
                      <span className="text-xs text-gray-500">{availableCounts ? `可选数量${availableCounts.judgment}` : ''}</span>
                    <Input 
                      type="number" 
                        placeholder="数量"
                        className="w-14 px-2 text-center"
                      value={newConfig.questionTypes?.judgment.count}
                      onChange={(e) => setNewConfig({
                        ...newConfig, 
                        questionTypes: {
                          ...newConfig.questionTypes!,
                          judgment: { ...newConfig.questionTypes!.judgment, count: parseInt(e.target.value) || 0 }
                        }
                      })}
                    />
                      <div className="flex items-center space-x-1 whitespace-nowrap flex-nowrap">
                      <Input 
                        type="number" 
                        placeholder="分值"
                          className="w-14 px-2 text-center"
                        value={2}
                        disabled
                      />
                        <span className="text-sm text-gray-600 whitespace-nowrap">分/题</span>
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
                </div>
                <Button onClick={handleAddConfig} className="w-full mt-6" disabled={globalLoading}>
                  创建考试配置
                </Button>
              </Card>
              </div>

            {/* 现有配置列表 */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <div className="flex-1 flex items-stretch">
                {/* 左翻页箭头 */}
                <div className="flex items-center pr-2">
                  <Button variant="ghost" size="icon" onClick={() => setConfigPage(p => Math.max(1, p - 1))} disabled={configPage === 1 || globalLoading}>
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                </div>
                {/* 卡片区 */}
                <div className="flex-1">
              {loading ? (
                    <div className="flex justify-center items-center py-8 h-full">
                  <span>加载中...</span>
                </div>
              ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-full text-sm">
                      {examConfigs.slice((configPage-1)*6, configPage*6).map(config => (
                        <Card key={config.id} className="p-6 flex flex-col justify-between min-h-[220px]">
                          <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-medium text-gray-800">{config.name}</h4>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeleteConfig(config.id)}
                              disabled={globalLoading}
                      >
                        删除
                      </Button>
                    </div>
                          <div className="space-y-2 flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">考试题目分类：</span>
                              <span>{config.categories.map(cid => options?.categories?.[cid] || cid).join(', ')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">考试时长：</span>
                        <span>{config.duration}分钟</span>
                      </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <h5 className="text-xs font-medium text-gray-800 mb-1">题型配置：</h5>
                              <div className="space-y-0.5 text-xs">
                          <div className="flex justify-between">
                            <span>选择题：</span>
                            <span>{config.questionTypes.choice.count}题 × {config.questionTypes.choice.score}分 = {config.questionTypes.choice.count * config.questionTypes.choice.score}分</span>
                          </div>
                          <div className="flex justify-between">
                            <span>多选题：</span>
                            <span>{config.questionTypes.multi.count}题 × {config.questionTypes.multi.score}分 = {config.questionTypes.multi.count * config.questionTypes.multi.score}分</span>
                          </div>
                          <div className="flex justify-between">
                            <span>判断题：</span>
                            <span>{config.questionTypes.judgment.count}题 × {config.questionTypes.judgment.score}分 = {config.questionTypes.judgment.count * config.questionTypes.judgment.score}分</span>
                          </div>
                                <hr className="my-1" />
                          <div className="flex justify-between font-medium">
                            <span>总计：</span>
                            <span>{config.totalScore}分</span>
                          </div>
                        </div>
                      </div>
                          </div>
                          <div className="flex justify-center space-x-2 mt-2">
                            <Button size="sm" variant="outline" onClick={() => openEditDialog(config)} disabled={globalLoading}>
                          编辑
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleGeneratePaper(config)}
                              disabled={globalLoading}
                        >
                          生成试卷
                        </Button>
                      </div>
                        </Card>
                      ))}
                      {/* 补足空白占位，保证2行3列布局整齐 */}
                      {Array.from({ length: 6 - (examConfigs.slice((configPage-1)*6, configPage*6).length) }).map((_, i) => (
                        <div key={i} className="invisible" />
                      ))}
                    </div>
                  )}
                </div>
                {/* 右翻页箭头 */}
                <div className="flex items-center pl-2">
                  <Button variant="ghost" size="icon" onClick={() => setConfigPage(p => Math.min(totalConfigPages, p + 1))} disabled={configPage === totalConfigPages || globalLoading}>
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </div>
              </div>
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

      {/* 编辑弹窗 */}
      <Dialog open={!!editConfig} onOpenChange={v => { if (!v) closeEditDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑考试配置</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4">
              <div>
                <Label>考试配置名称</Label>
                <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <Label>考试题目分类</Label>
                <Select value={editForm.categories?.[0] || ''} onValueChange={value => setEditForm({ ...editForm, categories: [value] })}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="选择题目分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>题型配置</Label>
                <div className="grid grid-cols-4 gap-1 items-center">
                  <span className="text-sm font-medium">选择题</span>
                  <span className="text-xs text-gray-500">{editAvailableCounts ? `可选数量${editAvailableCounts.choice}` : ''}</span>
                  <Input 
                    type="number" 
                    placeholder="数量"
                    className="w-14 px-2 text-center"
                    value={editForm.questionTypes?.choice.count}
                    onChange={e => setEditForm({ ...editForm, questionTypes: { ...editForm.questionTypes!, choice: { ...editForm.questionTypes!.choice, count: parseInt(e.target.value) || 0 } } })}
                    disabled={globalLoading}
                  />
                  <div className="flex items-center space-x-1 whitespace-nowrap flex-nowrap">
                    <Input 
                      type="number" 
                      placeholder="分值"
                      className="w-14 px-2 text-center"
                      value={2}
                      disabled
                    />
                    <span className="text-sm text-gray-600 whitespace-nowrap">分/题</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1 items-center">
                  <span className="text-sm font-medium">多选题</span>
                  <span className="text-xs text-gray-500">{editAvailableCounts ? `可选数量${editAvailableCounts.multi}` : ''}</span>
                  <Input 
                    type="number" 
                    placeholder="数量"
                    className="w-14 px-2 text-center"
                    value={editForm.questionTypes?.multi.count}
                    onChange={e => setEditForm({ ...editForm, questionTypes: { ...editForm.questionTypes!, multi: { ...editForm.questionTypes!.multi, count: parseInt(e.target.value) || 0 } } })}
                    disabled={globalLoading}
                  />
                  <div className="flex items-center space-x-1 whitespace-nowrap flex-nowrap">
                    <Input 
                      type="number" 
                      placeholder="分值"
                      className="w-14 px-2 text-center"
                      value={4}
                      disabled
                    />
                    <span className="text-sm text-gray-600 whitespace-nowrap">分/题</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1 items-center">
                  <span className="text-sm font-medium">判断题</span>
                  <span className="text-xs text-gray-500">{editAvailableCounts ? `可选数量${editAvailableCounts.judgment}` : ''}</span>
                  <Input 
                    type="number" 
                    placeholder="数量"
                    className="w-14 px-2 text-center"
                    value={editForm.questionTypes?.judgment.count}
                    onChange={e => setEditForm({ ...editForm, questionTypes: { ...editForm.questionTypes!, judgment: { ...editForm.questionTypes!.judgment, count: parseInt(e.target.value) || 0 } } })}
                    disabled={globalLoading}
                  />
                  <div className="flex items-center space-x-1 whitespace-nowrap flex-nowrap">
                    <Input 
                      type="number" 
                      placeholder="分值"
                      className="w-14 px-2 text-center"
                      value={2}
                      disabled
                    />
                    <span className="text-sm text-gray-600 whitespace-nowrap">分/题</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">
                    计算总分：{calculateTotalScore(editForm)}分
                    {calculateTotalScore(editForm) === 100 ? (
                      <span className="text-green-600 ml-2">✓</span>
                    ) : (
                      <span className="text-red-600 ml-2">✗ 需要等于100分</span>
                    )}
                  </p>
                </div>
              </div>
              <div>
                <Label>考试时长（分钟）</Label>
                <Input type="number" value={editForm.duration} onChange={e => setEditForm({ ...editForm, duration: parseInt(e.target.value) })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={submitEditConfig} className="w-full mt-4" disabled={globalLoading}>保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {globalLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <Loader2 className="w-10 h-10 animate-spin text-white" />
        </div>
      )}
    </div>
  );
};

export default ExamConfigManager;

