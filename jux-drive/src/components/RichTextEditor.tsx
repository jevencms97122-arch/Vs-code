import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Palette,
  Image as ImageIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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



  const execCommand = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);



  // Delete selected element
  const deleteSelectedElement = useCallback(() => {
    // Text selection delete only
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      onChange(editorRef.current!.innerHTML);
    }
  }, [onChange]);

  const setTextColor = (color: string) => {
    execCommand('foreColor', color);
  };







  return (
    <>
      <div className="border rounded-lg bg-card shadow-sm">
        {/* Toolbar */}
        <div className="border-b p-2 flex flex-wrap gap-1">
          <Button variant="ghost" size="sm" onClick={() => execCommand('bold')}>
            <Bold className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => execCommand('italic')}>
            <Italic className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => execCommand('underline')}>
            <UnderlineIcon className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button variant="ghost" size="sm" onClick={() => execCommand('formatBlock', 'h1')}>
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => execCommand('formatBlock', 'h2')}>
            <Heading2 className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button variant="ghost" size="sm" onClick={() => execCommand('insertUnorderedList')}>
            <List className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => execCommand('insertOrderedList')}>
            <ListOrdered className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <Palette className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40">
              <div className="grid grid-cols-4 gap-1">
                {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'].map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: color }}
                    onClick={() => setTextColor(color)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-6" />

          <Button variant="ghost" size="sm" onClick={onAddMedia}>
            <ImageIcon className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={deleteSelectedElement}
            disabled={!selectedElement}
          >
            <span className="w-4 h-4">🗑️</span>
          </Button>
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
          className="min-h-[500px] p-4 focus:outline-none prose prose-sm max-w-none"
          onInput={() => {
            if (editorRef.current) {
              onChange(editorRef.current.innerHTML);
            }
          }}
        />
      </div>

    </>
  );
};
