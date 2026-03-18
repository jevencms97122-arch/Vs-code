import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  getFavoriteFiles,
  toggleFavorite,
  getFileUrl,
  type PBFile,
} from '@/lib/pocketbase';
import {
  FileText,
  Image,
  Film,
  Star,
  Star as StarFilled,
  Clock,
  ArrowRight,
  Search,
  X,
  X as Close,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const brandCurve = [0.16, 1, 0.3, 1] as const;

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  return `Il y a ${Math.floor(diff / 86400)}j`;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <Image className="w-4 h-4 text-primary" />;
  if (type.startsWith('video/')) return <Film className="w-4 h-4 text-primary" />;
  return <FileText className="w-4 h-4 text-muted-foreground" />;
}

const Favorites = () => {
  const navigate = useNavigate();
  const [favoriteFiles, setFavoriteFiles] = useState<PBFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const filteredFiles = favoriteFiles.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const load = async () => {
      try {
        const files = await getFavoriteFiles();
        setFavoriteFiles(files);
      } catch (err) {
        console.error('Failed to load favorite files:', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleToggleFavorite = async (fileId: string) => {
    try {
      await toggleFavorite(fileId);
      // Refresh the list after toggling
      const files = await getFavoriteFiles();
      setFavoriteFiles(files);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleOpenFile = (file: PBFile) => {
    if (file.type.startsWith('image/')) {
      setPreviewImage(getFileUrl(file));
    } else if (file.name.endsWith('.json')) {
      navigate('/editor', { state: { fileId: file.id } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-12 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Star className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground">
            FAVORIS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-xs font-mono hover:text-primary transition-colors"
          >
            ← MENU PRINCIPAL
          </Button>
        </div>
      </header>

      <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: brandCurve }}
          className="flex justify-center"
        >
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher dans les favoris…"
              className="h-10 pl-10 pr-10 text-sm font-mono bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Favorite Files */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: brandCurve }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-xs font-mono tracking-[0.15em] text-muted-foreground uppercase">
                Fichiers favoris
              </h2>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {filteredFiles.length} {filteredFiles.length === 1 ? 'favori' : 'favoris'}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 120 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-[1px] bg-primary"
              />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="border border-dashed border-border rounded-sm p-8 flex flex-col items-center">
              <Star className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-xs font-mono text-muted-foreground">
                {search ? 'Aucun favori correspondant' : 'Aucun favori pour le moment'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Ajoutez des fichiers à vos favoris depuis l\'espace cloud
              </p>
            </div>
          ) : (
            <div className="border border-border rounded-sm divide-y divide-border">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
                >
                  {/* File Icon */}
                  <div className="w-8 h-8 rounded-sm overflow-hidden bg-secondary flex-shrink-0">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={getFileUrl(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm truncate text-foreground">{file.name}</p>
                      <button
                        onClick={() => handleToggleFavorite(file.id)}
                        className="p-1 rounded-full hover:bg-primary/10 transition-colors"
                        title="Retirer des favoris"
                      >
                        <StarFilled className="w-4 h-4 text-primary fill-primary" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {formatSize(file.size)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                      {timeAgo(file.updated)}
                    </span>
                    <button
                      onClick={() => handleOpenFile(file)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors"
                      title="Ouvrir"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="h-8 border-t border-border flex items-center px-4">
        <span className="text-xs text-muted-foreground font-mono">
          JUX_SYSTEM v2.0
        </span>
      </footer>

      {/* Image Preview Dialog */}
      <Dialog open={previewImage !== null} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black border-0 overflow-hidden">
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-colors"
          >
            <Close className="w-6 h-6 text-white" />
          </button>
          <div className="w-full h-full flex items-center justify-center bg-black">
            {previewImage && (
              <img
                src={previewImage}
                alt="Aperçu en grand"
                className="max-w-[95vw] max-h-[85vh] object-contain cursor-zoom-in"
                style={{
                  imageRendering: 'auto',
                  transformOrigin: 'center center'
                }}
                onClick={(e) => {
                  const img = e.currentTarget;
                  if (img.style.transform === 'scale(2)') {
                    img.style.transform = 'scale(1)';
                    img.style.cursor = 'zoom-in';
                  } else {
                    img.style.transform = 'scale(2)';
                    img.style.cursor = 'zoom-out';
                  }
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Favorites;