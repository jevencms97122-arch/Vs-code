import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/RichTextEditor';
import { MediaGallery } from '@/components/MediaGallery';
import { MediaPicker } from '@/pages/MediaPicker';
import { uploadFile, getFolders, getAllFolders, getFileContent, getFile, getFiles, deleteFile, getFolderPath, getFileSaveLocation, setFileSaveLocation, getFolderPathById, type PBFolder } from '@/lib/pocketbase';

const brandCurve = [0.16, 1, 0.3, 1] as const;

interface DocumentData {
  type: 'rich-doc';
  textContent: string;
  media: string[]; 
}

const Editor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [textContent, setTextContent] = useState('');
  const [media, setMedia] = useState<string[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [folders, setFolders] = useState<PBFolder[]>([]);
  const [allFolders, setAllFolders] = useState<PBFolder[]>([]);
  const [folderPaths, setFolderPaths] = useState<Record<string, string>>({});
  const [isFirstSave, setIsFirstSave] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string>('');
  const [recentFiles, setRecentFiles] = useState<any[]>([]);

  // Load saved document metadata from localStorage
  useEffect(() => {
    const savedDoc = localStorage.getItem('jux_current_doc');
    if (savedDoc) {
      try {
        const docMeta = JSON.parse(savedDoc);
        setDocumentName(docMeta.name);
        setSelectedFolder(docMeta.folderId || '');
      } catch (e) {
        console.warn('Failed to parse saved doc metadata:', e);
      }
    }
  }, []);

  useEffect(() => {
    loadFolders();
    loadAllFolders();
    const fileId = location.state?.fileId;
    if (fileId) {
      loadDocument(fileId);
    }
  }, [location.state?.fileId]);

  const loadFolders = async () => {
    try {
      const f = await getFolders();
      setFolders(f);
    } catch (err) {
      console.error('Load folders error:', err);
    }
  };

  const loadAllFolders = async () => {
    try {
      const all = await getAllFolders();
      setAllFolders(all);
      
      // Charger les chemins pour chaque dossier
      const paths: Record<string, string> = {};
      for (const folder of all) {
        const path = await getFolderPathDisplay(folder.id);
        paths[folder.id] = path;
      }
      setFolderPaths(paths);
    } catch (err) {
      console.error('Load all folders error:', err);
    }
  };

  const getFolderPathDisplay = async (folderId: string): Promise<string> => {
    if (!folderId || folderId === '__root__') return 'Racine';
    
    try {
      const path = await getFolderPath(folderId);
      return path.map(f => f.name).join(' / ');
    } catch {
      return 'Dossier inconnu';
    }
  };

  const loadDocument = async (fileId: string) => {
    setLoading(true);
    try {
      const file = await getFile(fileId);
      if (file.name.endsWith('.json')) {
        const content = await getFileContent(file);
        const docData: DocumentData = JSON.parse(content);
        if (docData.type === 'rich-doc') {
          setTextContent(docData.textContent || '');
          setMedia(docData.media || []);
          setDocumentName(file.name.replace('.json', ''));
          setSelectedFolder(file.folder_id || '');
          setIsSaved(true);
          
          // Extraire et stocker le save_location dans localStorage
          const saveLocation = await getFileSaveLocation(file.name);
          const docMeta = {
            name: file.name.replace('.json', ''),
            folderId: file.folder_id || '',
            saveLocation: saveLocation || '',
          };
          localStorage.setItem('jux_current_doc', JSON.stringify(docMeta));
          
          // Add to recent files
          addToRecentFiles(fileId, file.name.replace('.json', ''), 'rich-doc', file.folder_id || '');
        }
      }
    } catch (err) {
      console.error('Load document error:', err);
    }
    setLoading(false);
  };

  // Add file to recent files list
  const addToRecentFiles = (fileId: string, fileName: string, type: 'rich-doc' | 'media' | 'other', folderId?: string) => {
    const newFile = {
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

  const handleTextContentChange = useCallback((newContent: string) => {
    setTextContent(newContent);
    setIsSaved(false);
  }, []);

  const handleAddMedia = (url: string) => {
    setMedia(prev => [...prev, url]);
    setIsSaved(false);
  };

  const saveDocument = async (isAutoSave = false) => {
    if (!documentName || !selectedFolder) return;
    setIsSaving(true);
    try {
      const docData: DocumentData = {
        type: 'rich-doc',
        textContent,
        media,
      };
      const jsonBlob = new Blob([JSON.stringify(docData)], { type: 'application/json' });
      const file = new File([jsonBlob], `${documentName}.json`, { type: 'application/json' });
      
      const existingFiles = await getFiles(selectedFolder === '__root__' ? '' : selectedFolder);
      const existingFile = existingFiles.find(f => f.name === `${documentName}.json`);
      
      if (existingFile) {
        await deleteFile(existingFile.id);
      }
      
      await uploadFile(file, selectedFolder === '__root__' ? '' : selectedFolder);
      
      // Obtenir le chemin complet pour save_location
      const fullPath = await getFolderPathById(selectedFolder === '__root__' ? '' : selectedFolder);
      const fullSavePath = `${fullPath}/${documentName}.json`;
      
      // Enregistrer l'emplacement de sauvegarde dans le champ save_location du fichier
      await setFileSaveLocation(`${documentName}.json`, fullSavePath);
      
      const docMeta = {
        name: documentName,
        folderId: selectedFolder === '__root__' ? '' : selectedFolder,
      };
      localStorage.setItem('jux_current_doc', JSON.stringify(docMeta));
      
      setIsSaved(true);
      setShowSaveDialog(false);
      
      // Afficher une notification de confirmation pour la première sauvegarde
      if (!isAutoSave) {
        setNotification(`Fichier enregistré avec succès dans ${fullSavePath}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Erreur lors de la sauvegarde: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    // Vérifier d'abord dans le champ save_location du fichier
    try {
      const saveLocation = await getFileSaveLocation(`${documentName}.json`);
      
      if (saveLocation) {
        // Si le fichier existe déjà (save_location contient une valeur)
        // Enregistrer automatiquement à l'emplacement spécifié
        
        // Extraire le folder_id du chemin complet
        // Le chemin est sous la forme "/Dossier/Sous-dossier/fichier.json"
        // On doit extraire le dernier dossier du chemin
        const pathParts = saveLocation.split('/');
        const fileName = pathParts.pop(); // Enlève le nom du fichier
        const folderPath = pathParts.join('/'); // Chemin du dossier
        
        // Trouver le folder_id correspondant au chemin
        // Pour simplifier, on utilise le selectedFolder actuel ou on cherche dans les dossiers
        if (selectedFolder) {
          saveDocument();
        } else {
          // Si pas de selectedFolder, on ne peut pas sauvegarder automatiquement
          // On affiche la boîte de dialogue pour sélectionner le dossier
          setIsFirstSave(true);
          setShowSaveDialog(true);
        }
        return;
      }
    } catch (err) {
      console.error('Check save location error:', err);
    }

    // Si aucun nom de fichier n'est défini, afficher la boîte de dialogue
    if (!documentName) {
      setIsFirstSave(true);
      setShowSaveDialog(true);
      return;
    }

    // Si save_location est vide (premier enregistrement)
    // Afficher un dialogue de configuration demandant le nom du fichier et le répertoire de destination
    setIsFirstSave(true);
    setShowSaveDialog(true);
  };

  const handleSaveDialog = () => {
    if (documentName && selectedFolder) {
      saveDocument();
    }
  };


  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification('');
      }, 3000); // 3 seconds
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Clear localStorage when exiting editor
  useEffect(() => {
    return () => {
      localStorage.removeItem('jux_current_doc');
    };
  }, []);


  return (
    <div className="min-h-screen bg-background">
      <header className="h-12 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground">
            RICH_EDITOR
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            {isSaved ? 'SAVED' : 'UNSAVED'}
          </span>
          {!isSaved && (
            <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4" />
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-[1px] bg-primary"
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: brandCurve }}
            className="max-w-4xl mx-auto"
          >
            <RichTextEditor
              content={textContent}
              onChange={handleTextContentChange}
              onAddMedia={() => setShowMediaPicker(true)}
            />
            <MediaGallery 
              media={media}
              onDelete={(url) => setMedia(media.filter(m => m !== url))}
            />
          </motion.div>
        )}
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sauvegarder le document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du fichier</Label>
              <Input
                id="name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Mon document"
              />
            </div>
            <div>
              <Label htmlFor="folder">Dossier</Label>
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un dossier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__root__">Racine</SelectItem>
                  {allFolders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folderPaths[folder.id] || folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveDialog} disabled={isSaving || !documentName || !selectedFolder}>
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MediaPicker
        open={showMediaPicker}
        onOpenChange={setShowMediaPicker}
        onSelect={handleAddMedia}
      />

      {/* Notification toast */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg text-sm font-medium"
        >
          {notification}
        </motion.div>
      )}
    </div>
  );
};

export default Editor;

