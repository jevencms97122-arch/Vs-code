import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  FileText, 
  Folder, 
  Plus, 
  Clock, 
  Settings, 
  Menu, 
  X,
  Cloud,
  FilePlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface RecentFile {
  id: string;
  name: string;
  type: 'rich-doc' | 'media' | 'other';
  lastOpened: number;
  folderId?: string;
}

const brandCurve = [0.16, 1, 0.3, 1] as const;

export const MainMenu = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  // Load recent files from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('jux_recent_files');
    if (saved) {
      try {
        const files: RecentFile[] = JSON.parse(saved);
        // Sort by last opened date, newest first
        files.sort((a, b) => b.lastOpened - a.lastOpened);
        setRecentFiles(files.slice(0, 10)); // Keep only last 10
      } catch (e) {
        console.warn('Failed to load recent files:', e);
      }
    }
  }, []);

  // Add file to recent files list
  const addToRecent = (fileId: string, fileName: string, type: RecentFile['type'], folderId?: string) => {
    const newFile: RecentFile = {
      id: fileId,
      name: fileName,
      type,
      lastOpened: Date.now(),
      folderId
    };

    setRecentFiles(prev => {
      // Remove if already exists
      const filtered = prev.filter(f => f.id !== fileId);
      // Add to beginning
      const updated = [newFile, ...filtered].slice(0, 10);
      
      // Save to localStorage
      localStorage.setItem('jux_recent_files', JSON.stringify(updated));
      return updated;
    });
  };

  const navigateTo = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const openRecentFile = (file: RecentFile) => {
    if (file.type === 'rich-doc') {
      navigateTo(`/editor?fileId=${file.id}`);
    } else {
      // Handle other file types
      navigateTo('/');
    }
  };

  return (
    <>
      {/* Floating Menu Button */}
      <motion.div
        className="fixed top-4 left-4 z-50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: brandCurve }}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="h-12 w-12 bg-background/80 backdrop-blur-sm border-border hover:bg-background/100"
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </motion.div>

      {/* Main Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              className="fixed left-0 top-0 h-full w-80 bg-background border-r border-border z-50 shadow-xl"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Home className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground">Menu Principal</h2>
                      <p className="text-xs text-muted-foreground">Accès rapide</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Navigation */}
              <div className="p-4 space-y-2">
                <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Navigation
                </h3>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => navigateTo('/')}
                >
                  <Home className="h-4 w-4" />
                  Accueil
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => navigateTo('/editor')}
                >
                  <FileText className="h-4 w-4" />
                  Nouveau Document
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => navigateTo('/')}
                >
                  <Cloud className="h-4 w-4" />
                  Cloud
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => navigateTo('/')}
                >
                  <Folder className="h-4 w-4" />
                  Dossiers
                </Button>
              </div>

              {/* Recent Files */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Récents
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => navigateTo('/')}
                  >
                    Voir tout
                  </Button>
                </div>

                <ScrollArea className="h-48">
                  {recentFiles.length > 0 ? (
                    <div className="space-y-2">
                      {recentFiles.map((file) => (
                        <Button
                          key={file.id}
                          variant="ghost"
                          className="w-full justify-start gap-3 text-left h-auto p-3"
                          onClick={() => openRecentFile(file)}
                        >
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{file.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(file.lastOpened).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8 text-sm">
                      Aucun fichier récent
                    </div>
                  )}
                </ScrollArea>
              </div>

              <Separator />

              {/* Quick Actions */}
              <div className="p-4 space-y-2">
                <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions Rapides
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => navigateTo('/editor')}
                  >
                    <FilePlus className="h-4 w-4" />
                    Document
                  </Button>

                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => navigateTo('/')}
                  >
                    <Plus className="h-4 w-4" />
                    Dossier
                  </Button>

                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => navigateTo('/')}
                  >
                    <Clock className="h-4 w-4" />
                    Récents
                  </Button>

                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => navigateTo('/')}
                  >
                    <Settings className="h-4 w-4" />
                    Paramètres
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};