import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllImageFiles, getFileUrl, type PBFile } from '@/lib/pocketbase';

interface ImagePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}

export const ImagePickerDialog = ({ open, onOpenChange, onSelect }: ImagePickerDialogProps) => {
  const [images, setImages] = useState<PBFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getAllImageFiles()
        .then(setImages)
        .catch((err) => console.error('Failed to load images:', err))
        .finally(() => setLoading(false));
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm tracking-widest">SÉLECTIONNER UNE IMAGE</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="grid grid-cols-3 gap-2 p-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground font-mono py-16">
              Aucune image trouvée
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 p-2">
              {images.map((img) => {
                const url = getFileUrl(img);
                return (
                  <button
                    key={img.id}
                    onClick={() => {
                      onSelect(url);
                      onOpenChange(false);
                    }}
                    className="group relative aspect-square overflow-hidden rounded border border-border hover:border-primary transition-colors"
                  >
                    <img
                      src={url}
                      alt={img.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                      <span className="text-[10px] font-mono text-foreground truncate w-full">
                        {img.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
