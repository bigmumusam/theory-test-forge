
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Question, Category } from '../../types/exam';

const QuestionBankManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: '消化内科', description: '消化系统疾病相关知识', questionCount: 356 },
    { id: '2', name: '肝胆外科', description: '肝胆外科手术及诊疗', questionCount: 298 },
    { id: '3', name: '心血管内科', description: '心血管疾病诊断治疗', questionCount: 234 },
    { id: '4', name: '呼吸内科', description: '呼吸系统疾病管理', questionCount: 189 },
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
      category: '肝胆外科',
      score: 1,
      difficulty: 'easy'
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    type: 'choice',
    content: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    category: '',
    score: 2,
    difficulty: 'medium'
  });

  const { toast } = useToast();

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

    toast({
      title: "题目添加成功",
      description: "新题目已添加到题库"
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
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
  };

  const filteredQuestions = selectedCategory 
    ? questions.filter(q => q.category === selectedCategory)
    : questions;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">题库管理</h2>
        <div className="flex space-x-3">
          <Button onClick={handleAddCategory} variant="outline">
            添加科室
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>添加题目</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>添加新题目</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>题目类型</Label>
                    <Select 
                      value={newQuestion.type} 
                      onValueChange={(value) => setNewQuestion({...newQuestion, type: value as 'choice' | 'judgment'})}
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
                          <span className="w-8 text-center">{String.fromCharCode(65 + index)}.</span>
                          <Input 
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(newQuestion.options || [])];
                              newOptions[index] = e.target.value;
                              setNewQuestion({...newQuestion, options: newOptions});
                            }}
                            placeholder={`选项${String.fromCharCode(65 + index)}`}
                          />
                          <input 
                            type="radio" 
                            name="correct" 
                            checked={newQuestion.correctAnswer === index}
                            onChange={() => setNewQuestion({...newQuestion, correctAnswer: index})}
                          />
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

      <Tabs defaultValue="categories" className="space-y-4">
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
                  <Button size="sm" variant="outline" onClick={() => setSelectedCategory(category.name)}>
                    查看题目
                  </Button>
                  <Button size="sm" variant="outline">
                    编辑
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="questions">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="选择科室筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">全部科室</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategory && (
                  <Button variant="outline" onClick={() => setSelectedCategory('')}>
                    清除筛选
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-600">
                显示 {filteredQuestions.length} 个题目
              </p>
            </div>

            <div className="space-y-4">
              {filteredQuestions.map(question => (
                <Card key={question.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`px-2 py-1 text-xs rounded ${
                          question.type === 'choice' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {question.type === 'choice' ? '选择题' : '判断题'}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                          {question.category}
                        </span>
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                          {question.score}分
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-medium text-gray-800 mb-3">{question.content}</h4>
                      
                      {question.type === 'choice' && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option, index) => (
                            <div key={index} className={`flex items-center space-x-2 p-2 rounded ${
                              question.correctAnswer === index ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                            }`}>
                              <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                              <span>{option}</span>
                              {question.correctAnswer === index && (
                                <span className="text-green-600 text-sm ml-auto">✓ 正确答案</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'judgment' && (
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-600">正确答案：</span>
                          <span className={`px-3 py-1 rounded text-sm ${
                            question.correctAnswer === '正确' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {question.correctAnswer}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex flex-col space-y-2">
                      <Button size="sm" variant="outline">
                        编辑
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuestionBankManager;
