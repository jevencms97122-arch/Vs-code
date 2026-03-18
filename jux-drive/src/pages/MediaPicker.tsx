import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllImageFiles, getFileUrl, type PBFile } from '@/lib/pocketbase';
import { useEffect, useState } from 'react';

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}

export const MediaPicker = ({ open, onOpenChange, onSelect }: MediaPickerProps) => {
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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm tracking-widest uppercase">Ajouter un média</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px]">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-sm text-muted-foreground font-mono">
              Aucune image disponible
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
              {images.map((img) => {
                const url = getFileUrl(img);
                return (
                  <button
                    key={img.id}
                    className="group relative aspect-square overflow-hidden rounded-lg border hover:border-primary hover:shadow-md transition-all duration-200"
                    onClick={() => {
                      onSelect(url);
                      onOpenChange(false);
                    }}
                  >
                    <img
                      src={url}
                      alt={img.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-xs font-mono text-white truncate bg-black/50 px-1.5 py-0.5 rounded">
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
