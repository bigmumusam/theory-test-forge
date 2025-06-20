import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Edit, Plus, Search, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ImportDialog from './ImportDialog';

const UserManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([
    {
      id: '1',
      name: '管理员',
      idNumber: '110101199001011234',
      role: 'admin',
      department: '系统管理',
      status: '1',
      createTime: '2024-01-15 10:00:00'
    },
    {
      id: '2',
      name: '张医生',
      idNumber: '110101199001011111',
      role: 'student',
      department: '消化内科',
      status: '1',
      createTime: '2024-01-15 10:30:00'
    },
    {
      id: '3',
      name: '李护士',
      idNumber: '110101199002022222',
      role: 'student',
      department: '肝胆外科',
      status: '1',
      createTime: '2024-01-15 11:00:00'
    }
  ]);
  
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    role: 'student',
    department: '',
    status: '1'
  });

  const departments = [
    { id: '1', name: '消化内科' },
    { id: '2', name: '肝胆外科' },
    { id: '3', name: '心血管内科' },
    { id: '4', name: '呼吸内科' },
    { id: '5', name: '系统管理' }
  ];

  const pageSize = 10;
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.includes(searchKeyword) || user.idNumber.includes(searchKeyword);
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesDepartment = selectedDepartment === 'all' || user.department === selectedDepartment;
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const importTemplate = [
    { name: '示例姓名', idNumber: '110101199001011111', role: 'student', department: '消化内科' }
  ];

  const handleImport = (data: any[]) => {
    const newUsers = data.map(item => ({
      id: Date.now().toString() + Math.random(),
      name: item.name || item['姓名'] || '',
      idNumber: item.idNumber || item['身份证号'] || '',
      role: item.role || item['角色'] || 'student',
      department: item.department || item['科室'] || '',
      status: '1',
      createTime: new Date().toLocaleString('zh-CN')
    }));
    
    setUsers([...users, ...newUsers]);
    toast({
      title: "导入成功",
      description: `成功导入 ${newUsers.length} 个用户`
    });
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBatchDelete = () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "请选择用户",
        description: "请先选择要删除的用户",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm(`确定要删除选中的 ${selectedUsers.length} 个用户吗？`)) {
      setUsers(users.filter(user => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
      toast({
        title: "批量删除成功",
        description: `已删除 ${selectedUsers.length} 个用户`
      });
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      idNumber: '',
      role: 'student',
      department: '',
      status: '1'
    });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      idNumber: user.idNumber,
      role: user.role,
      department: user.department,
      status: user.status
    });
    setIsDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!formData.name || !formData.idNumber) {
      toast({
        title: "错误",
        description: "请填写完整信息",
        variant: "destructive"
      });
      return;
    }

    if (editingUser) {
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...formData }
          : user
      ));
      toast({
        title: "成功",
        description: "用户信息已更新"
      });
    } else {
      const newUser = {
        id: Date.now().toString(),
        ...formData,
        createTime: new Date().toLocaleString('zh-CN')
      };
      setUsers([...users, newUser]);
      toast({
        title: "成功",
        description: "用户已添加"
      });
    }
    
    setIsDialogOpen(false);
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "成功",
      description: "用户已删除"
    });
  };

  const clearFilters = () => {
    setSearchKeyword('');
    setSelectedRole('all');
    setSelectedDepartment('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">人员管理</h2>
        <div className="flex space-x-2">
          <Button onClick={() => setIsImportOpen(true)} variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            导入用户
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {/* handleAddUser logic */}} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>添加用户</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingUser ? '编辑用户' : '添加用户'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="请输入姓名"
                  />
                </div>
                <div>
                  <Label htmlFor="idNumber">身份证号</Label>
                  <Input
                    id="idNumber"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                    placeholder="请输入身份证号"
                  />
                </div>
                <div>
                  <Label htmlFor="role">角色</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择角色" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">管理员</SelectItem>
                      <SelectItem value="student">考生</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">科室</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择科室" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">状态</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">正常</SelectItem>
                      <SelectItem value="0">停用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleSaveUser}>
                    {editingUser ? '更新' : '添加'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-60">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索姓名或身份证号..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="角色筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部角色</SelectItem>
              <SelectItem value="admin">管理员</SelectItem>
              <SelectItem value="student">考生</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="科室筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部科室</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(searchKeyword || selectedRole !== 'all' || selectedDepartment !== 'all') && (
            <Button variant="outline" onClick={clearFilters}>
              清除筛选
            </Button>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 font-bold">
                  <Checkbox
                    checked={paginatedUsers.length > 0 && selectedUsers.length === paginatedUsers.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="font-bold">姓名</TableHead>
                <TableHead className="font-bold">身份证号</TableHead>
                <TableHead className="font-bold">角色</TableHead>
                <TableHead className="font-bold">科室</TableHead>
                <TableHead className="font-bold">状态</TableHead>
                <TableHead className="font-bold">创建时间</TableHead>
                <TableHead className="font-bold w-32">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.idNumber}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? '管理员' : '考生'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === '1' ? 'default' : 'destructive'}>
                      {user.status === '1' ? '正常' : '停用'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.createTime}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 分页控件 */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, filteredUsers.length)} 项，共 {filteredUsers.length} 项
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              上一页
            </Button>
            <span className="flex items-center px-3 text-sm">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              下一页
            </Button>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            没有找到符合条件的用户
          </div>
        )}
      </Card>

      <ImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        title="导入用户"
        onImport={handleImport}
        templateData={importTemplate}
      />
    </div>
  );
};

export default UserManager;
