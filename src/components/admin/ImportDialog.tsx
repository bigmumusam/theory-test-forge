
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download } from 'lucide-react';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onImport: (data: any[]) => void;
  templateData?: any[];
}

const ImportDialog: React.FC<ImportDialogProps> = ({
  open,
  onOpenChange,
  title,
  onImport,
  templateData = []
}) => {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: "文件格式错误",
          description: "请选择CSV格式的文件",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleImport = () => {
    if (!file) {
      toast({
        title: "请选择文件",
        description: "请先选择要导入的CSV文件",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          return obj;
        });

        onImport(data);
        toast({
          title: "导入成功",
          description: `成功导入 ${data.length} 条记录`
        });
        onOpenChange(false);
        setFile(null);
      } catch (error) {
        toast({
          title: "导入失败",
          description: "文件格式错误，请检查CSV文件格式",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    if (templateData.length === 0) return;
    
    const headers = Object.keys(templateData[0]);
    const csvContent = [
      headers.join(','),
      ...templateData.map(row => headers.map(header => row[header] || '').join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title}导入模板.csv`;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="file">选择CSV文件</Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="mt-1"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              disabled={templateData.length === 0}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>下载模板</span>
            </Button>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button onClick={handleImport} className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>导入</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
