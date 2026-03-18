import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Maximize2 } from 'lucide-react';
import { getFileUrl, type PBFile } from '@/lib/pocketbase';
import { cn } from '@/lib/utils';

interface MediaGalleryProps {
  media: string[]; // image urls
  onDelete: (url: string) => void;
}

export const MediaGallery = ({ media, onDelete }: MediaGalleryProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [fullViewUrl, setFullViewUrl] = useState<string>('');

  const handleThumbnailClick = (url: string) => {
    setPreviewUrl(url);
  };

  const handlePreviewClick = () => {
    if (previewUrl) {
      setFullViewUrl(previewUrl);
    }
  };

  return (
    <>
      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Médias
        </h3>
        {media.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Aucun média ajouté</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {media.map((url, index) => (
              <div key={index} className="group relative">
                <Card className="h-32 overflow-hidden group-hover:shadow-md transition-all duration-200 cursor-pointer border-border hover:border-primary">
                  <CardContent className="p-0 h-full relative">
                    <img 
                      src={url} 
                      alt={`Media ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                      onClick={() => handleThumbnailClick(url)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(url);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl('')}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              Aperçu
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto" onClick={handlePreviewClick}>
                <Maximize2 className="h-3 w-3" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 max-h-[70vh] overflow-auto">
            {previewUrl && (
              <img 
                src={previewUrl} 
                alt="Preview"
                className="w-full h-auto max-h-[60vh] object-contain rounded-lg shadow-lg cursor-pointer"
                onClick={handlePreviewClick}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full View Dialog */}
      <Dialog open={!!fullViewUrl} onOpenChange={() => setFullViewUrl('')}>
        <DialogContent className="max-w-6xl p-0 max-h-[95vh] h-[95vh]">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-50 h-8 w-8 p-0"
            onClick={() => setFullViewUrl('')}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="w-full h-full flex items-center justify-center bg-black p-8">
            {fullViewUrl && (
              <img 
                src={fullViewUrl} 
                alt="Full view"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

