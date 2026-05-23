'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import { Extension } from '@tiptap/core'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, Heading3, Table as TableIcon,
  Indent, Outdent, Minus, RotateCcw, RotateCw,
  Type, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useEffect, useState, useRef } from 'react'

// ── Custom FontSize extension ────────────────────────────────────────────────
const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: el => el.style.fontSize?.replace('px', '') || null,
          renderHTML: attrs => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}px` } : {},
        },
      },
    }]
  },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }: any) =>
        chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }: any) =>
        chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    } as any
  },
})

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

const FONT_SIZES = ['10', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48']
const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Sans', value: 'Arial, sans-serif' },
  { label: 'Mono', value: 'monospace' },
]

export function RichTextEditor({ value, onChange, placeholder = 'Write your thoughts…' }: RichTextEditorProps) {
  const [fontSizeOpen, setFontSizeOpen] = useState(false)
  const [fontFamilyOpen, setFontFamilyOpen] = useState(false)
  const fontSizeRef = useRef<HTMLDivElement>(null)
  const fontFamilyRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'focus:outline-none prose prose-sm max-w-none' },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!fontSizeRef.current?.contains(e.target as Node)) setFontSizeOpen(false)
      if (!fontFamilyRef.current?.contains(e.target as Node)) setFontFamilyOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!editor) return null

  const Btn = ({ onClick, active, title, children }: {
    onClick: () => void; active?: boolean; title: string; children: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'w-7 h-7 flex items-center justify-center rounded transition-colors flex-shrink-0',
        active ? 'bg-amber-warm text-white' : 'text-ink-400 hover:bg-paper-300'
      )}
    >
      {children}
    </button>
  )

  const Divider = () => <div className="w-px h-5 bg-paper-400 mx-0.5 flex-shrink-0" />

  // Detect current font size from selection
  const currentFontSize = editor.getAttributes('textStyle').fontSize ?? '16'

  return (
    <div className="rounded-xl border border-paper-400 bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 px-2 py-1.5 border-b border-paper-400 bg-paper-50">

        {/* Undo / Redo */}
        <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo" active={false}>
          <RotateCcw size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo" active={false}>
          <RotateCw size={13} />
        </Btn>
        <Divider />

        {/* Font family */}
        <div ref={fontFamilyRef} className="relative">
          <button
            type="button"
            onClick={() => { setFontFamilyOpen(v => !v); setFontSizeOpen(false) }}
            className="flex items-center gap-0.5 h-7 px-1.5 rounded text-ink-400 hover:bg-paper-300 text-xs font-sans"
            title="Font family"
          >
            <Type size={12} />
            <ChevronDown size={10} />
          </button>
          {fontFamilyOpen && (
            <div className="absolute top-8 left-0 z-50 bg-white border border-paper-400 rounded-xl shadow-warm-md min-w-[120px]">
              {FONT_FAMILIES.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => {
                    f.value
                      ? (editor.chain().focus() as any).setFontFamily(f.value).run()
                      : (editor.chain().focus() as any).unsetFontFamily().run()
                    setFontFamilyOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-paper-300"
                  style={{ fontFamily: f.value || undefined }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font size */}
        <div ref={fontSizeRef} className="relative">
          <button
            type="button"
            onClick={() => { setFontSizeOpen(v => !v); setFontFamilyOpen(false) }}
            className="flex items-center gap-0.5 h-7 px-1.5 rounded text-ink-400 hover:bg-paper-300 text-xs font-sans min-w-[36px]"
            title="Font size"
          >
            {currentFontSize}
            <ChevronDown size={10} />
          </button>
          {fontSizeOpen && (
            <div className="absolute top-8 left-0 z-50 bg-white border border-paper-400 rounded-xl shadow-warm-md min-w-[60px] max-h-48 overflow-y-auto">
              {FONT_SIZES.map(sz => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => {
                    ;(editor.chain().focus() as any).setFontSize(sz).run()
                    setFontSizeOpen(false)
                  }}
                  className={cn(
                    'block w-full text-left px-3 py-1.5 text-sm hover:bg-paper-300',
                    currentFontSize === sz && 'font-bold text-amber-warm'
                  )}
                >
                  {sz}
                </button>
              ))}
            </div>
          )}
        </div>
        <Divider />

        {/* Headings */}
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <Heading1 size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 size={13} />
        </Btn>
        <Divider />

        {/* Text formatting */}
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <UnderlineIcon size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
          <Code size={13} />
        </Btn>
        <Divider />

        {/* Lists */}
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          <List size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
          <ListOrdered size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().sinkListItem('listItem').run()} title="Indent" active={false}>
          <Indent size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().liftListItem('listItem').run()} title="Outdent" active={false}>
          <Outdent size={13} />
        </Btn>
        <Divider />

        {/* Alignment */}
        <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
          <AlignLeft size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center">
          <AlignCenter size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">
          <AlignRight size={13} />
        </Btn>
        <Divider />

        {/* Table */}
        <Btn
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          title="Insert table"
          active={editor.isActive('table')}
        >
          <TableIcon size={13} />
        </Btn>
        <Divider />

        {/* Horizontal rule */}
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule" active={false}>
          <Minus size={13} />
        </Btn>
      </div>

      {/* Editor area */}
      <div className="px-4 py-3 min-h-[120px]">
        <EditorContent editor={editor} />
      </div>

      <style>{`
        .ProseMirror table { border-collapse: collapse; width: 100%; margin: 0.5em 0; }
        .ProseMirror td, .ProseMirror th { border: 1px solid #d4c9b0; padding: 4px 8px; min-width: 60px; }
        .ProseMirror th { background: #f5f0e8; font-weight: 600; }
        .ProseMirror p.is-editor-empty:first-child::before { color: #aaa; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
      `}</style>
    </div>
  )
}
