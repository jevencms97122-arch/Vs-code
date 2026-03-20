import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  getRecentFiles,
  getFileUrl,
  clearSession,
  getAllFolders,
  type PBFile,
  type PBFolder,
} from '@/lib/pocketbase';
import {
  FileText,
  HardDrive,
  LogOut,
  Clock,
  Image,
  Film,
  ArrowRight,
  Search,
  X,
  X as Close,
  Folder,
  Plus as PlusIcon,
  Star,
  Music,
  File,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';

const brandCurve = [0.16, 1, 0.3, 1] as const;

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
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
  if (type.startsWith('audio/')) return <Music className="w-4 h-4 text-primary" />;
  if (type.includes('pdf')) return <File className="w-4 h-4 text-destructive" />;
  if (type.includes('json')) return <FileText className="w-4 h-4 text-accent" />;
  return <FileText className="w-4 h-4 text-muted-foreground" />;
}

interface HomePageProps {
  onLogout: () => void;
}

const HomePage = ({ onLogout }: HomePageProps) => {
  const navigate = useNavigate();
  const [recentFiles, setRecentFiles] = useState<PBFile[]>([]);
  const [suggestedFolders, setSuggestedFolders] = useState<PBFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const filteredFiles = useMemo(() => {
    if (!search.trim()) return recentFiles;
    const q = search.toLowerCase();
    return recentFiles.filter(f => f.name.toLowerCase().includes(q));
  }, [recentFiles, search]);

  const filteredFolders = useMemo(() => {
    if (!search.trim()) return suggestedFolders;
    const q = search.toLowerCase();
    return suggestedFolders.filter(f => f.name.toLowerCase().includes(q));
  }, [suggestedFolders, search]);

  useEffect(() => {
    const load = async () => {
      try {
        const [files, allFolders] = await Promise.all([
          getRecentFiles(15),
          getAllFolders(),
        ]);
        setRecentFiles(files);
        const sortedFolders = allFolders
          .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
          .slice(0, 5);
        setSuggestedFolders(sortedFolders);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleLogout = () => {
    clearSession();
    onLogout();
  };

  const handleFileClick = (file: PBFile) => {
    if (file.type.startsWith('image/')) {
      setPreviewImage(getFileUrl(file));
    } else if (file.name.endsWith('.json')) {
      navigate('/editor', { state: { fileId: file.id } });
    } else {
      // For other files, navigate to cloud in the file's folder
      navigate('/cloud', { state: { folderId: file.folder_id || undefined } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-12 border-b border-border flex items-center justify-between px-4 backdrop-blur-sm bg-background/80 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <HardDrive className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground">
            JUX_CLOUD
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-sm hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <div className={`flex-1 p-4 sm:p-6 mx-auto w-full space-y-6 ${isMobile ? 'max-w-full pb-20' : 'max-w-3xl pr-24'}`}>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: brandCurve }}
        >
          <div className="relative w-full max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher fichiers et dossiers…"
              className="h-10 pl-10 pr-10 text-sm font-mono bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>


        {/* Suggested Folders */}
        {filteredFolders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1, ease: brandCurve }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Folder className="w-3.5 h-3.5 text-muted-foreground" />
              <h2 className="text-xs font-mono tracking-[0.15em] text-muted-foreground uppercase">
                Dossiers récents
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => navigate('/cloud', { state: { folderId: folder.id } })}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-sm border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Folder className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate text-foreground font-mono">{folder.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{timeAgo(folder.created)}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Files */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15, ease: brandCurve }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <h2 className="text-xs font-mono tracking-[0.15em] text-muted-foreground uppercase">
              Fichiers récents
            </h2>
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
              <FileText className="w-6 h-6 text-muted-foreground mb-2" />
              <p className="text-xs font-mono text-muted-foreground">
                {search ? 'Aucun résultat' : 'Aucun fichier récent'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-card border border-transparent hover:border-border transition-all text-left group"
                >
                  {file.type.startsWith('image/') ? (
                    <div className="w-9 h-9 rounded-sm overflow-hidden bg-secondary flex-shrink-0 border border-border">
                      <img
                        src={getFileUrl(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-sm bg-secondary flex items-center justify-center flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate text-foreground font-mono">{file.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {formatSize(file.size)} · {timeAgo(file.updated)}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: brandCurve }}
          className="fixed right-0 top-12 h-[calc(100%-48px)] w-16 bg-card/50 backdrop-blur-sm border-l border-border z-30 flex flex-col items-center py-4 gap-3"
        >
          <button
            onClick={() => navigate('/cloud')}
            className="group relative p-2.5 rounded-sm hover:bg-primary/10 transition-colors"
            title="Espace Cloud"
          >
            <HardDrive className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
          <button
            onClick={() => navigate('/favorites')}
            className="group relative p-2.5 rounded-sm hover:bg-primary/10 transition-colors"
            title="Favoris"
          >
            <Star className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
          <div className="w-6 h-px bg-border" />
          <button
            onClick={() => navigate('/editor')}
            className="group relative p-2.5 rounded-sm hover:bg-primary/10 transition-colors"
            title="Nouveau document"
          >
            <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <PlusIcon className="w-4 h-4 text-primary" />
            </div>
          </button>
        </motion.div>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-sm border-t border-border flex justify-around py-2 z-40">
          <button onClick={() => navigate('/cloud')} className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors">
            <HardDrive className="w-5 h-5" />
            <span className="text-[10px] font-mono">Cloud</span>
          </button>
          <button onClick={() => navigate('/favorites')} className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors">
            <Star className="w-5 h-5" />
            <span className="text-[10px] font-mono">Favoris</span>
          </button>
          <button onClick={() => navigate('/editor')} className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors">
            <PlusIcon className="w-5 h-5" />
            <span className="text-[10px] font-mono">Créer</span>
          </button>
        </nav>
      )}

      {/* Footer */}
      <footer className="h-8 border-t border-border flex items-center px-4">
        <span className="text-[10px] text-muted-foreground font-mono">JUX_SYSTEM v2.0</span>
      </footer>

      {/* Image Preview Dialog */}
      <Dialog open={previewImage !== null} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-background border-border overflow-hidden">
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-3 right-3 z-10 p-2 bg-background/80 rounded-sm hover:bg-secondary transition-colors border border-border"
          >
            <Close className="w-5 h-5 text-foreground" />
          </button>
          <div className="w-full h-full flex items-center justify-center bg-background p-4">
            {previewImage && (
              <img
                src={previewImage}
                alt="Aperçu"
                className="max-w-[90vw] max-h-[80vh] object-contain rounded-sm"
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
                style={{ cursor: 'zoom-in', transition: 'transform 0.2s ease' }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;
