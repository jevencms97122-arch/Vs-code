import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Palette,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  Undo,
  Redo,
  FileText,
  Save as SaveIcon,
  Download,
  Printer,
  Plus,
  Minus,
  RotateCcw,
  RotateCw,
  Trash2,
  Eye,
  EyeOff,
  File,
  FilePlus,
  Folder,
  Settings,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight as ArrowRightIcon,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Grid,
  Grid3x3,
  Square,
  SquareDashed,
  SquareDot,
  SquareSplitHorizontal,
  SquareSplitVertical,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ImagePickerDialog } from '@/components/ImagePickerDialog';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onAddMedia?: () => void;
}

export const RichTextEditor = ({ content, onChange, onAddMedia }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const initialContentSet = useRef(false);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const savedSelectionRef = useRef<Range | null>(null);

  // Save selection before menu interaction
  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      // Only save if selection is within editor
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        savedSelectionRef.current = range.cloneRange();
        return true;
      }
    }
    return false;
  }, []);

  // Restore selection and execute command
  const restoreSelectionAndExecute = useCallback((command: string, value?: string) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    // Restore the saved selection
    if (savedSelectionRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }
    }
    
    // Execute command on selected text
    document.execCommand(command, false, value);
    onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    // Ensure focus on editor
    if (editorRef.current) {
      editorRef.current.focus();
      // Small delay to ensure focus is applied
      setTimeout(() => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      }, 0);
    }
  }, [onChange]);

  // Safe command execution with proper focus handling
  const safeExecCommand = useCallback((command: string, value?: string) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    // Put cursor at the end if no selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString() === '') {
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    
    document.execCommand(command, false, value);
    onChange(editorRef.current!.innerHTML);
  }, [onChange]);

  // Helper function for menu item clicks
  const handleMenuClick = useCallback((callback: () => void) => {
    return () => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
      setTimeout(() => {
        callback();
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      }, 0);
    };
  }, [onChange]);

  // Command handler that ensures focus on editor
  const handleCommand = useCallback((command: string, value?: string) => {
    return () => {
      restoreSelectionAndExecute(command, value);
    };
  }, [restoreSelectionAndExecute]);

  // Direct focus and execute
  const focusAndExecute = useCallback((command: string, value?: string) => {
    restoreSelectionAndExecute(command, value);
  }, [restoreSelectionAndExecute]);

  const setFontSize = (size: string) => {
    editorRef.current?.focus();
    document.execCommand('fontSize', false, size);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const setTextColor = (color: string) => {
    execCommand('foreColor', color);
  };

  const insertTable = (rows: number, cols: number) => {
    const table = document.createElement('table');
    table.className = 'border border-border';
    for (let r = 0; r < rows; r++) {
      const tr = document.createElement('tr');
      for (let c = 0; c < cols; c++) {
        const td = document.createElement('td');
        td.className = 'border border-border p-2';
        td.innerHTML = '&nbsp;';
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.insertNode(table);
      onChange(editorRef.current!.innerHTML);
    }
  };

  const deleteSelectedElement = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      onChange(editorRef.current!.innerHTML);
    }
  }, [onChange]);

  // Actions for File menu
  const handleNewDocument = () => {
    if (confirm('Êtes-vous sûr de vouloir créer un nouveau document?')) {
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
        onChange('');
      }
    }
  };

  const handlePrint = () => {
    const printContent = editorRef.current?.innerHTML || '';
    const printWindow = window.open('', '', 'width=900,height=700');
    if (printWindow) {
      printWindow.document.write(`<html><head><title>Imprimer</title></head><body>${printContent}</body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleExport = () => {
    const content = editorRef.current?.innerHTML || '';
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', 'document.html');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Actions for View menu
  const handleFullscreen = () => {
    const editor = editorRef.current;
    if (editor) {
      if (!document.fullscreenElement) {
        editor.requestFullscreen?.().catch(err => console.error(err));
      } else {
        document.exitFullscreen?.();
      }
    }
  };

  const handleZoomIn = () => {
    if (editorRef.current) {
      const currentZoom = parseFloat(editorRef.current.style.zoom || '1');
      editorRef.current.style.zoom = (currentZoom + 0.1).toString();
    }
  };

  const handleZoomOut = () => {
    if (editorRef.current) {
      const currentZoom = parseFloat(editorRef.current.style.zoom || '1');
      if (currentZoom > 0.5) {
        editorRef.current.style.zoom = (currentZoom - 0.1).toString();
      }
    }
  };

  return (
    <div className="border rounded-lg bg-card shadow-sm flex flex-col h-screen md:h-auto">
      {/* Navbar responsive */}
      <div className="bg-background border-b px-2 md:px-4 py-2 sticky top-0 z-50">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm md:text-lg hidden sm:inline">Jux Editor</span>
          </div>

          {/* Desktop Menu - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-1 flex-wrap flex-grow">
            {/* Menu Fichier */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="group text-xs md:text-sm">
                  <FileText className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden lg:inline">Fichier</span>
                  <ChevronDown className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 md:w-64 p-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleNewDocument}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <File className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Nouveau</div>
                      <div className="text-xs text-muted-foreground">Créer un nouveau document</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => { /*Open file handler*/ }}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Folder className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Ouvrir</div>
                      <div className="text-xs text-muted-foreground">Ouvrir un document existant</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => { /*Save handler*/ }}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <SaveIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Sauvegarder</div>
                      <div className="text-xs text-muted-foreground">Enregistrer le document</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleExport}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Télécharger</div>
                      <div className="text-xs text-muted-foreground">Exporter le document</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handlePrint}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Imprimer</div>
                      <div className="text-xs text-muted-foreground">Imprimer le document</div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Menu Édition */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="group text-xs md:text-sm">
                  <Bold className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden lg:inline">Édition</span>
                  <ChevronDown className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 md:w-64 p-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleCommand('undo')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Undo className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Annuler (Ctrl+Z)</div>
                      <div className="text-xs text-muted-foreground">Revenir en arrière</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleCommand('redo')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Redo className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Rétablir (Ctrl+Y)</div>
                      <div className="text-xs text-muted-foreground">Refaire l'action</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={deleteSelectedElement}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Supprimer</div>
                      <div className="text-xs text-muted-foreground">Supprimer la sélection</div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Menu Format */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="group text-xs md:text-sm">
                  <Bold className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden lg:inline">Format</span>
                  <ChevronDown className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 md:w-64 p-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleCommand('bold')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Bold className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Gras</div>
                      <div className="text-xs text-muted-foreground">Mettre en gras (Ctrl+B)</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleCommand('italic')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Italic className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Italique</div>
                      <div className="text-xs text-muted-foreground">Mettre en italique (Ctrl+I)</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleCommand('underline')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <UnderlineIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Souligné</div>
                      <div className="text-xs text-muted-foreground">Souligner le texte (Ctrl+U)</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleCommand('strikeThrough')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Strikethrough className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Barré</div>
                      <div className="text-xs text-muted-foreground">Ajouter une ligne de barrure</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleCommand('formatBlock', 'h1')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Heading1 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Titre (H1)</div>
                      <div className="text-xs text-muted-foreground">Style titre principal</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleCommand('formatBlock', 'h2')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Heading2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Titre (H2)</div>
                      <div className="text-xs text-muted-foreground">Style titre secondaire</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleCommand('formatBlock', 'h3')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Heading3 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Titre (H3)</div>
                      <div className="text-xs text-muted-foreground">Style titre tertiaire</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleCommand('insertUnorderedList')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <List className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Liste à puces</div>
                      <div className="text-xs text-muted-foreground">Créer une liste à puces</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleCommand('insertOrderedList')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <ListOrdered className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Liste numérotée</div>
                      <div className="text-xs text-muted-foreground">Créer une liste numérotée</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleCommand('justifyLeft')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <AlignLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Aligner à gauche</div>
                      <div className="text-xs text-muted-foreground">Aligner le texte</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleCommand('justifyCenter')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <AlignCenter className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Centrer</div>
                      <div className="text-xs text-muted-foreground">Centrer le texte</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleCommand('justifyRight')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <AlignRight className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Aligner à droite</div>
                      <div className="text-xs text-muted-foreground">Aligner à droite</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleCommand('justifyFull')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <AlignJustify className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Justifier</div>
                      <div className="text-xs text-muted-foreground">Justifier le texte</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleCommand('indent')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Indent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Augmenter retrait</div>
                      <div className="text-xs text-muted-foreground">Augmenter l'indentation</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleCommand('outdent')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Outdent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Réduire retrait</div>
                      <div className="text-xs text-muted-foreground">Réduire l'indentation</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => { const color = prompt('Couleur (ex: #FF0000 ou red):'); if (color) setTextColor(color); }}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Couleur texte</div>
                      <div className="text-xs text-muted-foreground">Changer la couleur</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => execCommand('removeFormat')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Effacer format</div>
                      <div className="text-xs text-muted-foreground">Supprimer le formatage</div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Menu Insertion */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="group text-xs md:text-sm">
                  <Plus className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden lg:inline">Insertion</span>
                  <ChevronDown className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 md:w-64 p-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={onAddMedia}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Ajouter élément</div>
                      <div className="text-xs text-muted-foreground">Insérer un nouvel élément</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={onAddMedia}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Image</div>
                      <div className="text-xs text-muted-foreground">Insérer une image</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => insertTable(3, 3)}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Grid3x3 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Tableau</div>
                      <div className="text-xs text-muted-foreground">Insérer un tableau</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => { const link = prompt('URL de la vidéo:'); if (link) { execCommand('insertHTML', `<iframe width="400" height="300" src="${link}" frameborder="0" allowfullscreen></iframe>`); } }}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <FilePlus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Vidéo / Média</div>
                      <div className="text-xs text-muted-foreground">Insérer une vidéo</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => { const hr = document.createElement('hr'); editorRef.current?.appendChild(hr); onChange(editorRef.current?.innerHTML || ''); }}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Minus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Ligne horizontale</div>
                      <div className="text-xs text-muted-foreground">Insérer une séparation</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => focusAndExecute('insertParagraph')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Nouveau paragraphe</div>
                      <div className="text-xs text-muted-foreground">Ajouter un nouveau bloc</div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Menu Affichage */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="group text-xs md:text-sm">
                  <Eye className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden lg:inline">Affichage</span>
                  <ChevronDown className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 md:w-64 p-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleZoomIn}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Zoom avant</div>
                      <div className="text-xs text-muted-foreground">Agrandir l'affichage</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleZoomOut}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <ZoomOut className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Zoom arrière</div>
                      <div className="text-xs text-muted-foreground">Réduire l'affichage</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => { if (editorRef.current) editorRef.current.style.zoom = '1'; }}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Maximize className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Réinitialiser zoom</div>
                      <div className="text-xs text-muted-foreground">Revenir au zoom 100%</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={handleFullscreen}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Maximize className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Plein écran</div>
                      <div className="text-xs text-muted-foreground">Mode plein écran (F11)</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer">
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Mode lecture</div>
                      <div className="text-xs text-muted-foreground">Affichage sans édition</div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Menu Outils */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="group text-xs md:text-sm">
                  <Settings className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden lg:inline">Outils</span>
                  <ChevronDown className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 md:w-64 p-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => execCommand('removeFormat')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Effacer le format</div>
                      <div className="text-xs text-muted-foreground">Supprimer tout formatage</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => { const html = prompt('Entrez le code HTML:'); if (html && editorRef.current) { editorRef.current.innerHTML = html; onChange(html); } }}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Code source</div>
                      <div className="text-xs text-muted-foreground">Éditer le code HTML</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => { const link = prompt('URL du lien:'); if (link && link.trim()) { execCommand('createLink', link); } }}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <MoreHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Insérer lien</div>
                      <div className="text-xs text-muted-foreground">Créer un lien hypertexte</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => { const size = prompt('Largeur (px):'); if (size && editorRef.current) { editorRef.current.style.maxWidth = size + 'px'; } }}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Largeur du texte</div>
                      <div className="text-xs text-muted-foreground">Définir la largeur maximale</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => { alert('Statistiques du document:\\nCaractères: ' + (editorRef.current?.innerText.length || 0) + '\\nMots: ' + (editorRef.current?.innerText.split(/\\s+/).length || 0)); }}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <MoreHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Statistiques</div>
                      <div className="text-xs text-muted-foreground">Afficher les statistiques</div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Menu Extensions */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="group text-xs md:text-sm">
                  <MoreHorizontal className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden lg:inline">Extensions</span>
                  <ChevronDown className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 md:w-64 p-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="text-center text-muted-foreground py-4">
                    Section vide pour le moment<br />
                    <span className="text-xs">Prête à accueillir de nouvelles extensions</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden ml-auto">
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-4">
              <div className="space-y-4">
                {/* Fichier Section */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Fichier
                  </h3>
                  <div className="space-y-1 ml-6">
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { handleNewDocument(); setMobileMenuOpen(false); }}>
                      <File className="w-4 h-4" />
                      <span>Nouveau</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { setMobileMenuOpen(false); /*Open handler*/ }}>
                      <Folder className="w-4 h-4" />
                      <span>Ouvrir</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { setMobileMenuOpen(false); /*Save handler*/ }}>
                      <SaveIcon className="w-4 h-4" />
                      <span>Sauvegarder</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { handleExport(); setMobileMenuOpen(false); }}>
                      <Download className="w-4 h-4" />
                      <span>Exporter</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { handlePrint(); setMobileMenuOpen(false); }}>
                      <Printer className="w-4 h-4" />
                      <span>Imprimer</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Édition Section */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Bold className="w-4 h-4" />
                    Édition
                  </h3>
                  <div className="space-y-1 ml-6">
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { focusAndExecute('undo'); setMobileMenuOpen(false); }}>
                      <Undo className="w-4 h-4" />
                      <span>Annuler</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { focusAndExecute('redo'); setMobileMenuOpen(false); }}>
                      <Redo className="w-4 h-4" />
                      <span>Rétablir</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { deleteSelectedElement(); setMobileMenuOpen(false); }}>
                      <Trash2 className="w-4 h-4" />
                      <span>Supprimer</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Format Section */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Bold className="w-4 h-4" />
                    Format
                  </h3>
                  <div className="space-y-1 ml-6">
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { focusAndExecute('bold'); setMobileMenuOpen(false); }}>
                      <Bold className="w-4 h-4" />
                      <span>Gras</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { focusAndExecute('italic'); setMobileMenuOpen(false); }}>
                      <Italic className="w-4 h-4" />
                      <span>Italique</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { focusAndExecute('underline'); setMobileMenuOpen(false); }}>
                      <UnderlineIcon className="w-4 h-4" />
                      <span>Souligné</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { focusAndExecute('strikeThrough'); setMobileMenuOpen(false); }}>
                      <Strikethrough className="w-4 h-4" />
                      <span>Barré</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { focusAndExecute('formatBlock', 'h1'); setMobileMenuOpen(false); }}>
                      <Heading1 className="w-4 h-4" />
                      <span>Titre</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { focusAndExecute('insertUnorderedList'); setMobileMenuOpen(false); }}>
                      <List className="w-4 h-4" />
                      <span>Liste</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { focusAndExecute('justifyLeft'); setMobileMenuOpen(false); }}>
                      <AlignLeft className="w-4 h-4" />
                      <span>Aligner</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { focusAndExecute('indent'); setMobileMenuOpen(false); }}>
                      <Indent className="w-4 h-4" />
                      <span>Retrait</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { const color = prompt('Couleur:'); if (color) { setTextColor(color); setMobileMenuOpen(false); } }}>
                      <Palette className="w-4 h-4" />
                      <span>Couleur</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { execCommand('removeFormat'); setMobileMenuOpen(false); }}>
                      <Trash2 className="w-4 h-4" />
                      <span>Effacer format</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Insertion Section */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Insertion
                  </h3>
                  <div className="space-y-1 ml-6">
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { onAddMedia?.(); setMobileMenuOpen(false); }}>
                      <Plus className="w-4 h-4" />
                      <span>Ajouter élément</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { onAddMedia?.(); setMobileMenuOpen(false); }}>
                      <ImageIcon className="w-4 h-4" />
                      <span>Image</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { insertTable(3, 3); setMobileMenuOpen(false); }}>
                      <Grid3x3 className="w-4 h-4" />
                      <span>Tableau</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { const link = prompt('URL vidéo:'); if (link) { execCommand('insertHTML', `<iframe width="400" height="300" src="${link}" frameborder="0"></iframe>`); setMobileMenuOpen(false); } }}>
                      <FilePlus className="w-4 h-4" />
                      <span>Vidéo/Média</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Affichage Section */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Affichage
                  </h3>
                  <div className="space-y-1 ml-6">
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { handleZoomIn(); setMobileMenuOpen(false); }}>
                      <ZoomIn className="w-4 h-4" />
                      <span>Zoom avant</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { handleZoomOut(); setMobileMenuOpen(false); }}>
                      <ZoomOut className="w-4 h-4" />
                      <span>Zoom arrière</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { if (editorRef.current) editorRef.current.style.zoom = '1'; setMobileMenuOpen(false); }}>
                      <Maximize className="w-4 h-4" />
                      <span>Réinitialiser</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { handleFullscreen(); setMobileMenuOpen(false); }}>
                      <Maximize className="w-4 h-4" />
                      <span>Plein écran</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Outils Section */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Outils
                  </h3>
                  <div className="space-y-1 ml-6">
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { execCommand('removeFormat'); setMobileMenuOpen(false); }}>
                      <Trash2 className="w-4 h-4" />
                      <span>Effacer format</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { const link = prompt('URL lien:'); if (link) { execCommand('createLink', link); setMobileMenuOpen(false); } }}>
                      <MoreHorizontal className="w-4 h-4" />
                      <span>Insérer lien</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded hover:bg-secondary cursor-pointer text-sm" onClick={() => { alert('Caractères: ' + (editorRef.current?.innerText.length || 0) + '\\nMots: ' + (editorRef.current?.innerText.split(/\\s+/).length || 0)); setMobileMenuOpen(false); }}>
                      <FileText className="w-4 h-4" />
                      <span>Statistiques</span>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Editor Content */}
      <div
        ref={(el) => {
          (editorRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          if (el && !initialContentSet.current) {
            el.innerHTML = content;
            initialContentSet.current = true;
          }
        }}
        contentEditable
        suppressContentEditableWarning
        className="flex-grow p-3 md:p-4 lg:p-6 focus:outline-none prose prose-sm max-w-none overflow-auto"
        onInput={() => {
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        }}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
      />
    </div>
  );
};
