import React from 'react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationEllipsis } from '@/components/ui/pagination';

interface SmartPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  showPrevNext?: boolean;
  prevText?: string;
  nextText?: string;
  className?: string;
}

/**
 * 智能分页组件 - 自动使用省略号，避免样式溢出
 * @param currentPage - 当前页码
 * @param totalPages - 总页数
 * @param onPageChange - 页码变化回调
 * @param maxVisiblePages - 最多显示的页码数（默认7个）
 * @param showPrevNext - 是否显示上一页/下一页按钮（默认true）
 * @param prevText - 上一页按钮文本（默认"上一页"）
 * @param nextText - 下一页按钮文本（默认"下一页"）
 * @param className - 自定义类名
 */
const SmartPagination: React.FC<SmartPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 7,
  showPrevNext = true,
  prevText = '上一页',
  nextText = '下一页',
  className = ''
}) => {
  // 生成页码数组，包含数字和省略号
  const generatePages = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    
    if (totalPages <= maxVisiblePages) {
      // 如果总页数少于等于最大显示页数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 始终显示第一页
      pages.push(1);
      
      if (currentPage <= 4) {
        // 当前页在前4页，显示 1 2 3 4 5 ... 最后一页
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // 当前页在后4页，显示 1 ... 倒数4页 最后一页
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 当前页在中间，显示 1 ... 当前页前后各2页 ... 最后一页
        pages.push('ellipsis');
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pages = generatePages();

  return (
    <div className={`w-full md:w-auto min-w-0 ${className}`}>
      <Pagination className="max-w-full">
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
          
          {/* 显示页码 */}
          {pages.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
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
                disabled={currentPage === totalPages}
                className={"text-sm px-3 py-1 rounded border ml-1 " + (currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer')}
              >
                {nextText}
              </button>
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default SmartPagination;
