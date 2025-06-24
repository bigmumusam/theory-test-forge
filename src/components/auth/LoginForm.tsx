import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { User, LoginCredentials } from '../../types/auth';
import { useToast } from '@/hooks/use-toast';
import { request } from '@/lib/request';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    idNumber: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.idNumber || !credentials.name) {
      toast({ title: "请填写完整信息", description: "请输入身份证号和姓名", variant: "destructive" });
      return;
    }
    const idPattern = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    if (!idPattern.test(credentials.idNumber)) {
      toast({ title: "身份证号格式错误", description: "请输入正确的身份证号码", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      // 兼容后端返回结构
      const { token, user } = res.data || res;
      if (!token || !user) throw new Error('登录响应异常');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      onLogin(user);
      toast({ title: "登录成功", description: `欢迎，${user.name}！` });
    } catch (error: any) {
      toast({ title: "登录失败", description: String(error), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">系统登录</h2>
        <p className="text-gray-600">请使用您的身份证号和姓名登录</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="idNumber" className="text-gray-700 font-medium">身份证号</Label>
          <Input
            id="idNumber"
            type="text"
            placeholder="请输入身份证号"
            value={credentials.idNumber}
            onChange={(e) => setCredentials(prev => ({ ...prev, idNumber: e.target.value }))}
            className="h-12 text-lg"
            maxLength={18}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700 font-medium">姓名</Label>
          <Input
            id="name"
            type="text"
            placeholder="请输入真实姓名"
            value={credentials.name}
            onChange={(e) => setCredentials(prev => ({ ...prev, name: e.target.value }))}
            className="h-12 text-lg"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "登录中..." : "登录"}
        </Button>
      </form>
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800 mb-2">
          <strong>演示账号：</strong>
        </p>
        <p className="text-xs text-blue-600">
          管理员：身份证号 110101199001011234，姓名 管理员
        </p>
        <p className="text-xs text-blue-600">
          学员：任意有效身份证号和姓名
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
