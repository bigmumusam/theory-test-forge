import React, { useState, useRef, useEffect } from 'react';
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
import { request } from '@/lib/request';
import { useOptions } from '../../context/OptionsContext';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';

const QuestionBankManager: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);

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

  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editCategoryForm, setEditCategoryForm] = useState<{ name: string; description: string }>({ name: '', description: '' });
  const [tabValue, setTabValue] = useState<'categories' | 'questions'>('categories');

  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [filterType, setFilterType] = useState<'all' | 'choice' | 'multi' | 'judgment'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [filterScoreMin, setFilterScoreMin] = useState('');
  const [filterScoreMax, setFilterScoreMax] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editQuestionForm, setEditQuestionForm] = useState<Partial<Question>>({});

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [addCategoryForm, setAddCategoryForm] = useState({ name: '', description: '' });

  const categoryPageSize = 9;
  const [categoryPage, setCategoryPage] = useState(1);
  const [totalCategoryPages, setTotalCategoryPages] = useState(1);
  const [totalCategoryRows, setTotalCategoryRows] = useState(0);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [questionPage, setQuestionPage] = useState(1);
  const questionPageSize = 10;
  const [totalQuestionPages, setTotalQuestionPages] = useState(1);
  const [totalQuestionRows, setTotalQuestionRows] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const { options } = useOptions();

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: 'single' | 'batch'; id?: string }>(
    { open: false, type: 'single' }
  );

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
    if (!window.confirm(`确定要批量删除选中的${selectedQuestions.length}道题目吗？`)) return;
    setQuestions(qs => qs.filter(q => !selectedQuestions.includes(q.id)));
    setSelectedQuestions([]);
    toast({ title: '批量删除成功' });
  };

  const handleAddCategory = () => {
    setAddCategoryForm({ name: '', description: '' });
    setIsAddCategoryOpen(true);
  };

  const fetchCategories = async (page = 1) => {
    setLoadingCategories(true);
    try {
      const res = await request('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ pageNumber: page, pageSize: categoryPageSize })
      });
      const data = res.data;
      setCategories((data.records || []).map(cat => ({
        categoryId: cat.categoryId || cat.id,
        categoryName: cat.categoryName || cat.name,
        remark: cat.remark,
        questionCount: cat.questionCount,
      })));
      setTotalCategoryPages(data.totalPage || 1);
      setTotalCategoryRows(data.totalRow || 0);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories(1);
  }, []);

  const handleSaveAddCategory = async () => {
    if (!addCategoryForm.name.trim() || !addCategoryForm.description.trim()) {
      toast({ title: '请填写完整信息', variant: 'destructive' });
      return;
    }
    await request('/admin/categories/add', {
      method: 'POST',
      body: JSON.stringify({ categoryName: addCategoryForm.name })
    });
    setIsAddCategoryOpen(false);
    toast({ title: '题目分类添加成功', description: `已添加题目分类：${addCategoryForm.name}` });
    fetchCategories(categoryPage);
  };

  const handleCategoryPageChange = (page: number) => {
    setCategoryPage(page);
    fetchCategories(page);
  };

  const handleSaveEditCategory = async () => {
    if (!editCategoryForm.name.trim() || !editCategoryForm.description.trim()) {
      toast({ title: '请填写完整的题目分类信息', variant: 'destructive' });
      return;
    }
    if (!editingCategory) return;
    try {
      await request('/admin/categories/update', {
        method: 'POST',
        body: JSON.stringify({
          categoryId: editingCategory.categoryId,
          categoryName: editCategoryForm.name,
          remark: editCategoryForm.description,
        }),
      });
      setEditingCategory(null);
      toast({ title: '题目分类更新成功', description: `已更新题目分类：${editCategoryForm.name}` });
      fetchCategories(categoryPage);
    } catch (e) {
      toast({ title: '更新失败', description: String(e), variant: 'destructive' });
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.content || !newQuestion.category) {
      toast({
        title: "请填写完整信息",
        description: "题目内容和题目分类为必填项",
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
      type: newQuestion.type as 'choice' | 'judgment' | 'multi',
      content: newQuestion.content,
      options: newQuestion.type === 'choice' ? newQuestion.options : undefined,
      correctAnswer: newQuestion.correctAnswer!,
      category: newQuestion.category,
      score: newQuestion.score || 2,
      difficulty: newQuestion.difficulty as 'easy' | 'medium' | 'hard'
    };

    setQuestions([...questions, question]);
    
    // 更新题目分类题目数量
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

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm('确定要删除这道题目吗？')) return;
    await request('/admin/questions/delete', {
      method: 'POST',
      body: JSON.stringify({ id: questionId })
    });
    toast({ title: '题目已删除' });
    fetchQuestions(questionPage);
  };

  const handleImportQuestions = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await request('/admin/questions/import', {
        method: 'POST',
        body: formData,
        headers: {}, // 让 fetch 自动设置 multipart/form-data
      });
      if (res.code === 200) {
        toast({
          title: '导入成功',
          description: res.message || '题目已成功导入',
        });
        fetchQuestions(1);
      } else {
        toast({
          title: '导入失败',
          description: res.message || '请检查文件格式',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '导入失败',
        description: String(error),
        variant: 'destructive',
      });
    }
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

  // 颜色列表
  const colorList = [
    'text-blue-600 bg-blue-100',
    'text-green-600 bg-green-100',
    'text-purple-600 bg-purple-100',
    'text-pink-600 bg-pink-100',
    'text-yellow-600 bg-yellow-100',
    'text-orange-600 bg-orange-100',
    'text-teal-600 bg-teal-100',
    'text-indigo-600 bg-indigo-100',
    'text-red-600 bg-red-100',
  ];
  const getCategoryColor = (categoryId: string) => {
    let hash = 0;
    for (let i = 0; i < categoryId.length; i++) {
      hash = categoryId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % colorList.length;
    return colorList[idx];
  };

  const fetchQuestions = async (page = 1) => {
    setLoadingQuestions(true);
    try {
      const params = {
        pageNumber: page,
        pageSize: questionPageSize,
        categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
        questionType: filterType !== 'all' ? filterType : undefined,
        difficulty: filterDifficulty !== 'all' ? filterDifficulty : undefined,
        scoreMin: filterScoreMin || undefined,
        scoreMax: filterScoreMax || undefined,
        keyword: searchKeyword || undefined
      };
      const res = await request('/admin/questions/list', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      const data = res.data;
      setQuestions((data.records || []).map(q => {
        let correctAnswer = q.correctAnswer;
        if (q.questionType === 'choice' && typeof correctAnswer === 'string') {
          correctAnswer = Number(correctAnswer);
        } else if (q.questionType === 'multi' && typeof correctAnswer === 'string') {
          correctAnswer = correctAnswer.split(',').map(s => Number(s));
        }
        return {
        id: q.questionId,
        type: q.questionType,
        content: q.questionContent,
        options: q.questionOptions ? JSON.parse(q.questionOptions) : undefined,
          correctAnswer,
        category: q.categoryId,
        score: q.score,
        difficulty: q.difficulty,
        remark: q.remark
        };
      }));
      setTotalQuestionPages(data.totalPage || 1);
      setTotalQuestionRows(data.totalRow || 0);
      setQuestionPage(data.pageNumber || 1);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchQuestions(1);
  }, [selectedCategory, filterType, filterDifficulty, filterScoreMin, filterScoreMax, searchKeyword]);

  const handleQuestionPageChange = (page: number) => {
    fetchQuestions(page);
  };

  const handleSaveAddQuestion = async () => {
    if (!newQuestion.category) {
      toast({ title: '请选择题目分类', variant: 'destructive' });
      return;
    }
    let correctAnswer = newQuestion.correctAnswer;
    if (newQuestion.type === 'multi' && Array.isArray(correctAnswer)) {
      correctAnswer = correctAnswer.join(',');
    }
    await request('/admin/questions/add', {
      method: 'POST',
      body: JSON.stringify({
        questionType: newQuestion.type,
        questionContent: newQuestion.content,
        questionOptions: newQuestion.options ? JSON.stringify(newQuestion.options) : undefined,
        correctAnswer,
        categoryId: newQuestion.category,
        difficulty: newQuestion.difficulty,
        score: newQuestion.score,
        remark: newQuestion.remark
      })
    });
    setIsDialogOpen(false);
    toast({ title: '题目添加成功' });
    fetchQuestions(questionPage);
  };

  const handleSaveEditQuestion = async () => {
    if (!editQuestionForm.category) {
      toast({ title: '请选择题目分类', variant: 'destructive' });
      return;
    }
    let correctAnswer = editQuestionForm.correctAnswer;
    if (editQuestionForm.type === 'multi' && Array.isArray(correctAnswer)) {
      correctAnswer = correctAnswer.join(',');
    }
    await request('/admin/questions/update', {
      method: 'POST',
      body: JSON.stringify({
        questionId: editingQuestion.id,
        questionType: editQuestionForm.type,
        questionContent: editQuestionForm.content,
        questionOptions: editQuestionForm.options ? JSON.stringify(editQuestionForm.options) : undefined,
        correctAnswer,
        categoryId: editQuestionForm.category,
        difficulty: editQuestionForm.difficulty,
        score: editQuestionForm.score,
        remark: editQuestionForm.remark
      })
    });
    setEditingQuestion(null);
    toast({ title: '题目信息已更新' });
    fetchQuestions(questionPage);
  };

  useEffect(() => {
    if (editingQuestion && editingQuestion.type === 'multi') {
      if (editingQuestion.correctAnswer && typeof editingQuestion.correctAnswer === 'string') {
        setEditQuestionForm(f => ({ ...f, correctAnswer: (editingQuestion.correctAnswer as string).split(',').map(s => Number(s)) }));
      } else {
        setEditQuestionForm(editingQuestion);
      }
    } else if (editingQuestion) {
      setEditQuestionForm(editingQuestion);
    }
  }, [editingQuestion]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">题库管理</h2>
        <div className="flex space-x-3">
          <Button onClick={handleAddCategory} variant="outline">
            添加题目分类
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
                        type: value as 'choice' | 'judgment' | 'multi',
                        options: value === 'choice' || value === 'multi' ? ['', '', '', ''] : undefined,
                        correctAnswer: value === 'choice' ? 0 : value === 'judgment' ? '正确' : []
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="choice">选择题</SelectItem>
                        <SelectItem value="multi">多选题</SelectItem>
                        <SelectItem value="judgment">判断题</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>所属题目分类</Label>
                    <Select 
                      value={newQuestion.category} 
                      onValueChange={value => setNewQuestion({ ...newQuestion, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择题目分类" />
                      </SelectTrigger>
                      <SelectContent>
                        {options?.categories && Object.entries(options.categories).map(([key, value]) => (
                          <SelectItem key={key} value={key}>{value}</SelectItem>
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

                {(newQuestion.type === 'choice' || newQuestion.type === 'multi') && (
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
                          {newQuestion.type === 'choice' ? (
                            <>
                          <input 
                            type="radio" 
                            name="correct" 
                            checked={newQuestion.correctAnswer === index}
                            onChange={() => setNewQuestion({...newQuestion, correctAnswer: index})}
                            className="w-4 h-4"
                          />
                          <label className="text-sm text-gray-600">正确</label>
                            </>
                          ) : (
                            <>
                              <input
                                type="checkbox"
                                checked={Array.isArray(newQuestion.correctAnswer) && newQuestion.correctAnswer.includes(index)}
                                onChange={e => {
                                  let arr = Array.isArray(newQuestion.correctAnswer) ? [...newQuestion.correctAnswer] : [];
                                  if (e.target.checked) arr.push(index);
                                  else arr = arr.filter(i => i !== index);
                                  setNewQuestion({ ...newQuestion, correctAnswer: arr });
                                }}
                                className="w-4 h-4"
                              />
                              <label className="text-sm text-gray-600">正确</label>
                            </>
                          )}
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

                <Button onClick={handleSaveAddQuestion} className="w-full">
                  添加题目
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={tabValue} onValueChange={v => setTabValue(v as 'categories' | 'questions')} className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">题目分类管理</TabsTrigger>
          <TabsTrigger value="questions">题目管理</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(category => {
              const colorClass = getCategoryColor(category.categoryId);
              const textColor = colorClass.split(' ')[0];
              return (
                <Card key={category.categoryId} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`text-lg font-semibold ${textColor}`}>{category.categoryName}</h3>
                    <span className="text-sm px-2 py-1 rounded bg-blue-100 text-blue-800">{category.questionCount}题</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{category.remark || ''}</p>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setSelectedCategory(category.categoryId);
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
                      setEditCategoryForm({ name: category.categoryName, description: category.remark });
                    }}>
                      编辑
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
          {/* 题目分类分页 */}
          {tabValue === 'categories' && (
            <div className="mt-6 flex flex-row justify-between items-center flex-nowrap gap-4">
              <p className="text-sm text-gray-600 whitespace-nowrap">
                显示 {(categoryPage - 1) * categoryPageSize + 1} 到 {Math.min(categoryPage * categoryPageSize, totalCategoryRows)} 条，共 {totalCategoryRows} 条记录
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <button
                      onClick={() => handleCategoryPageChange(Math.max(1, categoryPage - 1))}
                      className={"text-sm px-3 py-1 rounded border mr-1 " + (categoryPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer')}
                      disabled={categoryPage === 1}
                    >上一页</button>
                  </PaginationItem>
                  {Array.from({ length: totalCategoryPages }, (_, i) => i + 1).map(page => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handleCategoryPageChange(page)}
                        isActive={categoryPage === page}
                        className="text-sm cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <button
                      onClick={() => handleCategoryPageChange(Math.min(totalCategoryPages, categoryPage + 1))}
                      className={"text-sm px-3 py-1 rounded border ml-1 " + (categoryPage === totalCategoryPages ? 'pointer-events-none opacity-50' : 'cursor-pointer')}
                      disabled={categoryPage === totalCategoryPages}
                    >下一页</button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
          </div>
          )}
        </TabsContent>

        <TabsContent value="questions">
          <div id="question-list-section" className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center mb-2">
              <Select value={selectedCategory} onValueChange={value => { setSelectedCategory(value); setPage(1); }}>
                <SelectTrigger className="w-40"><SelectValue placeholder="选择题目分类筛选" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部题目分类</SelectItem>
                  {options?.categories && Object.entries(options.categories).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={v => setFilterType(v as any)}>
                <SelectTrigger className="w-32"><SelectValue placeholder="题型" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部题型</SelectItem>
                  <SelectItem value="choice">选择题</SelectItem>
                  <SelectItem value="multi">多选题</SelectItem>
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
            {/* <div className="flex justify-center items-center space-x-4 mt-6">
              <span className="text-sm text-gray-600 mr-4">共 {filteredQuestions.length} 题，当前第 {page}/{totalPages || 1} 页</span>
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>上一页</Button>
              <Button variant="outline" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>下一页</Button>
            </div> */}
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  {selectedCategory !== 'all'
                    ? `${options?.categories?.[selectedCategory] || selectedCategory}题目分类暂无题目`
                    : '题库中暂无题目'}
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>添加第一道题目</Button>
              </div>
            ) : (
              <>
                <div className="flex items-center mb-2">
                  <input type="checkbox" checked={isAllCurrentPageSelected} onChange={toggleSelectAllCurrentPage} className="mr-2" />
                  <span>本页全选</span>
                  {selectedQuestions.length > 0 && (
                    <Button variant="destructive" size="sm" className="ml-4" onClick={() => setDeleteDialog({ open: true, type: 'batch' })}>批量删除（{selectedQuestions.length}）</Button>
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
                            <span className={`px-2 py-1 text-xs rounded ${question.type === 'choice' ? 'bg-blue-100 text-blue-800' : question.type === 'multi' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>{question.type === 'choice' ? '选择题' : question.type === 'multi' ? '多选题' : '判断题'}</span>
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                              {options?.categories?.[question.category] || question.category}
                            </span>
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
                              <div key={index} className={`flex items-center space-x-2 p-2 rounded border ${question.correctAnswer === index ? 'bg-green-50 border-green-400 text-green-800 font-bold' : 'bg-gray-50 border-transparent'}`}>
                                <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                                <span>{option}</span>
                                {question.correctAnswer === index && <span className="text-green-600 text-sm ml-auto font-bold">✓ 正确答案</span>}
                              </div>
                            ))}
                          </div>
                        )}
                        {question.type === 'multi' && (
                          <div className="flex flex-col gap-2 mt-2">
                            {question.options?.map((option, index) => (
                              <div key={index} className={`flex items-center space-x-2 p-2 rounded border ${Array.isArray(question.correctAnswer) && question.correctAnswer.includes(index) ? 'bg-green-50 border-green-400 text-green-800 font-bold' : 'bg-gray-50 border-transparent'}`}>
                                <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                                <span>{option}</span>
                                {Array.isArray(question.correctAnswer) && question.correctAnswer.includes(index) && <span className="text-green-600 text-sm ml-auto font-bold">✓ 正确答案</span>}
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
                            let options = question.options;
                            if (typeof options === 'string') {
                              try {
                                options = JSON.parse(options);
                              } catch {
                                options = ['', '', '', ''];
                              }
                            }
                            if (question.type === 'multi') {
                              let correctArr = question.correctAnswer;
                              if (typeof correctArr === 'string') {
                                correctArr = correctArr.split(',').map(s => Number(s));
                              } else if (!Array.isArray(correctArr)) {
                                correctArr = [];
                              }
                              setEditQuestionForm({ ...question, options, correctAnswer: correctArr });
                            } else if (question.type === 'choice') {
                              setEditQuestionForm({ ...question, options, correctAnswer: Number(question.correctAnswer) });
                            } else {
                              setEditQuestionForm({ ...question, options });
                            }
                          }}>编辑</Button>
                          <Button size="sm" variant="destructive" onClick={() => setDeleteDialog({ open: true, type: 'single', id: question.id })}>删除</Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </>
            )}
            {/* 题库分页 */}
            {tabValue === 'questions' && totalQuestionRows > 0 && (
              <div className="mt-6 flex flex-row justify-between items-center flex-nowrap gap-4">
                <p className="text-sm text-gray-600 whitespace-nowrap">
                  显示 {(questionPage - 1) * questionPageSize + 1} 到 {Math.min(questionPage * questionPageSize, totalQuestionRows)} 条，共 {totalQuestionRows} 条记录
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <button
                        onClick={() => handleQuestionPageChange(Math.max(1, questionPage - 1))}
                        className={"text-sm px-3 py-1 rounded border mr-1 " + (questionPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer')}
                        disabled={questionPage === 1}
                      >上一页</button>
                    </PaginationItem>
                    {Array.from({ length: totalQuestionPages }, (_, i) => i + 1).map(p => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          onClick={() => handleQuestionPageChange(p)}
                          isActive={questionPage === p}
                          className="text-sm cursor-pointer"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <button
                        onClick={() => handleQuestionPageChange(Math.min(totalQuestionPages, questionPage + 1))}
                        className={"text-sm px-3 py-1 rounded border ml-1 " + (questionPage === totalQuestionPages ? 'pointer-events-none opacity-50' : 'cursor-pointer')}
                        disabled={questionPage === totalQuestionPages}
                      >下一页</button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
            </div>
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
                        onValueChange={value => setEditQuestionForm(f => ({ ...f, type: value as 'choice' | 'judgment' | 'multi', correctAnswer: value === 'choice' ? 0 : value === 'judgment' ? '正确' : [] }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="choice">选择题</SelectItem>
                          <SelectItem value="multi">多选题</SelectItem>
                          <SelectItem value="judgment">判断题</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>所属题目分类</Label>
                      <Select 
                        value={editQuestionForm.category} 
                        onValueChange={value => setEditQuestionForm(f => ({ ...f, category: value }))}
                      >
                        <SelectTrigger><SelectValue placeholder="选择题目分类" /></SelectTrigger>
                        <SelectContent>
                          {options?.categories && Object.entries(options.categories).map(([key, value]) => (
                            <SelectItem key={key} value={key}>{value}</SelectItem>
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
                  {editQuestionForm.type === 'multi' && (
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
                              type="checkbox"
                              checked={Array.isArray(editQuestionForm.correctAnswer) && editQuestionForm.correctAnswer.includes(index)}
                              onChange={e => {
                                let arr = Array.isArray(editQuestionForm.correctAnswer) ? [...editQuestionForm.correctAnswer] : [];
                                if (e.target.checked) arr.push(index);
                                else arr = arr.filter(i => i !== index);
                                setEditQuestionForm(f => ({ ...f, correctAnswer: arr }));
                              }}
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
                  <Button onClick={handleSaveEditQuestion} className="w-full">保存</Button>
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
        templateDownloadUrl="/templates/题目导入模版.xlsx"
      />

      <Dialog open={!!editingCategory} onOpenChange={(open) => { if (!open) setEditingCategory(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑题目分类</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>题目分类名称</Label>
              <Input value={editCategoryForm.name} onChange={e => setEditCategoryForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>题目分类描述</Label>
              <Textarea value={editCategoryForm.description} onChange={e => setEditCategoryForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <Button onClick={handleSaveEditCategory} className="w-full">保存</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>添加题目分类</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>题目分类名称</Label>
              <Input value={addCategoryForm.name} onChange={e => setAddCategoryForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>题目分类描述</Label>
              <Textarea value={addCategoryForm.description} onChange={e => setAddCategoryForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <Button onClick={handleSaveAddCategory} className="w-full">保存</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialog.open} onOpenChange={open => setDeleteDialog(d => ({ ...d, open }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-lg">
            {deleteDialog.type === 'single'
              ? '确定要删除这道题目吗？'
              : `确定要批量删除选中的${selectedQuestions.length}道题目吗？`}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDeleteDialog(d => ({ ...d, open: false }))}>取消</Button>
            <Button variant="destructive" onClick={async () => {
              if (deleteDialog.type === 'single' && deleteDialog.id) {
                await request('/admin/questions/delete', {
                  method: 'POST',
                  body: JSON.stringify({ id: deleteDialog.id })
                });
                toast({ title: '题目已删除' });
                fetchQuestions(questionPage);
              } else if (deleteDialog.type === 'batch') {
                await request('/admin/questions/batchDelete', {
                  method: 'POST',
                  body: JSON.stringify({ questionIds: selectedQuestions })
                });
                setSelectedQuestions([]);
                toast({ title: '批量删除成功' });
                fetchQuestions(questionPage);
              }
              setDeleteDialog(d => ({ ...d, open: false }));
            }}>确认删除</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionBankManager;
