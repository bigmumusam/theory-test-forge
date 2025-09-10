import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { ExamPaperListItem } from '@/types/exam';
import { post } from '@/lib/request';
import { RefreshCw } from 'lucide-react';

interface PreviewExamPaperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paper: ExamPaperListItem;
  readOnly?: boolean;
}

interface PaperQuestion {
  questionId: string;
  questionOrder: number;
  questionType: string;
  questionContent: string;
  score: number;
  options?: string[];
}

const PreviewExamPaperDialog: React.FC<PreviewExamPaperDialogProps> = ({ open, onOpenChange, paper }) => {
  const [questions, setQuestions] = useState<PaperQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && paper) {
      setLoading(true);
      post('/admin/generated-papers/findQuestionsById', { paperId: paper.paperId })
        .then(res => {
          setQuestions(res.data || []);
        })
        .catch(() => setQuestions([]))
        .finally(() => setLoading(false));
    } else {
      setQuestions([]);
    }
  }, [open, paper]);

  if (!paper) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[66vw] h-[66vh] max-h-[66vh] overflow-y-auto flex flex-col justify-between">
        <DialogHeader>
          <DialogTitle>试卷预览 - {paper.paperName}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* 配置信息 */}
          <Card className="p-4 h-full flex flex-col justify-between">
            <h3 className="text-lg font-semibold mb-4">试卷信息</h3>
            <div className="space-y-3 text-sm flex-1">
              <div className="flex justify-between">
                <span className="text-gray-600">试卷名称：</span>
                <span>{paper.paperName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">题目分类：</span>
                <span>{paper.categoryName}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 whitespace-nowrap">人员类别：</span>
                <span className="text-blue-600 font-medium ml-2 break-words">
                  {paper.userCategories || '指挥管理军官'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">时长：</span>
                <span>{paper.duration}分钟</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">题目数量：</span>
                <span>{paper.totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">总分：</span>
                <span>{paper.totalScore}分</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">状态：</span>
                <span>{paper.status === '1' ? '启用' : '停用'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">创建人：</span>
                <span>{paper.createBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">创建时间：</span>
                <span>{paper.createTime}</span>
              </div>
            </div>
          </Card>
          {/* 题目列表 */}
          <Card className="p-4 h-full col-span-2 flex flex-col">
            <h3 className="text-lg font-semibold mb-4">题目列表</h3>
            <div className="flex-1 overflow-y-auto space-y-3">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <RefreshCw className="animate-spin mr-2" /> 加载中...
                </div>
              ) : questions.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  暂无题目
                </div>
              ) : (
                questions.map((q, idx) => (
                  <div key={q.questionId} className="border border-gray-200 rounded p-3 flex items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {q.questionOrder}. {q.questionContent}
                        {q.questionType === 'choice' ? (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">选择题 - {q.score}分</span>
                        ) : q.questionType === 'multi' ? (
                          <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">多选题 - {q.score}分</span>
                        ) : (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">判断题 - {q.score}分</span>
                        )}
                      </p>
                      {/* 选择题和多选题显示选项 */}
                      {(q.questionType === 'choice' || q.questionType === 'multi') && q.options && (
                        <div className="mt-2 text-sm text-gray-600">
                          {q.options.map((option: string, i: number) => (
                            <p key={i} className="ml-4">
                              {String.fromCharCode(65 + i)}. {option}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewExamPaperDialog; 