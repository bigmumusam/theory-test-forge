import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';
import { Question, Category } from '../../types/exam';
import ImportDialog from './ImportDialog';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const QuestionBankManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: '消化内科', description: '消化系统疾病相关知识', questionCount: 2 },
    { id: '2', name: '肝胆外科', description: '肝胆外科手术及诊疗', questionCount: 1 },
    { id: '3', name: '心血管内科', description: '心血管疾病诊断治疗', questionCount: 0 },
    { id: '4', name: '呼吸内科', description: '呼吸系统疾病管理', questionCount: 0 },
  ]);

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      type: 'choice',
      content: '胃溃疡最常见的并发症是？',
      options: ['穿孔', '出血', '幽门梗阻', '癌变'],
      correctAnswer: 1,
      category: '消化内科',
      score: 2,
      difficulty: 'medium'
    },
    {
      id: '2',
      type: 'judgment',
      content: '胆囊炎患者应避免高脂饮食。',
      correctAnswer: '正确',
      category: '消化内科',
      score: 1,
      difficulty: 'easy'
    },
    {
      id: '3',
      type: 'choice',
      content: '胆囊结石的典型症状是？',
      options: ['右上腹疼痛', '左上腹疼痛', '脐周疼痛', '下腹疼痛'],
      correctAnswer: 0,
      category: '肝胆外科',
      score: 2,
      difficulty: 'medium'
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    type: 'choice',
    content: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    category: '',
    score: 2,
    difficulty: 'medium'
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const { toast } = useToast();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryForm, setEditCategoryForm] = useState<{ name: string; description: string }>({ name: '', description: '' });
  const [tabValue, setTabValue] = useState<'categories' | 'questions'>('categories');

  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [filterType, setFilterType] = useState<'all' | 'choice' | 'judgment'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [filterScoreMin, setFilterScoreMin] = useState('');
  const [filterScoreMax, setFilterScoreMax] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editQuestionForm, setEditQuestionForm] = useState<Partial<Question>>({});

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const filteredQuestions = questions.filter(q =>
    (selectedCategory === 'all' || q.category === selectedCategory) &&
    (!searchKeyword || q.content.includes(searchKeyword)) &&
    (filterType === 'all' || q.type === filterType) &&
    (filterDifficulty === 'all' || q.difficulty === filterDifficulty) &&
    (!filterScoreMin || q.score >= Number(filterScoreMin)) &&
    (!filterScoreMax || q.score <= Number(filterScoreMax))
  );
  const totalPages = Math.ceil(filteredQuestions.length / pageSize);
  const pagedQuestions = filteredQuestions.slice((page - 1) * pageSize, page * pageSize);

  const allCurrentPageIds = pagedQuestions.map(q => q.id);
  const isAllCurrentPageSelected = allCurrentPageIds.every(id => selectedQuestions.includes(id));
  const toggleSelectAllCurrentPage = () => {
    if (isAllCurrentPageSelected) {
      setSelectedQuestions(selectedQuestions.filter(id => !allCurrentPageIds.includes(id)));
    } else {
      setSelectedQuestions([...new Set([...selectedQuestions, ...allCurrentPageIds])]);
    }
  };
  const handleSelectQuestion = (id: string) => {
    setSelectedQuestions(selectedQuestions =>
      selectedQuestions.includes(id)
        ? selectedQuestions.filter(qid => qid !== id)
        : [...selectedQuestions, id]
    );
  };
  const handleBatchDelete = () => {
    if (selectedQuestions.length === 0) return;
    if (window.confirm(`确定要批量删除选中的${selectedQuestions.length}道题目吗？`)) {
      setQuestions(qs => qs.filter(q => !selectedQuestions.includes(q.id)));
      setSelectedQuestions([]);
      toast({ title: '批量删除成功' });
    }
  };

  const handleAddCategory = () => {
    const name = prompt('请输入科室名称：');
    const description = prompt('请输入科室描述：');
    
    if (name && description) {
      const newCategory: Category = {
        id: Date.now().toString(),
        name,
        description,
        questionCount: 0
      };
      setCategories([...categories, newCategory]);
      toast({
        title: "科室添加成功",
        description: `已添加科室：${name}`
      });
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.content || !newQuestion.category) {
      toast({
        title: "请填写完整信息",
        description: "题目内容和科室为必填项",
        variant: "destructive"
      });
      return;
    }

    // 检查选择题是否填写了所有选项
    if (newQuestion.type === 'choice') {
      const hasEmptyOptions = newQuestion.options?.some(option => !option.trim());
      if (hasEmptyOptions) {
        toast({
          title: "请填写完整信息",
          description: "选择题的所有选项都必须填写",
          variant: "destructive"
        });
        return;
      }
    }

    const question: Question = {
      id: Date.now().toString(),
      type: newQuestion.type as 'choice' | 'judgment',
      content: newQuestion.content,
      options: newQuestion.type === 'choice' ? newQuestion.options : undefined,
      correctAnswer: newQuestion.correctAnswer!,
      category: newQuestion.category,
      score: newQuestion.score || 2,
      difficulty: newQuestion.difficulty as 'easy' | 'medium' | 'hard'
    };

    setQuestions([...questions, question]);
    
    // 更新科室题目数量
    setCategories(categories.map(cat => 
      cat.name === question.category 
        ? { ...cat, questionCount: cat.questionCount + 1 }
        : cat
    ));

    // 重置表单
    setNewQuestion({
      type: 'choice',
      content: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      category: '',
      score: 2,
      difficulty: 'medium'
    });

    // 关闭对话框
    setIsDialogOpen(false);

    toast({
      title: "题目添加成功",
      description: "新题目已添加到题库"
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      if (window.confirm('确定要删除这道题目吗？')) {
        setQuestions(questions.filter(q => q.id !== questionId));
        
        // 更新科室题目数量
        setCategories(categories.map(cat => 
          cat.name === question.category 
            ? { ...cat, questionCount: cat.questionCount - 1 }
            : cat
        ));

        toast({
          title: "题目删除成功",
          description: "已从题库中删除该题目"
        });
      }
    }
  };

  const handleImportQuestions = (file: File) => {
    // 模拟导入处理
    console.log('导入题目文件:', file.name);
    
    // 模拟添加导入的题目
    const importedQuestions: Question[] = [
      {
        id: Date.now().toString(),
        type: 'choice',
        content: '导入的选择题示例',
        options: ['选项A', '选项B', '选项C', '选项D'],
        correctAnswer: 0,
        category: '消化内科',
        score: 2,
        difficulty: 'medium'
      },
      {
        id: (Date.now() + 1).toString(),
        type: 'judgment',
        content: '导入的判断题示例',
        correctAnswer: '正确',
        category: '消化内科',
        score: 1,
        difficulty: 'easy'
      }
    ];
    
    setQuestions([...questions, ...importedQuestions]);
    
    // 更新科室题目数量
    const categoryUpdates = {};
    importedQuestions.forEach(q => {
      categoryUpdates[q.category] = (categoryUpdates[q.category] || 0) + 1;
    });
    
    setCategories(categories.map(cat => ({
      ...cat,
      questionCount: cat.questionCount + (categoryUpdates[cat.name] || 0)
    })));
    
    toast({
      title: "导入成功",
      description: `成功导入 ${importedQuestions.length} 道题目`
    });
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      default: return '中等';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">题库管理</h2>
        <div className="flex space-x-3">
          <Button onClick={handleAddCategory} variant="outline">
            添加科室
          </Button>
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            导入题目
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>添加题目</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>添加新题目</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>题目类型</Label>
                    <Select 
                      value={newQuestion.type} 
                      onValueChange={(value) => setNewQuestion({
                        ...newQuestion, 
                        type: value as 'choice' | 'judgment',
                        correctAnswer: value === 'choice' ? 0 : '正确'
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="choice">选择题</SelectItem>
                        <SelectItem value="judgment">判断题</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>所属科室</Label>
                    <Select 
                      value={newQuestion.category} 
                      onValueChange={(value) => setNewQuestion({...newQuestion, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择科室" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>题目内容</Label>
                  <Textarea 
                    value={newQuestion.content} 
                    onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})}
                    placeholder="请输入题目内容"
                    rows={3}
                  />
                </div>

                {newQuestion.type === 'choice' && (
                  <div>
                    <Label>选项设置</Label>
                    <div className="space-y-2">
                      {newQuestion.options?.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="w-8 text-center font-medium">{String.fromCharCode(65 + index)}.</span>
                          <Input 
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(newQuestion.options || [])];
                              newOptions[index] = e.target.value;
                              setNewQuestion({...newQuestion, options: newOptions});
                            }}
                            placeholder={`选项${String.fromCharCode(65 + index)}`}
                            className="flex-1"
                          />
                          <input 
                            type="radio" 
                            name="correct" 
                            checked={newQuestion.correctAnswer === index}
                            onChange={() => setNewQuestion({...newQuestion, correctAnswer: index})}
                            className="w-4 h-4"
                          />
                          <label className="text-sm text-gray-600">正确</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {newQuestion.type === 'judgment' && (
                  <div>
                    <Label>正确答案</Label>
                    <Select 
                      value={newQuestion.correctAnswer as string} 
                      onValueChange={(value) => setNewQuestion({...newQuestion, correctAnswer: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="正确">正确</SelectItem>
                        <SelectItem value="错误">错误</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>分值</Label>
                    <Input 
                      type="number" 
                      value={newQuestion.score} 
                      onChange={(e) => setNewQuestion({...newQuestion, score: parseInt(e.target.value)})}
                      min="1" 
                      max="10"
                    />
                  </div>
                  <div>
                    <Label>难度</Label>
                    <Select 
                      value={newQuestion.difficulty} 
                      onValueChange={(value) => setNewQuestion({...newQuestion, difficulty: value as 'easy' | 'medium' | 'hard'})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">简单</SelectItem>
                        <SelectItem value="medium">中等</SelectItem>
                        <SelectItem value="hard">困难</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleAddQuestion} className="w-full">
                  添加题目
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={tabValue} onValueChange={v => setTabValue(v as 'categories' | 'questions')} className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">科室管理</TabsTrigger>
          <TabsTrigger value="questions">题目管理</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(category => (
              <Card key={category.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                  <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                    {category.questionCount}题
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setSelectedCategory(category.name);
                      setTabValue('questions');
                      setTimeout(() => {
                        const questionList = document.getElementById('question-list-section');
                        if (questionList) questionList.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 200);
                    }}
                  >
                    查看题目
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditingCategory(category);
                    setEditCategoryForm({ name: category.name, description: category.description });
                  }}>
                    编辑
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="questions">
          <div id="question-list-section" className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center mb-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40"><SelectValue placeholder="选择科室筛选" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部科室</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={v => setFilterType(v as any)}>
                <SelectTrigger className="w-32"><SelectValue placeholder="题型" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部题型</SelectItem>
                  <SelectItem value="choice">选择题</SelectItem>
                  <SelectItem value="judgment">判断题</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterDifficulty} onValueChange={v => setFilterDifficulty(v as any)}>
                <SelectTrigger className="w-32"><SelectValue placeholder="难度" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部难度</SelectItem>
                  <SelectItem value="easy">简单</SelectItem>
                  <SelectItem value="medium">中等</SelectItem>
                  <SelectItem value="hard">困难</SelectItem>
                </SelectContent>
              </Select>
              <Input className="w-20" type="number" min={0} placeholder="分数≥" value={filterScoreMin} onChange={e => setFilterScoreMin(e.target.value)} />
              <Input className="w-20" type="number" min={0} placeholder="分数≤" value={filterScoreMax} onChange={e => setFilterScoreMax(e.target.value)} />
              <Input className="w-64" placeholder="输入题目关键词查询" value={searchKeyword} onChange={e => { setSearchKeyword(e.target.value); setPage(1); }} />
              {selectedCategory !== 'all' && <Button variant="outline" onClick={() => setSelectedCategory('all')}>清除筛选</Button>}
            </div>
            <p className="text-sm text-gray-600">共 {filteredQuestions.length} 题，当前第 {page}/{totalPages || 1} 页</p>
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">{selectedCategory !== 'all' ? `${selectedCategory}科室暂无题目` : '题库中暂无题目'}</p>
                <Button onClick={() => setIsDialogOpen(true)}>添加第一道题目</Button>
              </div>
            ) : (
              <>
                <div className="flex items-center mb-2">
                  <input type="checkbox" checked={isAllCurrentPageSelected} onChange={toggleSelectAllCurrentPage} className="mr-2" />
                  <span>本页全选</span>
                  {selectedQuestions.length > 0 && (
                    <Button variant="destructive" size="sm" className="ml-4" onClick={handleBatchDelete}>批量删除（{selectedQuestions.length}）</Button>
                  )}
                </div>
                <Accordion type="multiple" className="space-y-2">
                  {pagedQuestions.map(question => (
                    <AccordionItem key={question.id} value={question.id}>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(question.id)}
                          onChange={() => handleSelectQuestion(question.id)}
                          className="mr-2"
                        />
                        <AccordionTrigger className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 text-xs rounded ${question.type === 'choice' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{question.type === 'choice' ? '选择题' : '判断题'}</span>
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">{question.category}</span>
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">{question.score}分</span>
                            <span className={`px-2 py-1 text-xs rounded ${getDifficultyColor(question.difficulty)}`}>{getDifficultyText(question.difficulty)}</span>
                            <span className="ml-2 text-base text-gray-800 font-medium">{question.content}</span>
                          </div>
                        </AccordionTrigger>
                      </div>
                      <AccordionContent>
                        {question.type === 'choice' && question.options && (
                          <div className="space-y-2 mt-2">
                            {question.options.map((option, index) => (
                              <div key={index} className={`flex items-center space-x-2 p-2 rounded ${question.correctAnswer === index ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                                <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                                <span>{option}</span>
                                {question.correctAnswer === index && <span className="text-green-600 text-sm ml-auto">✓ 正确答案</span>}
                              </div>
                            ))}
                          </div>
                        )}
                        {question.type === 'judgment' && (
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-gray-600">正确答案：</span>
                            <span className={`px-3 py-1 rounded text-sm ${question.correctAnswer === '正确' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{question.correctAnswer}</span>
                          </div>
                        )}
                        <div className="flex space-x-2 mt-4">
                          <Button size="sm" variant="outline" onClick={() => {
                            setEditingQuestion(question);
                            setEditQuestionForm({ ...question });
                          }}>编辑</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteQuestion(question.id)}>删除</Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                <div className="flex justify-center items-center space-x-4 mt-6">
                  <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>上一页</Button>
                  <span>第 {page} / {totalPages || 1} 页</span>
                  <Button variant="outline" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>下一页</Button>
                </div>
              </>
            )}
            <Dialog open={!!editingQuestion} onOpenChange={open => { if (!open) setEditingQuestion(null); }}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>编辑题目</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>题目类型</Label>
                      <Select 
                        value={editQuestionForm.type as string} 
                        onValueChange={value => setEditQuestionForm(f => ({ ...f, type: value as 'choice' | 'judgment', correctAnswer: value === 'choice' ? 0 : '正确' }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="choice">选择题</SelectItem>
                          <SelectItem value="judgment">判断题</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>所属科室</Label>
                      <Select 
                        value={editQuestionForm.category as string} 
                        onValueChange={value => setEditQuestionForm(f => ({ ...f, category: value }))}
                      >
                        <SelectTrigger><SelectValue placeholder="选择科室" /></SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>题目内容</Label>
                    <Textarea 
                      value={editQuestionForm.content} 
                      onChange={e => setEditQuestionForm(f => ({ ...f, content: e.target.value }))}
                      placeholder="请输入题目内容"
                      rows={3}
                    />
                  </div>
                  {editQuestionForm.type === 'choice' && (
                    <div>
                      <Label>选项设置</Label>
                      <div className="space-y-2">
                        {(editQuestionForm.options || ['', '', '', '']).map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <span className="w-8 text-center font-medium">{String.fromCharCode(65 + index)}.</span>
                            <Input 
                              value={option}
                              onChange={e => {
                                const newOptions = [...(editQuestionForm.options || ['', '', '', ''])];
                                newOptions[index] = e.target.value;
                                setEditQuestionForm(f => ({ ...f, options: newOptions }));
                              }}
                              placeholder={`选项${String.fromCharCode(65 + index)}`}
                              className="flex-1"
                            />
                            <input 
                              type="radio" 
                              name="edit-correct" 
                              checked={editQuestionForm.correctAnswer === index}
                              onChange={() => setEditQuestionForm(f => ({ ...f, correctAnswer: index }))}
                              className="w-4 h-4"
                            />
                            <label className="text-sm text-gray-600">正确</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {editQuestionForm.type === 'judgment' && (
                    <div>
                      <Label>正确答案</Label>
                      <Select 
                        value={editQuestionForm.correctAnswer as string} 
                        onValueChange={value => setEditQuestionForm(f => ({ ...f, correctAnswer: value }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="正确">正确</SelectItem>
                          <SelectItem value="错误">错误</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>分值</Label>
                      <Input 
                        type="number" 
                        value={editQuestionForm.score} 
                        onChange={e => setEditQuestionForm(f => ({ ...f, score: parseInt(e.target.value) }))}
                        min="1" 
                        max="10"
                      />
                    </div>
                    <div>
                      <Label>难度</Label>
                      <Select 
                        value={editQuestionForm.difficulty as string} 
                        onValueChange={value => setEditQuestionForm(f => ({ ...f, difficulty: value as 'easy' | 'medium' | 'hard' }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">简单</SelectItem>
                          <SelectItem value="medium">中等</SelectItem>
                          <SelectItem value="hard">困难</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={() => {
                    if (!editQuestionForm.content || !editQuestionForm.category) {
                      toast({ title: '请填写完整信息', variant: 'destructive' });
                      return;
                    }
                    if (editQuestionForm.type === 'choice') {
                      const hasEmptyOptions = (editQuestionForm.options || []).some(option => !option.trim());
                      if (hasEmptyOptions) {
                        toast({ title: '请填写完整信息', description: '选择题的所有选项都必须填写', variant: 'destructive' });
                        return;
                      }
                    }
                    setQuestions(qs => qs.map(q => q.id === editingQuestion!.id ? { ...q, ...editQuestionForm } as Question : q));
                    setEditingQuestion(null);
                    toast({ title: '题目已更新' });
                  }} className="w-full">保存</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>
      </Tabs>

      <ImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="导入题目"
        onImport={handleImportQuestions}
        templateDownloadUrl="/templates/question_template.xlsx"
      />

      <Dialog open={!!editingCategory} onOpenChange={(open) => { if (!open) setEditingCategory(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑科室</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>科室名称</Label>
              <Input value={editCategoryForm.name} onChange={e => setEditCategoryForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>科室描述</Label>
              <Textarea value={editCategoryForm.description} onChange={e => setEditCategoryForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <Button onClick={() => {
              if (!editCategoryForm.name.trim() || !editCategoryForm.description.trim()) {
                toast({ title: '请填写完整信息', variant: 'destructive' });
                return;
              }
              setCategories(cats => cats.map(cat => cat.id === editingCategory!.id ? { ...cat, name: editCategoryForm.name, description: editCategoryForm.description } : cat));
              setEditingCategory(null);
              toast({ title: '科室信息已更新' });
            }} className="w-full">保存</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionBankManager;
