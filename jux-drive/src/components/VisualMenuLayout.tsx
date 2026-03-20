import { useState } from 'react';
import {
  FileText,
  Save as SaveIcon,
  Download,
  Printer,
  Undo,
  Redo,
  Trash2,
  Eye,
  EyeOff,
  ZoomIn,
  Maximize,
  Grid,
  Plus,
  ImageIcon,
  Grid3x3,
  Bold,
  Heading1,
  List,
  AlignLeft,
  Indent,
  Palette,
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
  ZoomOut,
  Minimize,
  Grid3x3 as Grid3x3Icon,
  Square,
  SquareDashed,
  SquareDot,
  SquareSplitHorizontal,
  SquareSplitVertical,
  File,
  FilePlus,
  Folder,
  RotateCcw,
  RotateCw,
  Underline as UnderlineIcon,
  Strikethrough,
  Italic,
  ListOrdered,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Outdent,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  FileText as FileTextIcon,
  Save as SaveIconComponent,
  Download as DownloadIcon,
  Printer as PrinterIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  RotateCcw as RotateCcwIcon,
  RotateCw as RotateCwIcon,
  Trash2 as Trash2Icon,
  Eye as EyeIconComponent,
  EyeOff as EyeOffIconComponent,
  File as FileIcon,
  FilePlus as FilePlusIcon,
  Folder as FolderIcon,
  Settings as SettingsIcon,
  MoreHorizontal as MoreHorizontalIcon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIconComponent,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Maximize as MaximizeIcon,
  Minimize as MinimizeIcon,
  Grid as GridIcon,
  Grid3x3 as Grid3x3IconComponent,
  Square as SquareIcon,
  SquareDashed as SquareDashedIcon,
  SquareDot as SquareDotIcon,
  SquareSplitHorizontal as SquareSplitHorizontalIcon,
  SquareSplitVertical as SquareSplitVerticalIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface VisualMenuLayoutProps {
  onAction?: (action: string) => void;
}

export const VisualMenuLayout = ({ onAction }: VisualMenuLayoutProps) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleAction = (action: string) => {
    onAction?.(action);
    console.log(`Action: ${action}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-card border rounded-lg shadow-lg overflow-hidden">
        {/* Barre de menu principale */}
        <div className="bg-background border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo/Brand */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">Jux Editor</span>
            </div>

            {/* Menu Fichier */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="group"
                  onMouseEnter={() => setActiveMenu('fichier')}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Fichier
                  <ChevronDown className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('nouveau')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <File className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Nouveau</div>
                      <div className="text-xs text-muted-foreground">Créer un nouveau document</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('ouvrir')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <FolderIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Ouvrir</div>
                      <div className="text-xs text-muted-foreground">Ouvrir un document existant</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('sauvegarder')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <SaveIconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Sauvegarder</div>
                      <div className="text-xs text-muted-foreground">Enregistrer le document</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('telecharger')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <DownloadIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Télécharger / Exporter</div>
                      <div className="text-xs text-muted-foreground">Exporter le document</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('imprimer')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <PrinterIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Imprimer</div>
                      <div className="text-xs text-muted-foreground">Imprimer le document</div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Menu Édition */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="group"
                  onMouseEnter={() => setActiveMenu('edition')}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Bold className="w-4 h-4 mr-2" />
                  Édition
                  <ChevronDown className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('annuler')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Undo className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Annuler (Ctrl+Z)</div>
                      <div className="text-xs text-muted-foreground">Revenir en arrière</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('refaire')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Redo className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Rétablir (Ctrl+Y)</div>
                      <div className="text-xs text-muted-foreground">Refaire l'action</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('supprimer')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Trash2Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Supprimer</div>
                      <div className="text-xs text-muted-foreground">Supprimer la sélection</div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Menu Affichage */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="group"
                  onMouseEnter={() => setActiveMenu('affichage')}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <EyeIconComponent className="w-4 h-4 mr-2" />
                  Affichage
                  <ChevronDown className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('aperçu')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <EyeIconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Aperçu</div>
                      <div className="text-xs text-muted-foreground">Mode aperçu</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('zoom-avant')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <ZoomInIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Zoom avant</div>
                      <div className="text-xs text-muted-foreground">Agrandir l'affichage</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('plein-écran')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <MaximizeIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Mode plein écran</div>
                      <div className="text-xs text-muted-foreground">Plein écran</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('grille')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <GridIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Grille / Mise en page</div>
                      <div className="text-xs text-muted-foreground">Afficher la grille</div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Menu Insertion */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="group"
                  onMouseEnter={() => setActiveMenu('insertion')}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Insertion
                  <ChevronDown className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('ajouter-element')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <PlusIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Ajouter un élément</div>
                      <div className="text-xs text-muted-foreground">Insérer un nouvel élément</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('image')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Image</div>
                      <div className="text-xs text-muted-foreground">Insérer une image</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('tableau')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Grid3x3IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Tableau</div>
                      <div className="text-xs text-muted-foreground">Insérer un tableau</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('nouveau-bloc')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <FilePlusIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Nouveau bloc/page</div>
                      <div className="text-xs text-muted-foreground">Ajouter un nouveau bloc</div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Menu Format */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="group"
                  onMouseEnter={() => setActiveMenu('format')}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Bold className="w-4 h-4 mr-2" />
                  Format
                  <ChevronDown className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('gras')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Bold className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Gras</div>
                      <div className="text-xs text-muted-foreground">Mettre en gras</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('titre')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Heading1 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Titre (H1)</div>
                      <div className="text-xs text-muted-foreground">Style titre</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('liste-puces')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <List className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Liste à puces</div>
                      <div className="text-xs text-muted-foreground">Liste avec puces</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('alignement')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <AlignLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Alignement</div>
                      <div className="text-xs text-muted-foreground">Aligner le texte</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('retrait')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Indent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Retrait / Indentation</div>
                      <div className="text-xs text-muted-foreground">Modifier l'indentation</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('couleur')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Couleur / Palette</div>
                      <div className="text-xs text-muted-foreground">Choisir une couleur</div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Menu Outils */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="group"
                  onMouseEnter={() => setActiveMenu('outils')}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Outils
                  <ChevronDown className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('parametres')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <SettingsIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Paramètres</div>
                      <div className="text-xs text-muted-foreground">Configurer les options</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('options-avancees')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <MoreHorizontalIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Options avancées</div>
                      <div className="text-xs text-muted-foreground">Options supplémentaires</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('selection')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <SquareDashedIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Sélection</div>
                      <div className="text-xs text-muted-foreground">Outils de sélection</div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Menu Extensions */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="group"
                  onMouseEnter={() => setActiveMenu('extensions')}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <MoreHorizontalIcon className="w-4 h-4 mr-2" />
                  Extensions
                  <ChevronDown className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="text-center text-muted-foreground py-4">
                    Section vide pour le moment<br />
                    <span className="text-sm">Prête à accueillir de nouvelles icônes</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-secondary cursor-pointer" onClick={() => handleAction('extensions')}>
                    <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
                      <MoreHorizontalIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Extensions</div>
                      <div className="text-xs text-muted-foreground">Gérer les extensions</div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Indicateur de menu actif */}
          {activeMenu && (
            <div className="text-xs text-muted-foreground">
              Menu {activeMenu} actif
            </div>
          )}
        </div>

        {/* Zone de contenu de démonstration */}
        <div className="p-6 bg-background/50 min-h-[400px]">
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Zone de démonstration</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Nouveau document</Button>
                <Button size="sm">Commencer à éditer</Button>
              </div>
            </div>
            
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center text-muted-foreground">
              <div className="text-4xl mb-2">📝</div>
              <div className="font-medium">Votre document apparaîtra ici</div>
              <div className="text-sm mt-1">Utilisez les menus ci-dessus pour explorer les fonctionnalités</div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-secondary rounded-lg p-4">
                <div className="font-medium mb-2">Fonctionnalités Fichier</div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Nouveau document</li>
                  <li>• Ouvrir un document</li>
                  <li>• Sauvegarder</li>
                  <li>• Exporter/Importer</li>
                  <li>• Imprimer</li>
                </ul>
              </div>

              <div className="bg-secondary rounded-lg p-4">
                <div className="font-medium mb-2">Fonctionnalités Édition</div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Annuler/Refaire</li>
                  <li>• Supprimer</li>
                  <li>• Copier/Coller</li>
                  <li>• Rechercher</li>
                  <li>• Remplacer</li>
                </ul>
              </div>

              <div className="bg-secondary rounded-lg p-4">
                <div className="font-medium mb-2">Fonctionnalités Format</div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Styles de texte</li>
                  <li>• Alignement</li>
                  <li>• Couleurs</li>
                  <li>• Polices</li>
                  <li>• Espacement</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Barre d'état */}
        <div className="bg-background border-t px-4 py-2 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Mode édition</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Zoom: 100%</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Pages: 1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Connecté</span>
          </div>
        </div>
      </div>

      {/* Légende des icônes */}
      <div className="mt-6 bg-card border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Légende des icônes par catégorie</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-medium text-primary mb-2">📄 Fichier</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Nouveau</div>
              <div className="flex items-center gap-2"><FolderIcon className="w-4 h-4" /> Ouvrir</div>
              <div className="flex items-center gap-2"><SaveIconComponent className="w-4 h-4" /> Sauvegarder</div>
              <div className="flex items-center gap-2"><DownloadIcon className="w-4 h-4" /> Télécharger</div>
              <div className="flex items-center gap-2"><PrinterIcon className="w-4 h-4" /> Imprimer</div>
            </div>
          </div>

          <div>
            <div className="font-medium text-primary mb-2">📝 Édition</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2"><Undo className="w-4 h-4" /> Annuler</div>
              <div className="flex items-center gap-2"><Redo className="w-4 h-4" /> Rétablir</div>
              <div className="flex items-center gap-2"><Trash2Icon className="w-4 h-4" /> Supprimer</div>
            </div>
          </div>

          <div>
            <div className="font-medium text-primary mb-2">👁️ Affichage</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2"><EyeIconComponent className="w-4 h-4" /> Aperçu</div>
              <div className="flex items-center gap-2"><ZoomInIcon className="w-4 h-4" /> Zoom avant</div>
              <div className="flex items-center gap-2"><MaximizeIcon className="w-4 h-4" /> Plein écran</div>
              <div className="flex items-center gap-2"><GridIcon className="w-4 h-4" /> Grille</div>
            </div>
          </div>

          <div>
            <div className="font-medium text-primary mb-2">➕ Insertion</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2"><PlusIcon className="w-4 h-4" /> Ajouter élément</div>
              <div className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Image</div>
              <div className="flex items-center gap-2"><Grid3x3IconComponent className="w-4 h-4" /> Tableau</div>
              <div className="flex items-center gap-2"><FilePlusIcon className="w-4 h-4" /> Nouveau bloc</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};