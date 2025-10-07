import { useEffect, useRef, useState } from "react";
import { NetpbmImage, renderToCanvas } from "@/utils/netpbmParser";
import { ZoomIn, ZoomOut, Maximize2, X, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "./ui/resizable";

interface ImageViewerProps {
  images: Array<{ image: NetpbmImage; filename: string }>;
  onRemove: (index: number) => void;
  canAddMore: boolean;
  onAddMore: () => void;
}

const SingleImagePanel = ({ 
  image, 
  filename,
  onRemove,
  showRemove = true 
}: { 
  image: NetpbmImage; 
  filename: string;
  onRemove?: () => void;
  showRemove?: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (canvasRef.current && image) {
      renderToCanvas(image, canvasRef.current);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [image]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleFit = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const formatType = image.format.startsWith('P1') || image.format.startsWith('P4') ? 'PBM' :
                     image.format.startsWith('P2') || image.format.startsWith('P5') ? 'PGM' : 'PPM';

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">File:</span>{" "}
            <span className="text-foreground font-medium">{filename}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Format:</span>{" "}
            <span className="text-foreground font-medium">{formatType} ({image.format})</span>
          </div>
          <div>
            <span className="text-muted-foreground">Dimensions:</span>{" "}
            <span className="text-foreground font-medium">{image.width} × {image.height}</span>
          </div>
          {image.maxValue && (
            <div>
              <span className="text-muted-foreground">Max Value:</span>{" "}
              <span className="text-foreground font-medium">{image.maxValue}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {showRemove && onRemove && (
            <Button variant="ghost" size="icon" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="secondary"
            size="icon"
            onClick={handleZoomOut}
            disabled={scale <= 0.25}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleFit}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleZoomIn}
            disabled={scale >= 5}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="flex items-center px-3 bg-secondary rounded-md min-w-[80px] justify-center">
            <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 bg-card border border-border rounded-lg overflow-hidden relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              imageRendering: 'pixelated',
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const ImageViewer = ({ images, onRemove }: ImageViewerProps) => {
  if (images.length === 1) {
    return <SingleImagePanel image={images[0].image} filename={images[0].filename} onRemove={() => onRemove(0)} showRemove={false} />;
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full gap-4">
      <ResizablePanel defaultSize={50} minSize={30}>
        <SingleImagePanel 
          image={images[0].image} 
          filename={images[0].filename}
          onRemove={() => onRemove(0)}
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={50} minSize={30}>
        <SingleImagePanel 
          image={images[1].image} 
          filename={images[1].filename}
          onRemove={() => onRemove(1)}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
