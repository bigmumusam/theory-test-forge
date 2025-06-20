
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download } from 'lucide-react';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onImport: (file: File) => void;
  templateDownloadUrl?: string;
}

const ImportDialog: React.FC<ImportDialogProps> = ({
  isOpen,
  onClose,
  title,
  onImport,
  templateDownloadUrl
}) => {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = ['.xlsx', '.xls', '.csv'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: "文件格式错误",
          description: "请选择 Excel 或 CSV 文件",
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
        description: "请先选择要导入的文件",
        variant: "destructive"
      });
      return;
    }

    onImport(file);
    setFile(null);
    onClose();
  };

  const downloadTemplate = () => {
    if (templateDownloadUrl) {
      const link = document.createElement('a');
      link.href = templateDownloadUrl;
      link.download = `${title}_模板.xlsx`;
      link.click();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="file">选择文件</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              支持 Excel(.xlsx, .xls) 和 CSV 文件
            </p>
          </div>

          {file && (
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                已选择文件: {file.name}
              </p>
            </div>
          )}

          <div className="flex justify-between">
            {templateDownloadUrl && (
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                下载模板
              </Button>
            )}
            
            <div className="flex space-x-2 ml-auto">
              <Button variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button onClick={handleImport}>
                <Upload className="w-4 h-4 mr-2" />
                开始导入
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
