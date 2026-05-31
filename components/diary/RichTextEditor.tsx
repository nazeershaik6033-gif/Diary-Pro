'use client'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { Extension } from '@tiptap/core'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  RotateCcw, RotateCw, ChevronDown, Table as TableIcon,
  Minus, Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useEffect, useState, useRef } from 'react'

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

const FONT_SIZES = ['10', '11', '12', '13', '14', '15', '16', '18', '20', '22', '24', '28', '32', '36', '42', '48', '56', '64', '72']

const FONT_FAMILIES = [
  { label: 'Default',         value: '' },
  { label: 'Serif',           value: 'Georgia, "Times New Roman", serif' },
  { label: 'Sans-serif',      value: '"Arial", "Helvetica Neue", sans-serif' },
  { label: 'Monospace',       value: '"Courier New", "Courier", monospace' },
  { label: 'Cursive',         value: '"Dancing Script", "Segoe Script", cursive' },
  { label: 'Palatino',        value: '"Palatino Linotype", "Book Antiqua", Palatino, serif' },
  { label: 'Verdana',         value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet',       value: '"Trebuchet MS", Helvetica, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Garamond',        value: 'Garamond, "EB Garamond", serif' },
  { label: 'Tahoma',          value: 'Tahoma, Geneva, sans-serif' },
  { label: 'Impact',          value: 'Impact, Charcoal, sans-serif' },
]

const HEADINGS = [
  { label: 'Normal',    level: 0 },
  { label: 'H1 — Large',  level: 1 },
  { label: 'H2 — Medium', level: 2 },
  { label: 'H3 — Small',  level: 3 },
] as const

export function RichTextEditor({ value, onChange, placeholder = 'Write your thoughts…' }: RichTextEditorProps) {
  const [headingOpen,    setHeadingOpen]    = useState(false)
  const [fontSizeOpen,   setFontSizeOpen]   = useState(false)
  const [fontFamilyOpen, setFontFamilyOpen] = useState(false)
  const [tableOpen,      setTableOpen]      = useState(false)
  const [tableRows,      setTableRows]      = useState('3')
  const [tableCols,      setTableCols]      = useState('3')

  const headingRef    = useRef<HTMLDivElement>(null)
  const fontSizeRef   = useRef<HTMLDivElement>(null)
  const fontFamilyRef = useRef<HTMLDivElement>(null)
  const tableRef      = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder }),
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'focus:outline-none' },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!headingRef.current?.contains(e.target as Node))    setHeadingOpen(false)
      if (!fontSizeRef.current?.contains(e.target as Node))   setFontSizeOpen(false)
      if (!fontFamilyRef.current?.contains(e.target as Node)) setFontFamilyOpen(false)
      if (!tableRef.current?.contains(e.target as Node))      setTableOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!editor) return null

  const currentFontSize   = editor.getAttributes('textStyle').fontSize ?? '16'
  const currentFontFamily = editor.getAttributes('textStyle').fontFamily ?? ''
  const currentFontLabel  = FONT_FAMILIES.find(f => f.value === currentFontFamily)?.label ?? 'Font'
  const currentHeading    = editor.isActive('heading', { level: 1 }) ? 'H1'
    : editor.isActive('heading', { level: 2 }) ? 'H2'
    : editor.isActive('heading', { level: 3 }) ? 'H3'
    : 'Normal'

  function adjustSize(delta: number) {
    const idx  = FONT_SIZES.indexOf(currentFontSize)
    const next = FONT_SIZES[Math.min(Math.max((idx === -1 ? FONT_SIZES.indexOf('16') : idx) + delta, 0), FONT_SIZES.length - 1)]
    if (next && editor) (editor.chain().focus() as any).setFontSize(next).run()
  }

  function insertTable() {
    const r = Math.max(1, parseInt(tableRows) || 3)
    const c = Math.max(1, parseInt(tableCols) || 3)
    editor?.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: true }).run()
    setTableOpen(false)
  }

  function closeAll() { setHeadingOpen(false); setFontSizeOpen(false); setFontFamilyOpen(false); setTableOpen(false) }

  const BubBtn = ({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button type="button" onMouseDown={e => { e.preventDefault(); onClick() }} title={title}
      className={cn('w-8 h-8 flex items-center justify-center rounded-lg transition-colors',
        active ? 'bg-amber-warm text-white' : 'text-[#ccc] hover:bg-[#333]')}>
      {children}
    </button>
  )

  const TB = ({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} title={title}
      className={cn('w-8 h-8 flex items-center justify-center rounded-lg transition-colors flex-shrink-0',
        active ? 'bg-amber-warm text-white' : 'text-[#888] hover:bg-[#252525]')}>
      {children}
    </button>
  )

  const Div = () => <div className="w-px h-5 bg-[#2a2a2a] mx-0.5 flex-shrink-0" />

  const dropdownStyle = { background: '#1a1a1a', border: '1px solid #2a2a2a', boxShadow: '0 4px 16px rgba(0,0,0,0.6)' }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap');`}</style>

      <div className="rounded-xl overflow-visible" style={{ border: '1px solid #2a2a2a', background: '#111' }}>

        {/* Floating bubble */}
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100, placement: 'top' }}
          shouldShow={({ state }) => state.selection.from !== state.selection.to}>
          <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-xl"
            style={{ background: '#1e1e1e', border: '1px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>
            <BubBtn onClick={() => editor.chain().focus().toggleBold().run()}      active={editor.isActive('bold')}      title="Bold">      <Bold size={14} /></BubBtn>
            <BubBtn onClick={() => editor.chain().focus().toggleItalic().run()}    active={editor.isActive('italic')}    title="Italic">    <Italic size={14} /></BubBtn>
            <BubBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"> <UnderlineIcon size={14} /></BubBtn>
            <BubBtn onClick={() => editor.chain().focus().toggleStrike().run()}    active={editor.isActive('strike')}    title="Strike">    <Strikethrough size={14} /></BubBtn>
            <div className="w-px h-5 bg-[#333] mx-0.5" />
            <BubBtn onClick={() => editor.chain().focus().setTextAlign('left').run()}   active={editor.isActive({ textAlign: 'left' })}   title="Left">   <AlignLeft size={14} /></BubBtn>
            <BubBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center"> <AlignCenter size={14} /></BubBtn>
            <BubBtn onClick={() => editor.chain().focus().setTextAlign('right').run()}  active={editor.isActive({ textAlign: 'right' })}  title="Right">  <AlignRight size={14} /></BubBtn>
          </div>
        </BubbleMenu>

        {/* ── Row 1: Undo/Redo · Heading · Font size ±/picker · Lists ── */}
        <div className="flex items-center gap-1 px-2 py-1.5 overflow-x-auto" style={{ borderBottom: '1px solid #2a2a2a', background: '#1a1a1a' }}>

          <TB onClick={() => editor.chain().focus().undo().run()} title="Undo" active={false}><RotateCcw size={14} /></TB>
          <TB onClick={() => editor.chain().focus().redo().run()} title="Redo" active={false}><RotateCw  size={14} /></TB>
          <Div />

          {/* Heading */}
          <div ref={headingRef} className="relative flex-shrink-0">
            <button type="button" onClick={() => { closeAll(); setHeadingOpen(v => !v) }}
              className="flex items-center gap-1 h-8 px-2 rounded-lg text-[#aaa] hover:bg-[#252525] text-xs font-sans font-medium min-w-[72px]">
              <span>{currentHeading}</span><ChevronDown size={10} />
            </button>
            {headingOpen && (
              <div className="absolute top-9 left-0 z-50 rounded-xl overflow-hidden" style={{ ...dropdownStyle, minWidth: 140 }}>
                {HEADINGS.map(h => (
                  <button key={h.level} type="button"
                    onClick={() => { h.level === 0 ? editor.chain().focus().setParagraph().run() : editor.chain().focus().toggleHeading({ level: h.level as 1|2|3 }).run(); setHeadingOpen(false) }}
                    className={cn('block w-full text-left px-3 py-2 hover:bg-[#252525] transition-colors',
                      h.level === 0 ? 'text-sm text-[#aaa]' : h.level === 1 ? 'text-xl font-bold text-white' : h.level === 2 ? 'text-base font-semibold text-[#ddd]' : 'text-sm font-medium text-[#ccc]')}>
                    {h.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font size ±/picker */}
          <div ref={fontSizeRef} className="relative flex items-center flex-shrink-0">
            <button type="button" onClick={() => adjustSize(-1)}
              className="w-7 h-8 flex items-center justify-center rounded-l-lg text-[#888] hover:bg-[#252525] transition-colors"><Minus size={11} /></button>
            <button type="button" onClick={() => { closeAll(); setFontSizeOpen(v => !v) }}
              className="h-8 px-1 text-xs font-sans text-[#aaa] hover:bg-[#252525] min-w-[30px] text-center leading-8 transition-colors">
              {currentFontSize}
            </button>
            <button type="button" onClick={() => adjustSize(1)}
              className="w-7 h-8 flex items-center justify-center rounded-r-lg text-[#888] hover:bg-[#252525] transition-colors"><Plus size={11} /></button>
            {fontSizeOpen && (
              <div className="absolute top-9 left-0 z-50 rounded-xl overflow-hidden overflow-y-auto max-h-48" style={{ ...dropdownStyle, minWidth: 60 }}>
                {FONT_SIZES.map(sz => (
                  <button key={sz} type="button"
                    onClick={() => { ;(editor.chain().focus() as any).setFontSize(sz).run(); setFontSizeOpen(false) }}
                    className={cn('block w-full text-left px-3 py-1.5 text-sm text-[#ccc] hover:bg-[#252525]',
                      currentFontSize === sz && 'font-bold text-amber-warm')}>
                    {sz}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Div />

          <TB onClick={() => editor.chain().focus().toggleBulletList().run()}  active={editor.isActive('bulletList')}  title="Bullet list"><List        size={14} /></TB>
          <TB onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list"><ListOrdered size={14} /></TB>
        </div>

        {/* ── Row 2: B·I·U·S·Code · Font family · Table · Align ── */}
        <div className="flex items-center gap-1 px-2 py-1.5 overflow-x-auto" style={{ borderBottom: '1px solid #2a2a2a', background: '#161616' }}>

          <TB onClick={() => editor.chain().focus().toggleBold().run()}      active={editor.isActive('bold')}      title="Bold">         <Bold size={14} /></TB>
          <TB onClick={() => editor.chain().focus().toggleItalic().run()}    active={editor.isActive('italic')}    title="Italic">       <Italic size={14} /></TB>
          <TB onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">    <UnderlineIcon size={14} /></TB>
          <TB onClick={() => editor.chain().focus().toggleStrike().run()}    active={editor.isActive('strike')}    title="Strikethrough"><Strikethrough size={14} /></TB>
          <TB onClick={() => editor.chain().focus().toggleCode().run()}      active={editor.isActive('code')}      title="Inline code">  <Code size={14} /></TB>
          <Div />

          {/* Font family */}
          <div ref={fontFamilyRef} className="relative flex-shrink-0">
            <button type="button" onClick={() => { closeAll(); setFontFamilyOpen(v => !v) }}
              className="flex items-center gap-1 h-8 px-2 rounded-lg text-[#aaa] hover:bg-[#252525] text-xs font-sans min-w-[72px]">
              <span className="truncate max-w-[60px]">{currentFontLabel}</span><ChevronDown size={10} className="flex-shrink-0" />
            </button>
            {fontFamilyOpen && (
              <div className="absolute top-9 left-0 z-50 rounded-xl overflow-hidden overflow-y-auto max-h-64" style={{ ...dropdownStyle, minWidth: 168 }}>
                {FONT_FAMILIES.map(f => (
                  <button key={f.value} type="button"
                    onClick={() => { f.value ? (editor.chain().focus() as any).setFontFamily(f.value).run() : (editor.chain().focus() as any).unsetFontFamily().run(); setFontFamilyOpen(false) }}
                    className={cn('block w-full text-left px-3 py-2 text-sm hover:bg-[#252525] transition-colors',
                      currentFontFamily === f.value ? 'text-amber-warm font-semibold' : 'text-[#ccc]')}
                    style={{ fontFamily: f.value || undefined }}>
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Div />

          {/* Table insert dialog */}
          <div ref={tableRef} className="relative flex-shrink-0">
            <TB onClick={() => { closeAll(); setTableOpen(v => !v) }} title="Insert table" active={editor.isActive('table') || tableOpen}>
              <TableIcon size={14} />
            </TB>
            {tableOpen && (
              <div className="absolute top-9 left-0 z-50 rounded-xl p-3" style={{ ...dropdownStyle, minWidth: 176 }}>
                <p className="text-xs text-[#888] font-sans mb-2 font-medium">Insert table</p>
                <div className="flex gap-2 mb-3">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-[10px] text-[#666] font-sans uppercase tracking-wider">Rows</label>
                    <input type="number" min={1} max={20} value={tableRows} onChange={e => setTableRows(e.target.value)}
                      className="w-full rounded-lg px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-amber-warm"
                      style={{ background: '#111', border: '1px solid #333' }} />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-[10px] text-[#666] font-sans uppercase tracking-wider">Cols</label>
                    <input type="number" min={1} max={10} value={tableCols} onChange={e => setTableCols(e.target.value)}
                      className="w-full rounded-lg px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-amber-warm"
                      style={{ background: '#111', border: '1px solid #333' }} />
                  </div>
                </div>
                <button type="button" onClick={insertTable}
                  className="w-full py-2 rounded-xl text-sm font-sans font-medium text-white"
                  style={{ background: '#c4933f' }}>
                  Insert
                </button>
              </div>
            )}
          </div>
          <Div />

          <TB onClick={() => editor.chain().focus().setTextAlign('left').run()}   active={editor.isActive({ textAlign: 'left' })}   title="Left"><AlignLeft    size={14} /></TB>
          <TB onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center"><AlignCenter size={14} /></TB>
          <TB onClick={() => editor.chain().focus().setTextAlign('right').run()}  active={editor.isActive({ textAlign: 'right' })}  title="Right"><AlignRight  size={14} /></TB>
        </div>

        {/* Editor area */}
        <div className="px-4 py-3 min-h-[150px]">
          <EditorContent editor={editor} />
        </div>

        <style>{`
          .ProseMirror { color: #e0e0e0; outline: none; line-height: 1.7; }
          .ProseMirror h1 { font-size: 1.6em; font-weight: 700; margin: 0.5em 0 0.25em; color: #fff; }
          .ProseMirror h2 { font-size: 1.3em; font-weight: 600; margin: 0.5em 0 0.25em; color: #f0f0f0; }
          .ProseMirror h3 { font-size: 1.1em; font-weight: 600; margin: 0.5em 0 0.25em; color: #e0e0e0; }
          .ProseMirror p { margin: 0.25em 0; }
          .ProseMirror ul, .ProseMirror ol { padding-left: 1.5em; margin: 0.25em 0; }
          .ProseMirror li { margin: 0.15em 0; }
          .ProseMirror ul ul, .ProseMirror ol ol, .ProseMirror ul ol, .ProseMirror ol ul { padding-left: 1.5em; }
          .ProseMirror code { background: #252525; border-radius: 4px; padding: 2px 5px; font-size: 0.88em; color: #e0b47a; }
          .ProseMirror blockquote { border-left: 3px solid #c4933f; padding-left: 1em; color: #aaa; margin: 0.5em 0; }
          .ProseMirror table { border-collapse: collapse; width: 100%; margin: 0.75em 0; }
          .ProseMirror td, .ProseMirror th { border: 1px solid #2a2a2a; padding: 6px 10px; min-width: 60px; vertical-align: top; }
          .ProseMirror th { background: #1a1a1a; font-weight: 600; color: #fff; }
          .ProseMirror p.is-editor-empty:first-child::before { color: #555; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
        `}</style>
      </div>
    </>
  )
}
