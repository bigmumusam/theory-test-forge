
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RoleManager = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState([
    {
      id: '1',
      roleName: '系统管理员',
      roleKey: 'admin',
      roleSort: 1,
      status: '1',
      remark: '超级管理员，拥有所有权限',
      createTime: '2024-01-15 10:00:00'
    },
    {
      id: '2',
      roleName: '考试管理员',
      roleKey: 'exam_admin',
      roleSort: 2,
      status: '1',
      remark: '考试管理员，负责题库和考试管理',
      createTime: '2024-01-15 10:30:00'
    },
    {
      id: '3',
      roleName: '普通考生',
      roleKey: 'student',
      roleSort: 3,
      status: '1',
      remark: '普通考生，只能参加考试',
      createTime: '2024-01-15 11:00:00'
    }
  ]);
  
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    roleName: '',
    roleKey: '',
    roleSort: '',
    status: '1',
    remark: ''
  });

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.roleName.includes(searchKeyword) || role.roleKey.includes(searchKeyword);
    const matchesStatus = selectedStatus === 'all' || role.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddRole = () => {
    setEditingRole(null);
    setFormData({
      roleName: '',
      roleKey: '',
      roleSort: '',
      status: '1',
      remark: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setFormData({
      roleName: role.roleName,
      roleKey: role.roleKey,
      roleSort: role.roleSort.toString(),
      status: role.status,
      remark: role.remark
    });
    setIsDialogOpen(true);
  };

  const handleSaveRole = () => {
    if (!formData.roleName || !formData.roleKey) {
      toast({
        title: "错误",
        description: "请填写角色名称和角色标识",
        variant: "destructive"
      });
      return;
    }

    if (editingRole) {
      setRoles(roles.map(role => 
        role.id === editingRole.id 
          ? { ...role, ...formData, roleSort: parseInt(formData.roleSort) || 0 }
          : role
      ));
      toast({
        title: "成功",
        description: "角色信息已更新"
      });
    } else {
      const newRole = {
        id: Date.now().toString(),
        ...formData,
        roleSort: parseInt(formData.roleSort) || 0,
        createTime: new Date().toLocaleString('zh-CN')
      };
      setRoles([...roles, newRole]);
      toast({
        title: "成功",
        description: "角色已添加"
      });
    }
    
    setIsDialogOpen(false);
  };

  const handleDeleteRole = (roleId) => {
    if (roleId === '1') {
      toast({
        title: "错误",
        description: "系统管理员角色不能删除",
        variant: "destructive"
      });
      return;
    }
    
    setRoles(roles.filter(role => role.id !== roleId));
    toast({
      title: "成功",
      description: "角色已删除"
    });
  };

  const clearFilters = () => {
    setSearchKeyword('');
    setSelectedStatus('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">角色管理</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddRole} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>添加角色</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingRole ? '编辑角色' : '添加角色'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="roleName">角色名称</Label>
                <Input
                  id="roleName"
                  value={formData.roleName}
                  onChange={(e) => setFormData({...formData, roleName: e.target.value})}
                  placeholder="请输入角色名称"
                />
              </div>
              <div>
                <Label htmlFor="roleKey">角色标识</Label>
                <Input
                  id="roleKey"
                  value={formData.roleKey}
                  onChange={(e) => setFormData({...formData, roleKey: e.target.value})}
                  placeholder="请输入角色标识"
                />
              </div>
              <div>
                <Label htmlFor="roleSort">显示顺序</Label>
                <Input
                  id="roleSort"
                  type="number"
                  value={formData.roleSort}
                  onChange={(e) => setFormData({...formData, roleSort: e.target.value})}
                  placeholder="请输入显示顺序"
                />
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
              <div>
                <Label htmlFor="remark">备注</Label>
                <Textarea
                  id="remark"
                  value={formData.remark}
                  onChange={(e) => setFormData({...formData, remark: e.target.value})}
                  placeholder="请输入备注信息"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleSaveRole}>
                  {editingRole ? '更新' : '添加'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-60">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索角色名称或标识..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="1">正常</SelectItem>
              <SelectItem value="0">停用</SelectItem>
            </SelectContent>
          </Select>

          {(searchKeyword || selectedStatus !== 'all') && (
            <Button variant="outline" onClick={clearFilters}>
              清除筛选
            </Button>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>角色名称</TableHead>
                <TableHead>角色标识</TableHead>
                <TableHead>显示顺序</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>备注</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="w-32">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map(role => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.roleName}</TableCell>
                  <TableCell>{role.roleKey}</TableCell>
                  <TableCell>{role.roleSort}</TableCell>
                  <TableCell>
                    <Badge variant={role.status === '1' ? 'default' : 'destructive'}>
                      {role.status === '1' ? '正常' : '停用'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{role.remark}</TableCell>
                  <TableCell>{role.createTime}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                        disabled={role.id === '1'}
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

        {filteredRoles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            没有找到符合条件的角色
          </div>
        )}
      </Card>
    </div>
  );
};

export default RoleManager;
