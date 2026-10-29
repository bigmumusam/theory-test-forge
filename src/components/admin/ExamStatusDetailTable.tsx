import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SmartPagination from '@/components/ui/smart-pagination';

export interface ExamStatusDetail {
  userName: string;
  idNumber: string;
  department?: string;
  userCategory?: string;
  examStatus: string;
  examDate?: string;
  score: number | null;
}

const PAGE_SIZE = 10;
const ALL_STATUS = 'all';

const ExamStatusDetailTable: React.FC<{ details: ExamStatusDetail[] }> = ({ details }) => {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState(ALL_STATUS);
  const [applied, setApplied] = useState({ keyword: '', status: ALL_STATUS });
  const [page, setPage] = useState(1);

  // 切换试卷时重置筛选和页码
  useEffect(() => {
    setKeyword('');
    setStatus(ALL_STATUS);
    setApplied({ keyword: '', status: ALL_STATUS });
    setPage(1);
  }, [details]);

  const filtered = useMemo(() => details.filter(d =>
    (!applied.keyword || d.userName?.includes(applied.keyword) || d.idNumber?.includes(applied.keyword)) &&
    (applied.status === ALL_STATUS || d.examStatus === applied.status)
  ), [details, applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = () => {
    setPage(1);
    setApplied({ keyword: keyword.trim(), status });
  };

  const handleClear = () => {
    setKeyword('');
    setStatus(ALL_STATUS);
    setPage(1);
    setApplied({ keyword: '', status: ALL_STATUS });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="w-56"
          placeholder="搜索姓名或身份证号"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-32"><SelectValue placeholder="考试状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUS}>全部状态</SelectItem>
            <SelectItem value="已考试">已考试</SelectItem>
            <SelectItem value="未考试">未考试</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" onClick={handleSearch}>查询</Button>
        {(applied.keyword || applied.status !== ALL_STATUS) && (
          <Button size="sm" variant="outline" onClick={handleClear}>清除筛选</Button>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>姓名</TableHead>
              <TableHead>身份证号</TableHead>
              <TableHead>部门</TableHead>
              <TableHead>人员类别</TableHead>
              <TableHead>考试状态</TableHead>
              <TableHead>考试日期</TableHead>
              <TableHead>分数</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">暂无数据</TableCell>
              </TableRow>
            ) : pageRows.map((detail, index) => (
              <TableRow key={`${detail.idNumber}-${index}`}>
                <TableCell className="font-medium">{detail.userName}</TableCell>
                <TableCell className="font-mono text-sm">{detail.idNumber}</TableCell>
                <TableCell>{detail.department}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {detail.userCategory || '指挥管理军官'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={detail.examStatus === '已考试' ? 'default' : 'secondary'}
                    className={detail.examStatus === '已考试' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                  >
                    {detail.examStatus}
                  </Badge>
                </TableCell>
                <TableCell>{detail.examDate || '-'}</TableCell>
                <TableCell>
                  {detail.score !== null ? (
                    <span className={`font-semibold ${detail.score >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                      {detail.score}分
                    </span>
                  ) : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filtered.length > 0 && (
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <p className="text-sm text-gray-600 whitespace-nowrap">
            显示 {(page - 1) * PAGE_SIZE + 1} 到 {Math.min(page * PAGE_SIZE, filtered.length)} 条，共 {filtered.length} 条记录
          </p>
          <SmartPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default ExamStatusDetailTable;
