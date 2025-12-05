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
import SmartPagination from '@/components/ui/smart-pagination';
import { request } from '@/lib/request';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const RoleManager = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState([]);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  // 查询角色列表
  const fetchRoles = async () => {
    try {
      const params = {
        keyword: searchKeyword,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        pageNumber: currentPage,
        pageSize
      };
      const res = await request('/auth/roles/list', {
        method: 'POST',
        body: JSON.stringify(params)
      });
      setRoles(res.data.records || res.data.data || []);
      setTotalPages(res.data.totalPage || 1);
      setTotalRows(res.data.totalRow || (res.data.data ? res.data.data.length : 0));
    } catch (error) {
      toast({ title: '加载失败', description: String(error), variant: 'destructive' });
    }
  };

  React.useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line
  }, [currentPage, selectedStatus, searchKeyword]);

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
    console.log('编辑时选中的 role:', role);
    setEditingRole(role);
    setFormData({
      roleName: role.roleName,
      roleKey: role.roleKey,
      roleSort: role.roleSort?.toString() || '',
      status: role.status,
      remark: role.remark
    });
    setIsDialogOpen(true);
  };

  const handleSaveRole = async () => {
    console.log('保存时 editingRole:', editingRole);
    if (!formData.roleName || !formData.roleKey) {
      toast({
        title: '错误',
        description: '请填写角色名称和角色标识',
        variant: 'destructive'
      });
      return;
    }
    try {
      if (editingRole) {
        await request('/auth/roles/update', {
          method: 'POST',
          body: JSON.stringify({
            roleId: editingRole.roleId,
            ...formData,
            roleSort: parseInt(formData.roleSort) || 0
          })
        });
        toast({ title: '成功', description: '角色信息已更新' });
      } else {
        await request('/auth/roles/add', {
          method: 'POST',
          body: JSON.stringify({
            ...formData,
            roleSort: parseInt(formData.roleSort) || 0
          })
        });
        toast({ title: '成功', description: '角色已添加' });
      }
      setIsDialogOpen(false);
      fetchRoles();
    } catch (error) {
      toast({ title: '操作失败', description: String(error), variant: 'destructive' });
    }
  };

  const handleDeleteRole = async (roleId) => {
    try {
      await request('/auth/roles/delete', {
        method: 'POST',
        body: JSON.stringify({ roleId })
      });
      toast({ title: '成功', description: '角色已删除' });
      fetchRoles();
    } catch (error) {
      toast({ title: '删除失败', description: String(error), variant: 'destructive' });
    }
  };

  const clearFilters = () => {
    setSearchKeyword('');
    setSelectedStatus('all');
    setCurrentPage(1);
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
                <Label htmlFor="roleKey">角色代码</Label>
                <Input
                  id="roleKey"
                  value={formData.roleKey}
                  onChange={(e) => setFormData({...formData, roleKey: e.target.value})}
                  placeholder="请输入角色代码"
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
                <TableHead>角色代码</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>备注</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="w-32">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map(role => (
                <TableRow key={role.roleId}>
                  <TableCell className="font-medium">{role.roleName}</TableCell>
                  <TableCell>{role.roleKey}</TableCell>
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
                      <Popover>
                        <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={role.roleId === '1'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-60 text-center">
                          <div className="mb-2">确定要删除该角色？</div>
                          <div className="flex justify-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => document.activeElement.blur()}>取消</Button>
                            <Button size="sm" variant="destructive" onClick={() => { handleDeleteRole(role.roleId); document.activeElement.blur(); }}>删除</Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {roles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            没有找到符合条件的角色
          </div>
        )}
      </Card>

      <div className="mt-6 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <p className="text-sm text-gray-600 whitespace-nowrap mb-2 md:mb-0">
          显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, totalRows)} 条，共 {totalRows} 条记录
        </p>
        <SmartPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          prevText="上一页"
          nextText="下一页"
        />
      </div>
    </div>
  );
};

export default RoleManager;
