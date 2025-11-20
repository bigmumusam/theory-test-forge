import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-blue-500/80 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-4">
          <img
            src="/image/footer.png"
            alt="页脚装饰"
            className="max-w-full h-auto max-h-20 object-contain"
            style={{ transform: 'translateX(2em)' }}
          />
          <p className="text-[#0B3A82] text-sm font-medium">
            © 2025 理论考试系统 - 专业、安全、高效的在线考试平台
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 