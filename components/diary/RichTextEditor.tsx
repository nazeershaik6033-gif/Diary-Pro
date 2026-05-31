'use client'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import { Extension } from '@tiptap/core'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  RotateCcw, RotateCw, ChevronDown,
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

const FONT_SIZES = ['12', '14', '16', '18', '20', '24', '28', '32', '36', '48']

const HEADINGS = [
  { label: 'Normal', level: 0 },
  { label: 'H1', level: 1 },
  { label: 'H2', level: 2 },
  { label: 'H3', level: 3 },
] as const

export function RichTextEditor({ value, onChange, placeholder = 'Write your thoughts…' }: RichTextEditorProps) {
  const [headingOpen, setHeadingOpen] = useState(false)
  const [fontSizeOpen, setFontSizeOpen] = useState(false)
  const headingRef = useRef<HTMLDivElement>(null)
  const fontSizeRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder }),
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
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
      if (!headingRef.current?.contains(e.target as Node)) setHeadingOpen(false)
      if (!fontSizeRef.current?.contains(e.target as Node)) setFontSizeOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!editor) return null

  const currentFontSize = editor.getAttributes('textStyle').fontSize ?? '16'
  const currentHeading = editor.isActive('heading', { level: 1 }) ? 'H1'
    : editor.isActive('heading', { level: 2 }) ? 'H2'
    : editor.isActive('heading', { level: 3 }) ? 'H3'
    : 'Normal'

  const BubbleBtn = ({ onClick, active, title, children }: {
    onClick: () => void; active?: boolean; title: string; children: React.ReactNode
  }) => (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={cn(
        'w-8 h-8 flex items-center justify-center rounded-lg transition-colors flex-shrink-0',
        active ? 'bg-amber-warm text-white' : 'text-[#ccc] hover:bg-[#333]'
      )}
    >
      {children}
    </button>
  )

  const ToolbarBtn = ({ onClick, active, title, children }: {
    onClick: () => void; active?: boolean; title: string; children: React.ReactNode
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'w-8 h-8 flex items-center justify-center rounded-lg transition-colors flex-shrink-0',
        active ? 'bg-amber-warm text-white' : 'text-[#888] hover:bg-[#252525]'
      )}
    >
      {children}
    </button>
  )

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #2a2a2a', background: '#111' }}>

      {/* Floating bubble menu on text selection */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100, placement: 'top' }}
        shouldShow={({ editor, state }) => {
          const { from, to } = state.selection
          return from !== to
        }}
      >
        <div
          className="flex items-center gap-0.5 px-1.5 py-1 rounded-xl"
          style={{ background: '#1e1e1e', border: '1px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.6)' }}
        >
          <BubbleBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
            <Bold size={14} />
          </BubbleBtn>
          <BubbleBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
            <Italic size={14} />
          </BubbleBtn>
          <BubbleBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
            <UnderlineIcon size={14} />
          </BubbleBtn>
          <BubbleBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strike">
            <Strikethrough size={14} />
          </BubbleBtn>
          <div className="w-px h-5 bg-[#333] mx-0.5" />
          <BubbleBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code">
            <Code size={14} />
          </BubbleBtn>
          <div className="w-px h-5 bg-[#333] mx-0.5" />
          <BubbleBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Left">
            <AlignLeft size={14} />
          </BubbleBtn>
          <BubbleBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center">
            <AlignCenter size={14} />
          </BubbleBtn>
          <BubbleBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Right">
            <AlignRight size={14} />
          </BubbleBtn>
        </div>
      </BubbleMenu>

      {/* Static minimal toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 overflow-x-auto" style={{ borderBottom: '1px solid #2a2a2a', background: '#1a1a1a' }}>

        {/* Undo / Redo */}
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo" active={false}>
          <RotateCcw size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo" active={false}>
          <RotateCw size={14} />
        </ToolbarBtn>

        <div className="w-px h-5 bg-[#2a2a2a] mx-0.5 flex-shrink-0" />

        {/* Heading picker */}
        <div ref={headingRef} className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => { setHeadingOpen(v => !v); setFontSizeOpen(false) }}
            className="flex items-center gap-1 h-8 px-2 rounded-lg text-[#aaa] hover:bg-[#252525] text-xs font-sans font-medium min-w-[64px]"
          >
            <span>{currentHeading}</span>
            <ChevronDown size={10} />
          </button>
          {headingOpen && (
            <div className="absolute top-9 left-0 z-50 rounded-xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', boxShadow: '0 4px 16px rgba(0,0,0,0.6)', minWidth: 90 }}>
              {HEADINGS.map(h => (
                <button
                  key={h.level}
                  type="button"
                  onClick={() => {
                    if (h.level === 0) editor.chain().focus().setParagraph().run()
                    else editor.chain().focus().toggleHeading({ level: h.level as 1|2|3 }).run()
                    setHeadingOpen(false)
                  }}
                  className={cn(
                    'block w-full text-left px-3 py-2 text-sm hover:bg-[#252525] transition-colors',
                    h.level === 0 ? 'text-[#aaa]' : h.level === 1 ? 'text-lg font-bold text-white' : h.level === 2 ? 'text-base font-semibold text-[#ddd]' : 'text-sm font-medium text-[#ccc]'
                  )}
                >
                  {h.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font size picker */}
        <div ref={fontSizeRef} className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => { setFontSizeOpen(v => !v); setHeadingOpen(false) }}
            className="flex items-center gap-1 h-8 px-2 rounded-lg text-[#aaa] hover:bg-[#252525] text-xs font-sans min-w-[44px]"
          >
            <span>{currentFontSize}</span>
            <ChevronDown size={10} />
          </button>
          {fontSizeOpen && (
            <div className="absolute top-9 left-0 z-50 rounded-xl overflow-hidden max-h-48 overflow-y-auto" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', boxShadow: '0 4px 16px rgba(0,0,0,0.6)', minWidth: 60 }}>
              {FONT_SIZES.map(sz => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => {
                    ;(editor.chain().focus() as any).setFontSize(sz).run()
                    setFontSizeOpen(false)
                  }}
                  className={cn(
                    'block w-full text-left px-3 py-1.5 text-sm text-[#ccc] hover:bg-[#252525]',
                    currentFontSize === sz && 'font-bold text-amber-warm'
                  )}
                >
                  {sz}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-[#2a2a2a] mx-0.5 flex-shrink-0" />

        {/* Lists */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          <List size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
          <ListOrdered size={14} />
        </ToolbarBtn>

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
        .ProseMirror p.is-editor-empty:first-child::before { color: #555; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
      `}</style>
    </div>
  )
}
