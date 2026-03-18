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
  Plus,
  Image,
  Film,
  ArrowRight,
  Search,
  X,
  X as Close,
  Folder,
  Home,
  Plus as PlusIcon,
  Star,
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
        const files = await getRecentFiles(15);
        setRecentFiles(files);
      } catch (err) {
        console.error('Failed to load recent files:', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const loadSuggestedFolders = async () => {
      try {
        const allFolders = await getAllFolders();
        // Sort by creation date (most recent first) and take first 5
        const sortedFolders = allFolders
          .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
          .slice(0, 5);
        setSuggestedFolders(sortedFolders);
      } catch (err) {
        console.error('Failed to load suggested folders:', err);
      }
    };
    loadSuggestedFolders();
  }, []);

  const handleLogout = () => {
    clearSession();
    onLogout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-12 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <HardDrive className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground">
            JUX_CLOUD
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-8 pr-20">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: brandCurve }}
          className="fixed right-0 top-0 h-full w-20 bg-card border-l border-border z-50 flex flex-col items-center py-6 gap-4"
        >
          {/* Cloud Icon */}
          <button
            onClick={() => navigate('/cloud')}
            className="group relative p-3 rounded-lg hover:bg-primary/10 transition-colors"
            title="Espace Cloud"
          >
            <HardDrive className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="absolute -left-36 top-1/2 -translate-y-1/2 bg-background border border-border px-3 py-2 rounded text-xs font-mono text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Espace Cloud
            </span>
          </button>

          {/* Favorites Icon */}
          <button
            onClick={() => navigate('/favorites')}
            className="group relative p-3 rounded-lg hover:bg-primary/10 transition-colors"
            title="Favoris"
          >
            <Star className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="absolute -left-32 top-1/2 -translate-y-1/2 bg-background border border-border px-3 py-2 rounded text-xs font-mono text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Favoris
            </span>
          </button>

          {/* Divider */}
          <div className="w-8 h-px bg-border"></div>

          {/* Create Document Icon */}
          <button
            onClick={() => navigate('/editor')}
            className="group relative p-3 rounded-lg hover:bg-primary/10 transition-colors"
            title="Nouveau document"
          >
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/40 transition-colors">
              <PlusIcon className="w-5 h-5 text-primary" />
            </div>
            <span className="absolute -left-40 top-1/2 -translate-y-1/2 bg-background border border-border px-3 py-2 rounded text-xs font-mono text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Nouveau document
            </span>
          </button>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: brandCurve }}
          className="flex justify-center"
        >
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="h-10 pl-10 pr-10 text-sm font-mono bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Suggested Folders */}
        {suggestedFolders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: brandCurve }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-xs font-mono tracking-[0.15em] text-muted-foreground uppercase">
                  Dossiers suggérés
                </h2>
              </div>
            </div>
            <div className="border border-border rounded-sm divide-y divide-border">
              {filteredFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => navigate('/cloud')}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Folder className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate text-foreground">{folder.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {timeAgo(folder.created)}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Files */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: brandCurve }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-xs font-mono tracking-[0.15em] text-muted-foreground uppercase">
                Fichiers récents
              </h2>
            </div>
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
              <FileText className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-xs font-mono text-muted-foreground">
                {search ? 'Aucun résultat' : 'Aucun fichier récent'}
              </p>
            </div>
          ) : (
            <div className="border border-border rounded-sm divide-y divide-border">
              {filteredFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => {
                    if (file.type.startsWith('image/')) {
                      setPreviewImage(getFileUrl(file));
                    } else if (file.name.endsWith('.json')) {
                      navigate('/editor', { state: { fileId: file.id } });
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
                >
                  {file.type.startsWith('image/') ? (
                    <div className="w-8 h-8 rounded-sm overflow-hidden bg-secondary flex-shrink-0">
                      <img
                        src={getFileUrl(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-sm bg-secondary flex items-center justify-center flex-shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {formatSize(file.size)}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                    {timeAgo(file.updated)}
                  </span>
                </button>
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

export default HomePage;
