import React, { useState } from 'react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationEllipsis } from '@/components/ui/pagination';

interface SmartPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** 当前页左右各显示几个页码（默认1），首页和末页始终显示 */
  siblingCount?: number;
  showPrevNext?: boolean;
  /** 是否显示"跳至第 N 页"输入框（默认true） */
  showJumper?: boolean;
  prevText?: string;
  nextText?: string;
  className?: string;
}

type PageItem = number | 'ellipsis-left' | 'ellipsis-right';

const generatePages = (currentPage: number, totalPages: number, siblingCount: number): PageItem[] => {
  // 首页 + 末页 + 当前页 + 两侧页码 + 两个省略号
  const maxSlots = siblingCount * 2 + 5;
  if (totalPages <= maxSlots) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const start = Math.max(2, currentPage - siblingCount);
  const end = Math.min(totalPages - 1, currentPage + siblingCount);
  const pages: PageItem[] = [1];
  if (start > 2) pages.push('ellipsis-left');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push('ellipsis-right');
  pages.push(totalPages);
  return pages;
};

const PageJumper: React.FC<{ totalPages: number; onJump: (page: number) => void }> = ({ totalPages, onJump }) => {
  const [value, setValue] = useState('');

  const jump = () => {
    const page = Number(value);
    if (!Number.isInteger(page) || value.trim() === '') return;
    onJump(Math.min(totalPages, Math.max(1, page)));
    setValue('');
  };

  return (
    <div className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap">
      <span>跳至</span>
      <input
        type="number"
        min={1}
        max={totalPages}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && jump()}
        className="w-14 h-8 px-2 rounded border border-gray-300 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        aria-label="跳转页码"
      />
      <span>页</span>
      <button
        type="button"
        onClick={jump}
        className="ml-1 px-2 h-8 rounded border text-sm cursor-pointer hover:bg-gray-50"
      >
        跳转
      </button>
    </div>
  );
};

/**
 * 智能分页组件：只显示首页、末页和当前页附近的页码，其余用省略号；支持输入页码跳转
 */
const SmartPagination: React.FC<SmartPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showPrevNext = true,
  showJumper = true,
  prevText = '上一页',
  nextText = '下一页',
  className = ''
}) => {
  const pages = generatePages(currentPage, totalPages, siblingCount);

  return (
    <div className={`w-full md:w-auto min-w-0 flex flex-wrap items-center justify-center gap-3 ${className}`}>
      <Pagination className="mx-0 w-auto max-w-full">
        <PaginationContent className="flex-wrap justify-center gap-1">
          {showPrevNext && (
            <PaginationItem>
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={"text-sm px-3 py-1 rounded border mr-1 " + (currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer')}
              >
                {prevText}
              </button>
            </PaginationItem>
          )}

          {pages.map(page => {
            if (typeof page !== 'number') {
              return (
                <PaginationItem key={page}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={currentPage === page}
                  className={currentPage === page ? 'font-bold text-blue-700 bg-blue-50' : 'cursor-pointer'}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {showPrevNext && (
            <PaginationItem>
              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className={"text-sm px-3 py-1 rounded border ml-1 " + (currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer')}
              >
                {nextText}
              </button>
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>

      {showJumper && totalPages > 1 && <PageJumper totalPages={totalPages} onJump={onPageChange} />}
    </div>
  );
};

export default SmartPagination;
