'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useEffect } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder = 'Write your thoughts…' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
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

  if (!editor) return null

  const ToolbarBtn = ({ onClick, active, children }: { onClick: () => void; active: boolean; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-8 h-8 flex items-center justify-center rounded-lg transition-colors',
        active ? 'bg-amber-warm text-white' : 'text-ink-300 hover:bg-paper-300'
      )}
    >
      {children}
    </button>
  )

  return (
    <div className="rounded-xl border border-paper-400 bg-white overflow-hidden">
      <div className="flex gap-1 px-2 py-1.5 border-b border-paper-400 bg-paper-50">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <Bold size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <Italic size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          <List size={14} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          <ListOrdered size={14} />
        </ToolbarBtn>
      </div>
      <div className="px-4 py-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
