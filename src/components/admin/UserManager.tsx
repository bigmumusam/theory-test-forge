import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Search, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ImportDialog from './ImportDialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { request } from '@/lib/request';

const UserManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    userName: '',
    idNumber: '',
    role: 'student',
    department: '',
    status: '1'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const departments = [
    { id: '1', name: '消化内科' },
    { id: '2', name: '肝胆外科' },
    { id: '3', name: '心血管内科' },
    { id: '4', name: '呼吸内科' },
    { id: '5', name: '系统管理' }
  ];

  // 查询用户列表
  const fetchUsers = async () => {
    try {
      const params = {
        pageNum: currentPage,
        pageSize,
        keyword: searchKeyword,
        role: selectedRole === 'all' ? undefined : selectedRole,
        department: selectedDepartment === 'all' ? undefined : selectedDepartment,
        status: selectedStatus === 'all' ? undefined : selectedStatus
      };
      const res = await request('/auth/users/list', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      setUsers(res.data.records || []);
      setTotalPages(res.data.totalPage || 1);
      setTotalRows(res.data.totalRow || 0);
    } catch (error) {
      toast({ title: '加载失败', description: String(error), variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [currentPage, selectedRole, selectedDepartment, selectedStatus, searchKeyword]);

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({ userName: '', idNumber: '', role: 'student', department: '', status: '1' });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      userName: user.userName,
      idNumber: user.idNumber,
      role: user.role,
      department: user.department,
      status: user.status
    });
    setIsDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!formData.userName || !formData.idNumber) {
      toast({ title: '错误', description: '请填写完整信息', variant: 'destructive' });
      return;
    }
    try {
      if (editingUser) {
        await request('/auth/users/update', {
          method: 'POST',
          body: JSON.stringify({ ...formData, id: editingUser.id })
        });
        toast({ title: '成功', description: '用户信息已更新' });
      } else {
        await request('/auth/users/add', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        toast({ title: '成功', description: '用户已添加' });
      }
      setIsDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast({ title: '操作失败', description: String(error), variant: 'destructive' });
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await request('/auth/users/delete', {
        method: 'POST',
        body: JSON.stringify({ id: userId })
      });
      toast({ title: '成功', description: '用户已删除' });
      fetchUsers();
    } catch (error) {
      toast({ title: '删除失败', description: String(error), variant: 'destructive' });
    }
  };

  const handleImportUsers = (file: File) => {
    // 可实现真实导入逻辑
    toast({ title: '暂未实现', description: '请用后端接口实现导入', variant: 'destructive' });
  };

  const clearFilters = () => {
    setSearchKeyword('');
    setSelectedRole('all');
    setSelectedDepartment('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  // 搜索时重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">人员管理</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            导入用户
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddUser} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>添加用户</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUser ? '编辑用户' : '添加用户'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userName">姓名</Label>
                  <Input
                    id="userName"
                    value={formData.userName}
                    onChange={(e) => setFormData({...formData, userName: e.target.value})}
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
                    readOnly
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
                      <SelectItem value="exam_admin">考试管理员</SelectItem>
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
                {editingUser && (
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
                )}
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
              <SelectItem value="exam_admin">考试管理员</SelectItem>
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
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="1">正常</SelectItem>
              <SelectItem value="0">停用</SelectItem>
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
              <TableRow className="bg-gray-50">
                <TableHead className="font-bold text-gray-900 px-2 py-1">姓名</TableHead>
                <TableHead className="font-bold text-gray-900 px-2 py-1">身份证号</TableHead>
                <TableHead className="font-bold text-gray-900 px-2 py-1">角色</TableHead>
                <TableHead className="font-bold text-gray-900 px-2 py-1">科室</TableHead>
                <TableHead className="font-bold text-gray-900 px-2 py-1">状态</TableHead>
                <TableHead className="font-bold text-gray-900 px-2 py-1">创建时间</TableHead>
                <TableHead className="font-bold text-gray-900 w-32 px-2 py-1">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium px-2 py-1">{user.userName}</TableCell>
                  <TableCell className="font-mono px-2 py-1">{user.idNumber}</TableCell>
                  <TableCell className="px-2 py-1">
                    <Badge variant={
                      user.role === 'admin' ? 'default' : 
                      user.role === 'exam_admin' ? 'secondary' : 
                      'outline'
                    }>
                      {user.role === 'admin' ? '管理员' : 
                       user.role === 'exam_admin' ? '考试管理员' : 
                       '考生'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-2 py-1">{user.department}</TableCell>
                  <TableCell className="px-2 py-1">
                    <Badge variant={user.status === '1' ? 'default' : 'destructive'}>
                      {user.status === '1' ? '正常' : '停用'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-2 py-1">{user.createTime}</TableCell>
                  <TableCell className="px-2 py-1">
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
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            没有找到符合条件的用户
          </div>
        )}
      </Card>
      <div className="mt-6 flex flex-row justify-between items-center flex-nowrap gap-4">
        <p className="text-sm text-gray-600 whitespace-nowrap">
          显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, totalRows)} 条，共 {totalRows} 条记录
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={"text-sm px-3 py-1 rounded border mr-1 " + (currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer')}
                disabled={currentPage === 1}
              >上一页</button>
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="text-sm cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                className={"text-sm px-3 py-1 rounded border ml-1 " + (currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer')}
                disabled={currentPage === totalPages}
              >下一页</button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <ImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="导入用户"
        onImport={handleImportUsers}
        templateDownloadUrl="/templates/user_template.xlsx"
      />
    </div>
  );
};

export default UserManager;
