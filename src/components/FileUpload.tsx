import { useRef } from "react";
import { Upload, FileText } from "lucide-react";
import { Button } from "./ui/button";

interface FileUploadProps {
  onFileSelect: (content: string | ArrayBuffer, filename: string) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        onFileSelect(e.target.result, file.name);
      }
    };
    
    // Read as ArrayBuffer to handle both text and binary formats
    reader.readAsArrayBuffer(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileRead(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileRead(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    if (text) {
      onFileSelect(text, 'pasted.pbm');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[500px] border-2 border-dashed border-border rounded-lg bg-card/50 backdrop-blur transition-colors hover:border-primary/50 hover:bg-card/80"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onPaste={handlePaste}
      tabIndex={0}
    >
      <div className="flex flex-col items-center gap-6 p-8 text-center max-w-md">
        <div className="p-4 rounded-full bg-primary/10">
          <FileText className="h-12 w-12 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-foreground">
            Upload Netpbm Image
          </h3>
          <p className="text-muted-foreground">
            Support for PBM, PGM, and PPM formats (P1-P6)
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full gap-2"
            size="lg"
          >
            <Upload className="h-4 w-4" />
            Choose File
          </Button>
          
          <div className="text-sm text-muted-foreground">
            or drag and drop a file here
          </div>
          
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
            💡 You can also paste file content directly (Ctrl/Cmd + V)
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInput}
        accept=".pbm,.pgm,.ppm"
      />
    </div>
  );
};
