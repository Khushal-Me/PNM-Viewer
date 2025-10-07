import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ImageViewer } from "@/components/ImageViewer";
import { BatchConverter } from "@/components/BatchConverter";
import { parseNetpbm, NetpbmImage } from "@/utils/netpbmParser";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";

const Index = () => {
  const [images, setImages] = useState<Array<{ image: NetpbmImage; filename: string }>>([]);

  const handleFileSelect = (content: string | ArrayBuffer, name: string) => {
    try {
      const parsed = parseNetpbm(content);
      if (images.length < 2) {
        setImages([...images, { image: parsed, filename: name }]);
        toast.success(`Successfully loaded ${name}`);
      } else {
        toast.error('Maximum 2 images allowed');
      }
    } catch (error) {
      toast.error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleClear = (index?: number) => {
    if (index !== undefined) {
      setImages(images.filter((_, i) => i !== index));
    } else {
      setImages([]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Netpbm Viewer & Converter</h1>
            <p className="text-sm text-muted-foreground">PBM • PGM • PPM Image Viewer & PNG Converter</p>
          </div>
          
          {images.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                {images.map((img, idx) => (
                  <span key={idx}>{idx + 1}. {img.filename}</span>
                ))}
              </div>
              <Button variant="secondary" size="sm" onClick={() => handleClear()}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="viewer" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="viewer">Image Viewer</TabsTrigger>
            <TabsTrigger value="converter">Batch Converter</TabsTrigger>
          </TabsList>
          
          <TabsContent value="viewer">
            {images.length === 0 ? (
              <FileUpload onFileSelect={handleFileSelect} />
            ) : (
              <div className="h-[calc(100vh-240px)]">
                <ImageViewer images={images} onRemove={handleClear} canAddMore={images.length < 2} onAddMore={() => {}} />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="converter">
            <BatchConverter />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
