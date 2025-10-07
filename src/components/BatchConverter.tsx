import { useState, useRef } from "react";
import { Upload, Download, FileImage, X } from "lucide-react";
import { Button } from "./ui/button";
import { parseNetpbm, renderToCanvas, NetpbmImage } from "@/utils/netpbmParser";
import { toast } from "sonner";
import { Progress } from "./ui/progress";

interface ConversionFile {
  name: string;
  status: 'pending' | 'converting' | 'done' | 'error';
  error?: string;
  blob?: Blob;
  metadata?: {
    format: string;
    width: number;
    height: number;
    fileSize: string;
    colorDepth: string;
  };
}

export const BatchConverter = () => {
  const [files, setFiles] = useState<ConversionFile[]>([]);
  const [converting, setConverting] = useState(false);
  const [quality, setQuality] = useState(0.95);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFilesSelect = async (fileList: FileList) => {
    const fileArray = Array.from(fileList);
    const newFiles: ConversionFile[] = [];
    
    for (const file of fileArray) {
      newFiles.push({
        name: file.name,
        status: 'pending' as const,
        metadata: {
          format: 'Unknown',
          width: 0,
          height: 0,
          fileSize: formatFileSize(file.size),
          colorDepth: 'Unknown'
        }
      });
    }
    
    setFiles(prev => [...prev, ...newFiles]);
    convertFiles(fileList);
  };

  const convertFiles = async (fileList: FileList) => {
    setConverting(true);
    const fileArray = Array.from(fileList);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      
      try {
        setFiles(prev => prev.map(f => 
          f.name === file.name ? { ...f, status: 'converting' } : f
        ));

        const arrayBuffer = await file.arrayBuffer();
        const parsed = parseNetpbm(arrayBuffer);
        const blob = await convertToPNG(parsed);

        const colorDepthMap: Record<string, string> = {
          'P1': '1-bit (Binary)',
          'P4': '1-bit (Binary)',
          'P2': '8-bit Grayscale',
          'P5': '8-bit Grayscale',
          'P3': '24-bit RGB',
          'P6': '24-bit RGB'
        };

        setFiles(prev => prev.map(f => 
          f.name === file.name ? { 
            ...f, 
            status: 'done', 
            blob,
            metadata: {
              format: parsed.format,
              width: parsed.width,
              height: parsed.height,
              fileSize: f.metadata?.fileSize || '',
              colorDepth: colorDepthMap[parsed.format] || 'Unknown'
            }
          } : f
        ));
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.name === file.name ? { 
            ...f, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error'
          } : f
        ));
      }
    }

    setConverting(false);
    toast.success(`Converted ${fileArray.length} file(s)`);
  };

  const convertToPNG = (image: NetpbmImage): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      renderToCanvas(image, canvas);
      
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert to PNG'));
        }
      }, 'image/png', quality);
    });
  };

  const downloadFile = (file: ConversionFile) => {
    if (!file.blob) return;
    
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.(pbm|pgm|ppm)$/i, '.png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${a.download}`);
  };

  const downloadAll = () => {
    files.forEach(file => {
      if (file.status === 'done' && file.blob) {
        downloadFile(file);
      }
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelect(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFilesSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const doneCount = files.filter(f => f.status === 'done').length;
  const progress = files.length > 0 ? (doneCount / files.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div
        className={`flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed rounded-lg backdrop-blur transition-all ${
          isDragging 
            ? 'border-primary bg-primary/10 scale-[1.02]' 
            : 'border-border bg-card/50 hover:border-primary/50 hover:bg-card/80'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center gap-6 p-8 text-center max-w-md">
          <div className="p-4 rounded-full bg-primary/10">
            <FileImage className="h-12 w-12 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-foreground">
              Batch Convert to PNG
            </h3>
            <p className="text-muted-foreground">
              Select multiple PBM, PGM, or PPM files to convert
            </p>
          </div>

          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full gap-2"
            size="lg"
            disabled={converting}
          >
            <Upload className="h-4 w-4" />
            Select Files
          </Button>
          
          <div className="text-sm text-muted-foreground">
            or drag and drop files here
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInput}
          accept=".pbm,.pgm,.ppm"
          multiple
        />
      </div>

      <div className="bg-card/50 backdrop-blur rounded-lg border border-border p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              PNG Quality: {Math.round(quality * 100)}%
            </label>
            <span className="text-xs text-muted-foreground">
              Lossless compression
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.05"
            value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <p className="text-xs text-muted-foreground">
            Higher quality = larger file size. PNG uses lossless compression.
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-semibold text-foreground">
                Conversion Queue ({doneCount}/{files.length})
              </h4>
              <Progress value={progress} className="w-64" />
            </div>
            <div className="flex gap-2">
              {doneCount > 0 && (
                <Button onClick={downloadAll} variant="default" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download All ({doneCount})
                </Button>
              )}
              <Button onClick={clearAll} variant="secondary" size="sm">
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileImage className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm text-foreground truncate">{file.name}</span>
                    {file.metadata && (
                      <span className="text-xs text-muted-foreground">
                        {file.metadata.format} • {file.metadata.width}×{file.metadata.height} • {file.metadata.colorDepth} • {file.metadata.fileSize}
                      </span>
                    )}
                  </div>
                  {file.status === 'converting' && (
                    <span className="text-xs text-primary flex-shrink-0">Converting...</span>
                  )}
                  {file.status === 'done' && (
                    <span className="text-xs text-green-500 flex-shrink-0">✓ Done</span>
                  )}
                  {file.status === 'error' && (
                    <span className="text-xs text-destructive flex-shrink-0" title={file.error}>
                      ✗ Error
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {file.status === 'done' && file.blob && (
                    <Button onClick={() => downloadFile(file)} variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    onClick={() => removeFile(file.name)} 
                    variant="ghost" 
                    size="sm"
                    disabled={converting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
