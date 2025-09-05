import React from 'react';

const Footer: React.FC = () => {
  // 自定义波纹动画样式
  const waveAnimation = `
    @keyframes wave {
      0% { transform: translateX(-100%) translateY(-100%) rotate(0deg); opacity: 0.3; }
      50% { transform: translateX(0%) translateY(0%) rotate(180deg); opacity: 0.6; }
      100% { transform: translateX(100%) translateY(100%) rotate(360deg); opacity: 0.3; }
    }
    @keyframes ripple {
      0% { transform: scale(1) rotate(0deg); opacity: 0.1; }
      50% { transform: scale(1.5) rotate(180deg); opacity: 0.3; }
      100% { transform: scale(1) rotate(360deg); opacity: 0.1; }
    }
  `;
  return (
    <>
      <style>{waveAnimation}</style>
      <footer className="bg-gray-400/80 backdrop-blur-md text-white font-semibold py-8 relative overflow-hidden">
        {/* 波纹动画背景 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-blue-300/10 to-transparent animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* 自定义波纹效果 */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400/20 rounded-full" style={{animation: 'wave 8s infinite linear'}}></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-purple-400/20 rounded-full" style={{animation: 'ripple 6s infinite ease-in-out'}}></div>
          <div className="absolute bottom-1/4 left-1/2 w-20 h-20 bg-pink-400/20 rounded-full" style={{animation: 'wave 10s infinite linear reverse'}}></div>
        </div>
      
      {/* 内容层 */}
      <div className="relative z-10">
      <div className="container mx-auto px-4">
        
        
        {/* 页脚图片 */}
        <div className="mt-6 flex justify-center">
          <img 
            src="/image/footer.png" 
            alt="页脚装饰" 
            className="max-w-full h-auto max-h-20 object-contain"
          />
        </div>
        
        <div className="mt-4 text-center text-white text-sm font-medium">
          <p>© 2025 理论考试系统 - 专业、安全、高效的在线考试平台</p>
        </div>
      </div>
      </div>
      </footer>
    </>
  );
};

export default Footer; 