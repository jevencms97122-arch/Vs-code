import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getFolders,
  getFiles,
  createFolder,
  deleteFolder,
  uploadFile,
  deleteFile,
  getFileUrl,
  getFolderPath,
  toggleFavorite,
  type PBFolder,
  type PBFile,
} from '@/lib/pocketbase';
import { pb } from '@/lib/pocketbase';
import {
  Folder,
  FileText,
  Upload,
  FolderPlus,
  Trash2,
  Download,
  LogOut,
  HardDrive,
  Edit,
  Pencil,
  Star,
  Star as StarFilled,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const brandCurve = [0.16, 1, 0.3, 1] as const;

interface DashboardProps {
  onLogout: () => void;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const navigate = useNavigate();
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [folders, setFolders] = useState<PBFolder[]>([]);
  const [files, setFiles] = useState<PBFile[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<PBFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<PBFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [renamingFile, setRenamingFile] = useState<PBFile | null>(null);
  const [newFileName, setNewFileName] = useState('');

  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const [f, fi] = await Promise.all([
        getFolders(currentFolderId),
        getFiles(currentFolderId),
      ]);
      setFolders(f);
      setFiles(fi);
      if (currentFolderId) {
        const path = await getFolderPath(currentFolderId);
        setBreadcrumbs(path);
      } else {
        setBreadcrumbs([]);
      }
    } catch (err) {
      console.error('Load error:', err);
    }
    setLoading(false);
  }, [currentFolderId]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleUpload = async (fileList: FileList) => {
    setUploading(true);
    setUploadProgress(0);
    try {
      const total = fileList.length;
      for (let i = 0; i < total; i++) {
        await uploadFile(fileList[i], currentFolderId, (p) => {
          setUploadProgress(((i / total) * 100) + (p / total));
        });
      }
      setUploadProgress(100);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
      loadContent();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erreur lors de l\'upload: ' + (error as Error).message);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim(), currentFolderId);
    setNewFolderName('');
    setShowNewFolder(false);
    loadContent();
  };

  const handleDeleteFolder = async (id: string) => {
    await deleteFolder(id);
    loadContent();
  };

  const handleDeleteFile = async (id: string) => {
    await deleteFile(id);
    loadContent();
  };

  const handleToggleFavorite = async (fileId: string) => {
    try {
      await toggleFavorite(fileId);
      // Refresh the content to show updated favorite status
      loadContent();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Erreur lors de la mise en favoris');
    }
  };

  const handleRenameFile = async () => {
    if (!renamingFile || !newFileName.trim()) return;
    
    // Empêcher le changement d'extension
    const currentExtension = renamingFile.name.split('.').pop();
    const newName = newFileName.trim();
    const newExtension = newName.split('.').pop();
    
    if (currentExtension !== newExtension) {
      alert('Impossible de modifier le type de fichier');
      return;
    }

    try {
      // Mettre à jour le nom du fichier dans PocketBase
      await pb.collection('files').update(renamingFile.id, {
        name: newName,
      });
      
      setRenamingFile(null);
      setNewFileName('');
      loadContent();
    } catch (error) {
      console.error('Rename error:', error);
      alert('Erreur lors du renommage du fichier');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Progress bar */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            className="upload-progress"
            initial={{ width: 0 }}
            animate={{ width: `${uploadProgress}%` }}
            exit={{ opacity: 0 }}
            transition={{ ease: brandCurve }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-14 sm:h-12 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <HardDrive className="w-5 h-5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
          <span className="font-mono text-sm sm:text-xs tracking-[0.2em] text-muted-foreground truncate">
            JUX_CLOUD
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-xs text-muted-foreground font-mono truncate max-w-[150px] sm:max-w-none">
            SYSTEM_ACCESS: GRANTED
          </span>
          <button
            onClick={handleLogout}
            className="p-3 sm:p-2 -m-1 sm:m-0 text-muted-foreground hover:text-destructive transition-colors rounded-sm hover:bg-accent/50"
            title="Logout"
          >
            <LogOut className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col">
          {/* Breadcrumbs + Actions */}
          <div className="h-12 sm:h-10 border-b flex items-center justify-between px-4">
            <div className="flex items-center gap-1 sm:gap-0.5 font-mono text-sm sm:text-xs flex-wrap gap-1">
              <button
                onClick={() => setCurrentFolderId(undefined)}
                className="px-2 py-1 text-muted-foreground hover:text-foreground transition-colors rounded-sm hover:bg-accent/50 whitespace-nowrap"
              >
                ROOT
              </button>
              {breadcrumbs.map((b) => (
                <span key={b.id} className="flex items-center gap-1">
                  <span className="text-muted-foreground">/</span>
                  <button
                    onClick={() => setCurrentFolderId(b.id)}
                    className="px-2 py-1 text-muted-foreground hover:text-foreground transition-colors uppercase rounded-sm hover:bg-accent/50 whitespace-nowrap truncate max-w-[100px] sm:max-w-none"
                  >
                    {b.name}
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowNewFolder(!showNewFolder)}
                className="p-3 sm:p-2 -m-1 sm:m-0 text-muted-foreground hover:text-primary transition-colors rounded-sm hover:bg-accent/50"
                title="New folder"
              >
                <FolderPlus className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
              <label className="p-3 sm:p-2 -m-1 sm:m-0 text-muted-foreground hover:text-primary transition-colors cursor-pointer rounded-sm hover:bg-accent/50" title="Upload">
                <Upload className="w-5 h-5 sm:w-4 sm:h-4" />
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && handleUpload(e.target.files)}
                />
              </label>
            </div>
          </div>

          {/* New folder input */}
          <AnimatePresence>
            {showNewFolder && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: brandCurve }}
                className="border-b px-4 overflow-hidden"
              >
                <div className="flex items-center gap-2 py-3 sm:py-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                    placeholder="folder_name"
                    className="bg-secondary border border-border px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary flex-1"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateFolder}
                    className="px-4 sm:px-3 py-2.5 sm:py-1.5 text-sm sm:text-xs font-mono bg-primary text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    CREATE
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          <div
            className={`flex-1 p-4 transition-colors ${
              isDragging ? 'bg-primary/5' : ''
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 120 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-[1px] bg-primary"
                />
              </div>
            ) : folders.length === 0 && files.length === 0 ? (
              <div
                className={`border-2 border-dashed rounded-sm flex flex-col items-center justify-center h-64 transition-colors ${
                  isDragging ? 'border-primary bg-primary/10' : 'border-border'
                }`}
              >
                <Upload className="w-6 h-6 text-muted-foreground mb-3" />
                <p className="text-xs font-mono text-muted-foreground">
                  DROP_FILES_HERE
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or use the upload button above
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: brandCurve }}
                className="space-y-0.5"
              >
                {/* Folders */}
                {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="group flex flex-col sm:flex-row sm:items-center h-14 sm:h-10 px-4 sm:px-3 border border-transparent hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer rounded-sm"
                >
                  <button
                    onClick={() => setCurrentFolderId(folder.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 py-2"
                  >
                    <Folder className="w-5 h-5 sm:w-4 sm:h-4 text-primary shrink-0 flex-shrink-0" />
                    <span className="text-base sm:text-sm font-mono truncate font-medium">{folder.name}</span>
                  </button>
                  <div className="flex sm:gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <span className="text-sm sm:text-xs text-muted-foreground font-mono flex-shrink-0 sm:mr-4">
                      {timeAgo(folder.created)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder.id);
                      }}
                      className="ml-auto sm:ml-0 opacity-0 group-hover:opacity-100 p-2 sm:p-1 text-muted-foreground hover:text-destructive transition-all rounded hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>
                ))}

                {/* Files */}
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="group flex flex-col sm:flex-row sm:items-center h-20 sm:h-10 px-4 sm:px-3 border border-transparent hover:border-border transition-colors cursor-pointer rounded-sm"
                    onClick={() => {
                      setSelectedFile(file);
                      setShowPreview(true);
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 py-2">
                      <FileText className="w-6 h-6 sm:w-4 sm:h-4 text-muted-foreground shrink-0 flex-shrink-0" />
                      <span className="text-lg sm:text-sm font-mono truncate font-medium">{file.name}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <div className="flex sm:gap-2 text-xs text-primary sm:mr-2 font-mono tabular-nums flex-shrink-0">
                        <span>{formatSize(file.size)}</span>
                        <span className="text-muted-foreground">{timeAgo(file.created)}</span>
                      </div>
                      <div className="flex gap-1 mt-2 sm:mt-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(file.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 sm:p-1 text-muted-foreground hover:text-primary transition-all rounded hover:bg-primary/10"
                          title={file.favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                        >
                          {file.favorite ? (
                            <StarFilled className="w-5 h-5 sm:w-3.5 sm:h-3.5 text-primary fill-primary" />
                          ) : (
                            <Star className="w-5 h-5 sm:w-3.5 sm:h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenamingFile(file);
                            setNewFileName(file.name);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 sm:p-1 text-muted-foreground hover:text-primary transition-all rounded hover:bg-primary/10"
                          title="Rename"
                        >
                          <Pencil className="w-5 h-5 sm:w-3.5 sm:h-3.5" />
                        </button>
                        {file.name.endsWith('.json') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/editor', { state: { fileId: file.id } });
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 sm:p-1 text-muted-foreground hover:text-primary transition-all rounded hover:bg-primary/10"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5 sm:w-3.5 sm:h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 sm:p-1 text-muted-foreground hover:text-destructive transition-all rounded hover:bg-destructive/10 ml-auto sm:ml-0"
                        >
                          <Trash2 className="w-5 h-5 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
      </div>

      {/* File Preview Modal */}
      <AnimatePresence>
        {showPreview && selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2, ease: brandCurve }}
              className="bg-background border rounded-lg p-6 max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-mono">{selectedFile.name}</h3>
                <div className="flex items-center gap-2">
                  <a
                    href={getFileUrl(selectedFile)}
                    download={selectedFile.name}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => {
                      handleDeleteFile(selectedFile.id);
                      setShowPreview(false);
                    }}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="flex justify-center">
                {selectedFile.type.startsWith('image/') ? (
                  <img
                    src={getFileUrl(selectedFile)}
                    alt={selectedFile.name}
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                ) : selectedFile.type.startsWith('video/') ? (
                  <video
                    src={getFileUrl(selectedFile)}
                    controls
                    className="max-w-full max-h-[60vh]"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 p-8">
                    <FileText className="w-16 h-16 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm font-mono">{selectedFile.type || 'Unknown type'}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(selectedFile.size)}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="h-10 sm:h-8 border-t flex items-center justify-between px-4">
        <span className="text-sm sm:text-xs text-muted-foreground font-mono">
          {folders.length} folders / {files.length} files
        </span>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Tap items for preview
        </span>
      </footer>

      {/* Rename File Modal */}
      <AnimatePresence>
        {renamingFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setRenamingFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2, ease: brandCurve }}
              className="bg-background border rounded-lg p-6 w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-mono">Renommer le fichier</h3>
                <button
                  onClick={() => setRenamingFile(null)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-2">
                    Nouveau nom
                  </label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameFile()}
                    className="w-full bg-secondary border border-border px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setRenamingFile(null)}
                    className="px-4 py-2 text-xs font-mono border border-border hover:bg-secondary transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleRenameFile}
                    className="px-4 py-2 text-xs font-mono bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Renommer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
