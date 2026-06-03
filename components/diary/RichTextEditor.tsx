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
  Minus, Plus, Mic, Square, Check, X, Type,
  Volume2, Globe, AlignJustify, ChevronUp, LayoutTemplate, Maximize2, Minimize2,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useEffect, useState, useRef, useCallback } from 'react'
import { ENTRY_TEMPLATES } from '@/lib/entryTemplates'

/* ── FontSize extension ── */
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
      setFontSize:   (size: string) => ({ chain }: any) => chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize: ()             => ({ chain }: any) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    } as any
  },
})

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

declare global {
  interface Window { SpeechRecognition: any; webkitSpeechRecognition: any }
}

const FONT_SIZES = ['10','11','12','13','14','15','16','18','20','22','24','28','32','36','42','48','56','64','72']

const FONT_FAMILIES = [
  { label: 'Default',         value: '' },
  { label: 'Serif',           value: 'Georgia, serif' },
  { label: 'Sans-serif',      value: 'Arial, sans-serif' },
  { label: 'Monospace',       value: '"Courier New", monospace' },
  { label: 'Cursive',         value: '"Dancing Script", cursive' },
  { label: 'Palatino',        value: 'Palatino, serif' },
  { label: 'Verdana',         value: 'Verdana, sans-serif' },
  { label: 'Trebuchet',       value: '"Trebuchet MS", sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Garamond',        value: 'Garamond, serif' },
  { label: 'Tahoma',          value: 'Tahoma, sans-serif' },
  { label: 'Impact',          value: 'Impact, sans-serif' },
]

const HEADINGS = [
  { label: 'Normal',    level: 0 },
  { label: 'H1 — Large',  level: 1 },
  { label: 'H2 — Medium', level: 2 },
  { label: 'H3 — Small',  level: 3 },
] as const

const LANGUAGES = [
  { label: 'English', code: 'en-US' },
  { label: 'Telugu',  code: 'te-IN' },
  { label: 'Hindi',   code: 'hi-IN' },
]

function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ')
  return text.trim().split(/\s+/).filter(w => w.length > 0).length
}

export function RichTextEditor({ value, onChange, placeholder = 'Write your thoughts…' }: RichTextEditorProps) {

  /* formatting panel */
  const [fmtOpen,        setFmtOpen]        = useState(false)
  const [headingOpen,    setHeadingOpen]    = useState(false)
  const [fontSizeOpen,   setFontSizeOpen]   = useState(false)
  const [fontFamilyOpen, setFontFamilyOpen] = useState(false)
  const [tableOpen,      setTableOpen]      = useState(false)
  const [tableRows,      setTableRows]      = useState('3')
  const [tableCols,      setTableCols]      = useState('3')

  /* zen & templates */
  const [zenMode,  setZenMode]  = useState(false)
  const [tmplOpen, setTmplOpen] = useState(false)
  const tmplRef = useRef<HTMLDivElement>(null)

  /* mic panel */
  const [micOpen,      setMicOpen]      = useState(false)
  const [langOpen,     setLangOpen]     = useState(false)
  const [dictLang,     setDictLang]     = useState(LANGUAGES[0])
  const [autoPunct,    setAutoPunct]    = useState(true)
  const [dictMode,     setDictMode]     = useState<'append'|'replace'>('append')
  const [isListening,  setIsListening]  = useState(false)
  const [liveText,     setLiveText]     = useState('')
  const [previewText,  setPreviewText]  = useState('')
  const [dictError,    setDictError]    = useState('')
  const [isPlaying,    setIsPlaying]    = useState(false)
  const recRef   = useRef<any>(null)
  const finalRef = useRef('')

  /* dropdown refs */
  const headingRef    = useRef<HTMLDivElement>(null)
  const fontSizeRef   = useRef<HTMLDivElement>(null)
  const fontFamilyRef = useRef<HTMLDivElement>(null)
  const tableRef      = useRef<HTMLDivElement>(null)
  const micPanelRef   = useRef<HTMLDivElement>(null)
  const langRef       = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder }),
      Underline, TextStyle, FontFamily, FontSize,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: false }),
      TableRow, TableCell, TableHeader,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: 'focus:outline-none' } },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value, false)
  }, []) // eslint-disable-line

  /* outside-click: close all dropdowns */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!headingRef.current?.contains(e.target as Node))    setHeadingOpen(false)
      if (!fontSizeRef.current?.contains(e.target as Node))   setFontSizeOpen(false)
      if (!fontFamilyRef.current?.contains(e.target as Node)) setFontFamilyOpen(false)
      if (!tableRef.current?.contains(e.target as Node))      setTableOpen(false)
      if (!langRef.current?.contains(e.target as Node))       setLangOpen(false)
      if (!tmplRef.current?.contains(e.target as Node))       setTmplOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  useEffect(() => () => { recRef.current?.abort(); window.speechSynthesis?.cancel() }, [])

  /* ── Dictation ── */
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setDictError('Speech recognition not supported (use Chrome or Safari).'); return }

    setDictError('')
    setLiveText('')
    setPreviewText('')
    finalRef.current = ''

    const rec = new SR()
    recRef.current = rec
    rec.continuous     = true
    rec.interimResults = true
    rec.lang           = dictLang.code

    rec.onresult = (e: any) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) {
          finalRef.current += autoPunct ? t : t.replace(/[.,!?;:]/g, '') + ' '
        } else {
          interim += t
        }
      }
      setLiveText((finalRef.current + interim).trim())
    }

    rec.onerror = (e: any) => {
      if (e.error === 'not-allowed') setDictError('Microphone permission denied.')
      else if (e.error === 'service-not-allowed' || e.error === 'language-not-supported') {
        setDictError(`${dictLang.label} not supported on this device. Try downloading the language pack in your device settings, or switch to English.`)
      }
      else if (e.error !== 'no-speech' && e.error !== 'aborted') setDictError(`Error: ${e.error}`)
    }

    rec.onend = () => {
      setIsListening(false)
      const result = finalRef.current.trim()
      if (result) { setPreviewText(result); setLiveText('') }
      else setLiveText(prev => { if (prev) { setPreviewText(prev); return '' } return '' })
    }

    try { rec.start(); setIsListening(true) }
    catch { setDictError('Could not start microphone.') }
  }, [dictLang, autoPunct])

  const stopListening = useCallback(() => { recRef.current?.stop() }, [])

  const playbackText = useCallback(() => {
    const text = previewText || liveText
    if (!text || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = dictLang.code
    utt.onstart = () => setIsPlaying(true)
    utt.onend   = () => setIsPlaying(false)
    utt.onerror = () => setIsPlaying(false)
    window.speechSynthesis.speak(utt)
  }, [previewText, liveText, dictLang])

  const stopPlayback = useCallback(() => {
    window.speechSynthesis?.cancel()
    setIsPlaying(false)
  }, [])

  const insertDictation = useCallback(() => {
    if (!editor || !previewText) return
    if (dictMode === 'replace') {
      editor.chain().focus().selectAll().deleteSelection().insertContent(previewText.trim() + ' ').run()
    } else {
      editor.chain().focus().insertContent(previewText.trim() + ' ').run()
    }
    setPreviewText('')
    setLiveText('')
  }, [editor, previewText, dictMode])

  const discardDictation = useCallback(() => {
    window.speechSynthesis?.cancel()
    setIsPlaying(false)
    setPreviewText('')
    setLiveText('')
    setDictError('')
  }, [])

  if (!editor) return null

  const curFontSize   = editor.getAttributes('textStyle').fontSize ?? '16'
  const curFontFamily = editor.getAttributes('textStyle').fontFamily ?? ''
  const curFontLabel  = FONT_FAMILIES.find(f => f.value === curFontFamily)?.label ?? 'Font'
  const curHeading    = editor.isActive('heading', { level: 1 }) ? 'H1'
    : editor.isActive('heading', { level: 2 }) ? 'H2'
    : editor.isActive('heading', { level: 3 }) ? 'H3' : 'Normal'

  function adjustSize(delta: number) {
    const idx  = FONT_SIZES.indexOf(curFontSize)
    const next = FONT_SIZES[Math.min(Math.max((idx < 0 ? FONT_SIZES.indexOf('16') : idx) + delta, 0), FONT_SIZES.length - 1)]
    if (next && editor) (editor.chain().focus() as any).setFontSize(next).run()
  }

  function doInsertTable() {
    const r = Math.max(1, parseInt(tableRows) || 3)
    const c = Math.max(1, parseInt(tableCols) || 3)
    editor?.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: true }).run()
    setTableOpen(false)
  }

  function closeFormatDropdowns() {
    setHeadingOpen(false); setFontSizeOpen(false); setFontFamilyOpen(false); setTableOpen(false); setTmplOpen(false)
  }

  /* ── Sub-components ── */
  const TB = ({ onPress, active, title, children, className }: {
    onPress: () => void; active?: boolean; title: string; children: React.ReactNode; className?: string
  }) => (
    <button type="button" title={title}
      onMouseDown={e => { e.preventDefault(); onPress() }}
      className={cn('flex items-center justify-center rounded-lg flex-shrink-0',
        active ? 'bg-amber-warm text-white' : 'text-[#888]',
        className ?? 'w-8 h-8')}>
      {children}
    </button>
  )

  const BubBtn = ({ onPress, active, title, children }: { onPress: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button type="button" title={title}
      onMouseDown={e => { e.preventDefault(); onPress() }}
      className={cn('w-8 h-8 flex items-center justify-center rounded-lg',
        active ? 'bg-amber-warm text-white' : 'text-[#ccc]')}>
      {children}
    </button>
  )

  const Div = () => <div className="w-px h-5 bg-[#2a2a2a] mx-0.5 flex-shrink-0" />
  const ddStyle = { background: '#1a1a1a', border: '1px solid #2a2a2a', boxShadow: '0 4px 16px rgba(0,0,0,0.6)' }

  const hasDictContent = isListening || liveText || previewText || dictError

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap');`}</style>

      <div style={{ border: '1px solid #2a2a2a', background: '#111', borderRadius: 12 }}>

        {/* ── Bubble menu ── */}
        <BubbleMenu editor={editor} tippyOptions={{ duration: 80, placement: 'top' }}
          shouldShow={({ state }) => state.selection.from !== state.selection.to}>
          <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-xl"
            style={{ background: '#1e1e1e', border: '1px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>
            <BubBtn onPress={() => editor.chain().focus().toggleBold().run()}      active={editor.isActive('bold')}      title="Bold">      <Bold size={14} /></BubBtn>
            <BubBtn onPress={() => editor.chain().focus().toggleItalic().run()}    active={editor.isActive('italic')}    title="Italic">    <Italic size={14} /></BubBtn>
            <BubBtn onPress={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"> <UnderlineIcon size={14} /></BubBtn>
            <BubBtn onPress={() => editor.chain().focus().toggleStrike().run()}    active={editor.isActive('strike')}    title="Strike">    <Strikethrough size={14} /></BubBtn>
            <div className="w-px h-5 bg-[#333] mx-0.5" />
            <BubBtn onPress={() => editor.chain().focus().setTextAlign('left').run()}   active={editor.isActive({ textAlign: 'left' })}   title="Left">   <AlignLeft size={14} /></BubBtn>
            <BubBtn onPress={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center"> <AlignCenter size={14} /></BubBtn>
            <BubBtn onPress={() => editor.chain().focus().setTextAlign('right').run()}  active={editor.isActive({ textAlign: 'right' })}  title="Right">  <AlignRight size={14} /></BubBtn>
          </div>
        </BubbleMenu>

        {/* ══ MINIMAL TOOLBAR ══ */}
        <div className="flex items-center gap-1 px-2 py-1.5 scrollbar-none"
          style={{ borderBottom: '1px solid #2a2a2a', background: '#1a1a1a', borderRadius: fmtOpen || hasDictContent ? '12px 12px 0 0' : micOpen ? '12px 12px 0 0' : '12px 12px 0 0' }}>

          {/* 🎤 Mic — left, prominent */}
          <button type="button"
            onMouseDown={e => { e.preventDefault(); setMicOpen(v => !v); setFmtOpen(false) }}
            className={cn(
              'flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-sans font-semibold flex-shrink-0 transition-colors',
              micOpen || isListening
                ? 'text-white'
                : 'text-[#c4933f]'
            )}
            style={micOpen || isListening
              ? { background: '#c4933f' }
              : { background: 'rgba(196,147,63,0.12)', border: '1px solid rgba(196,147,63,0.3)' }}>
            <Mic size={15} />
            <span>Record</span>
          </button>

          <Div />

          {/* B I */}
          <TB onPress={() => editor.chain().focus().toggleBold().run()}   active={editor.isActive('bold')}   title="Bold">  <Bold   size={14} /></TB>
          <TB onPress={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={14} /></TB>

          <Div />

          {/* Undo / Redo */}
          <TB onPress={() => editor.chain().focus().undo().run()} title="Undo"><RotateCcw size={13} /></TB>
          <TB onPress={() => editor.chain().focus().redo().run()} title="Redo"><RotateCw  size={13} /></TB>

          <div className="flex-1" />

          {/* Templates */}
          <div ref={tmplRef} className="relative flex-shrink-0">
            <button type="button"
              onMouseDown={e => { e.preventDefault(); setTmplOpen(v => !v); setFmtOpen(false); setMicOpen(false) }}
              className={cn('w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0', tmplOpen ? 'bg-[#2a2a2a] text-white' : 'text-[#666]')}>
              <LayoutTemplate size={13} />
            </button>
            {tmplOpen && (
              <div className="absolute top-9 right-0 z-50 rounded-xl overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', boxShadow: '0 4px 16px rgba(0,0,0,0.6)', minWidth: 180 }}>
                {ENTRY_TEMPLATES.map(t => (
                  <button key={t.label} type="button"
                    onClick={() => { editor?.chain().focus().setContent(t.content).run(); setTmplOpen(false) }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-sm font-sans text-[#ccc] hover:bg-[#252525]">
                    <span>{t.icon}</span><span>{t.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Aa — format toggle */}
          <button type="button"
            onMouseDown={e => { e.preventDefault(); setFmtOpen(v => !v); setMicOpen(false); setTmplOpen(false) }}
            className={cn(
              'flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-sans font-semibold flex-shrink-0',
              fmtOpen ? 'bg-[#2a2a2a] text-white' : 'text-[#666]'
            )}>
            <Type size={13} />
            <span>Aa</span>
            {fmtOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>

          {/* Zen mode */}
          <button type="button"
            onMouseDown={e => { e.preventDefault(); setZenMode(v => !v) }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#666] flex-shrink-0">
            <Maximize2 size={13} />
          </button>
        </div>

        {/* ══ MIC PANEL ══ */}
        {micOpen && (
          <div ref={micPanelRef} style={{ borderBottom: '1px solid #2a2a2a', background: '#0f0f0f' }}>

            {/* Sub-options row */}
            {!isListening && !previewText && (
              <div className="px-3 pt-3 pb-2 flex flex-wrap gap-2">

                {/* Language */}
                <div ref={langRef} className="relative">
                  <button type="button"
                    onMouseDown={e => { e.preventDefault(); setLangOpen(v => !v) }}
                    className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-sans text-[#aaa]"
                    style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                    <Globe size={12} className="text-[#666]" />
                    <span>{dictLang.label}</span>
                    <ChevronDown size={9} className="text-[#555]" />
                  </button>
                  {langOpen && (
                    <div className="absolute top-9 left-0 z-50 rounded-xl overflow-y-auto max-h-52" style={{ ...ddStyle, minWidth: 168 }}>
                      {LANGUAGES.map(l => (
                        <button key={l.code} type="button"
                          onClick={() => { setDictLang(l); setLangOpen(false) }}
                          className={cn('block w-full text-left px-3 py-2 text-sm',
                            dictLang.code === l.code ? 'text-amber-warm font-semibold' : 'text-[#ccc] hover:bg-[#252525]')}>
                          {l.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Punctuation toggle */}
                <button type="button" onClick={() => setAutoPunct(v => !v)}
                  className={cn('flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-sans',
                    autoPunct ? 'text-amber-warm' : 'text-[#666]')}
                  style={{ background: '#1a1a1a', border: `1px solid ${autoPunct ? 'rgba(196,147,63,0.4)' : '#2a2a2a'}` }}>
                  <AlignJustify size={12} />
                  <span>Punct {autoPunct ? 'On' : 'Off'}</span>
                </button>

                {/* Append / Replace */}
                <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #2a2a2a' }}>
                  {(['append','replace'] as const).map(m => (
                    <button key={m} type="button" onClick={() => setDictMode(m)}
                      className={cn('h-8 px-3 text-xs font-sans capitalize',
                        dictMode === m ? 'text-white' : 'text-[#666]')}
                      style={{ background: dictMode === m ? '#2a2a2a' : '#1a1a1a' }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Record / Stop button */}
            {!previewText && (
              <div className="px-3 pb-3">
                {!isListening ? (
                  <button type="button" onClick={startListening}
                    className="w-full py-2.5 rounded-xl text-sm font-sans font-semibold text-white flex items-center justify-center gap-2"
                    style={{ background: '#c4933f' }}>
                    <Mic size={15} /> Start Recording
                  </button>
                ) : (
                  <button type="button" onClick={stopListening}
                    className="w-full py-2.5 rounded-xl text-sm font-sans font-semibold text-white flex items-center justify-center gap-2"
                    style={{ background: '#333', border: '1px solid #444' }}>
                    <Square size={13} fill="white" /> Stop Recording
                  </button>
                )}
              </div>
            )}

            {/* Live transcript while listening */}
            {isListening && (
              <div className="px-3 pb-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-warm opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-warm" />
                  </span>
                  <span className="text-xs text-[#888]">Listening in {dictLang.label}…</span>
                </div>
                <div className="rounded-xl px-3 py-2 min-h-[48px]" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                  {liveText
                    ? <p className="text-sm text-[#e0e0e0] leading-relaxed">{liveText}<span className="animate-pulse text-[#555]">▋</span></p>
                    : <p className="text-sm text-[#444] italic">Start speaking…</p>
                  }
                </div>
              </div>
            )}

            {/* Preview after recording */}
            {previewText && !isListening && (
              <div className="px-3 pb-3">
                <p className="text-xs text-[#666] mb-1.5 font-sans">Preview — {dictMode === 'replace' ? 'will replace all content' : 'will append to text'}</p>
                <div className="rounded-xl px-3 py-2.5 mb-2.5" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                  <p className="text-sm text-[#e0e0e0] leading-relaxed">{previewText}</p>
                </div>
                {/* Action buttons */}
                <div className="flex gap-2">
                  <button type="button" onClick={insertDictation}
                    className="flex-1 py-2 rounded-xl text-sm font-sans font-semibold text-white flex items-center justify-center gap-1.5"
                    style={{ background: '#c4933f' }}>
                    <Check size={13} /> Insert
                  </button>
                  <button type="button"
                    onClick={isPlaying ? stopPlayback : playbackText}
                    className={cn('py-2 px-3 rounded-xl text-sm font-sans flex items-center gap-1.5',
                      isPlaying ? 'text-white' : 'text-[#888]')}
                    style={{ background: isPlaying ? '#2a2a2a' : '#1a1a1a', border: '1px solid #2a2a2a' }}>
                    <Volume2 size={13} />
                    {isPlaying ? 'Stop' : 'Play'}
                  </button>
                  <button type="button" onClick={() => { discardDictation(); startListening() }}
                    className="py-2 px-3 rounded-xl text-sm font-sans text-[#888] flex items-center gap-1.5"
                    style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                    <Mic size={13} /> Redo
                  </button>
                  <button type="button" onClick={discardDictation}
                    className="py-2 px-3 rounded-xl text-sm font-sans text-[#888]"
                    style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                    <X size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {dictError && (
              <div className="px-3 pb-3">
                <p className="text-xs text-red-400">{dictError}</p>
              </div>
            )}
          </div>
        )}

        {/* ══ FORMATTING PANEL (collapsible) ══ */}
        {fmtOpen && (
          <div style={{ borderBottom: '1px solid #2a2a2a' }}>

            {/* Row A: Heading · Font size · Lists */}
            <div className="flex items-center gap-1 px-2 py-1.5 overflow-x-auto scrollbar-none"
              style={{ borderBottom: '1px solid #222', background: '#181818' }}>

              {/* Heading */}
              <div ref={headingRef} className="relative flex-shrink-0">
                <button type="button"
                  onMouseDown={e => { e.preventDefault(); closeFormatDropdowns(); setHeadingOpen(v => !v) }}
                  className="flex items-center gap-1 h-8 px-2 rounded-lg text-[#aaa] text-xs font-sans font-medium min-w-[72px]">
                  {curHeading}<ChevronDown size={10} />
                </button>
                {headingOpen && (
                  <div className="absolute top-9 left-0 z-50 rounded-xl overflow-hidden" style={{ ...ddStyle, minWidth: 140 }}>
                    {HEADINGS.map(h => (
                      <button key={h.level} type="button"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => {
                          h.level === 0
                            ? editor.chain().focus().setParagraph().run()
                            : editor.chain().focus().toggleHeading({ level: h.level as 1|2|3 }).run()
                          setHeadingOpen(false)
                        }}
                        className={cn('block w-full text-left px-3 py-2 hover:bg-[#252525]',
                          h.level === 0 ? 'text-sm text-[#aaa]'
                          : h.level === 1 ? 'text-xl font-bold text-white'
                          : h.level === 2 ? 'text-base font-semibold text-[#ddd]'
                          : 'text-sm font-medium text-[#ccc]')}>
                        {h.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Div />

              {/* Font size */}
              <div ref={fontSizeRef} className="relative flex items-center flex-shrink-0">
                <button type="button" onMouseDown={e => { e.preventDefault(); adjustSize(-1) }}
                  className="w-7 h-8 flex items-center justify-center rounded-l-lg text-[#888]"><Minus size={11} /></button>
                <button type="button" onMouseDown={e => { e.preventDefault(); closeFormatDropdowns(); setFontSizeOpen(v => !v) }}
                  className="h-8 px-1 text-xs font-sans text-[#aaa] min-w-[30px] text-center">{curFontSize}</button>
                <button type="button" onMouseDown={e => { e.preventDefault(); adjustSize(1) }}
                  className="w-7 h-8 flex items-center justify-center rounded-r-lg text-[#888]"><Plus size={11} /></button>
                {fontSizeOpen && (
                  <div className="absolute top-9 left-0 z-50 rounded-xl overflow-y-auto max-h-48" style={{ ...ddStyle, minWidth: 60 }}>
                    {FONT_SIZES.map(sz => (
                      <button key={sz} type="button"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => { ;(editor.chain().focus() as any).setFontSize(sz).run(); setFontSizeOpen(false) }}
                        className={cn('block w-full text-left px-3 py-1.5 text-sm hover:bg-[#252525]',
                          curFontSize === sz ? 'font-bold text-amber-warm' : 'text-[#ccc]')}>
                        {sz}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Div />

              <TB onPress={() => editor.chain().focus().toggleBulletList().run()}  active={editor.isActive('bulletList')}  title="Bullets"><List        size={14} /></TB>
              <TB onPress={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered"><ListOrdered size={14} /></TB>
              <Div />
              <TB onPress={() => editor.chain().focus().setTextAlign('left').run()}   active={editor.isActive({ textAlign: 'left' })}   title="Left">  <AlignLeft   size={14} /></TB>
              <TB onPress={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center"><AlignCenter size={14} /></TB>
              <TB onPress={() => editor.chain().focus().setTextAlign('right').run()}  active={editor.isActive({ textAlign: 'right' })}  title="Right"> <AlignRight  size={14} /></TB>
            </div>

            {/* Row B: B·I·U·S·Code · Font family · Table */}
            <div className="flex items-center gap-1 px-2 py-1.5 overflow-x-auto scrollbar-none"
              style={{ background: '#141414' }}>

              <TB onPress={() => editor.chain().focus().toggleBold().run()}      active={editor.isActive('bold')}      title="Bold">         <Bold size={14} /></TB>
              <TB onPress={() => editor.chain().focus().toggleItalic().run()}    active={editor.isActive('italic')}    title="Italic">       <Italic size={14} /></TB>
              <TB onPress={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">    <UnderlineIcon size={14} /></TB>
              <TB onPress={() => editor.chain().focus().toggleStrike().run()}    active={editor.isActive('strike')}    title="Strike">       <Strikethrough size={14} /></TB>
              <TB onPress={() => editor.chain().focus().toggleCode().run()}      active={editor.isActive('code')}      title="Code">         <Code size={14} /></TB>
              <Div />

              {/* Font family */}
              <div ref={fontFamilyRef} className="relative flex-shrink-0">
                <button type="button"
                  onMouseDown={e => { e.preventDefault(); closeFormatDropdowns(); setFontFamilyOpen(v => !v) }}
                  className="flex items-center gap-1 h-8 px-2 rounded-lg text-[#aaa] text-xs font-sans min-w-[68px]">
                  <span className="truncate max-w-[56px]">{curFontLabel}</span><ChevronDown size={10} className="flex-shrink-0" />
                </button>
                {fontFamilyOpen && (
                  <div className="absolute top-9 left-0 z-50 rounded-xl overflow-y-auto max-h-64" style={{ ...ddStyle, minWidth: 168 }}>
                    {FONT_FAMILIES.map(f => (
                      <button key={f.value} type="button"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => {
                          f.value
                            ? (editor.chain().focus() as any).setFontFamily(f.value).run()
                            : (editor.chain().focus() as any).unsetFontFamily().run()
                          setFontFamilyOpen(false)
                        }}
                        className={cn('block w-full text-left px-3 py-2 text-sm hover:bg-[#252525]',
                          curFontFamily === f.value ? 'text-amber-warm font-semibold' : 'text-[#ccc]')}
                        style={{ fontFamily: f.value || undefined }}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Div />

              {/* Table */}
              <div ref={tableRef} className="relative flex-shrink-0">
                <TB onPress={() => { closeFormatDropdowns(); setTableOpen(v => !v) }} title="Table" active={tableOpen}>
                  <TableIcon size={14} />
                </TB>
                {tableOpen && (
                  <div className="absolute top-9 left-0 z-50 rounded-xl p-3" style={{ ...ddStyle, minWidth: 176 }}>
                    <p className="text-xs text-[#888] font-sans mb-2 font-medium">Insert table</p>
                    <div className="flex gap-2 mb-3">
                      {[{ label: 'Rows', val: tableRows, set: setTableRows, max: 20 }, { label: 'Cols', val: tableCols, set: setTableCols, max: 10 }].map(f => (
                        <div key={f.label} className="flex flex-col gap-1 flex-1">
                          <label className="text-[10px] text-[#666] font-sans uppercase tracking-wider">{f.label}</label>
                          <input type="number" min={1} max={f.max} value={f.val} onChange={e => f.set(e.target.value)}
                            className="w-full rounded-lg px-2 py-1.5 text-sm text-white text-center focus:outline-none"
                            style={{ background: '#111', border: '1px solid #333' }} />
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={doInsertTable}
                      className="w-full py-2 rounded-xl text-sm font-sans font-semibold text-white"
                      style={{ background: '#c4933f' }}>
                      Insert
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ Editor ══ */}
        <div className="px-4 py-3 min-h-[160px]">
          <EditorContent editor={editor} />
        </div>

      </div>

      {/* Word count */}
      {(() => { const w = countWords(value); const mins = Math.max(1, Math.round(w / 200)); return w > 0 ? (
        <p className="text-xs font-sans text-[#555] px-1 pt-1">{w} {w === 1 ? 'word' : 'words'} · {mins} min read</p>
      ) : null })()}

      {/* Zen overlay */}
      {zenMode && (
        <div className="fixed inset-0 z-40 bg-black/80" onClick={() => setZenMode(false)}>
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 max-w-2xl mx-auto px-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button type="button" onMouseDown={e => { e.preventDefault(); setZenMode(false) }}
                className="flex items-center gap-1 text-xs text-[#666] hover:text-[#aaa] font-sans">
                <Minimize2 size={13} /> Exit Zen
              </button>
            </div>
            <div style={{ border: '1px solid #2a2a2a', background: '#111', borderRadius: 12 }}>
              <div className="px-4 py-3 min-h-[320px]">
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ProseMirror { color: #e0e0e0; outline: none; line-height: 1.75; }
        .ProseMirror h1 { font-size: 1.6em; font-weight: 700; margin: .5em 0 .25em; color: #fff; }
        .ProseMirror h2 { font-size: 1.3em; font-weight: 600; margin: .5em 0 .25em; color: #f0f0f0; }
        .ProseMirror h3 { font-size: 1.1em; font-weight: 600; margin: .5em 0 .25em; color: #e0e0e0; }
        .ProseMirror p  { margin: .25em 0; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.5em; margin: .25em 0; }
        .ProseMirror li { margin: .15em 0; }
        .ProseMirror ul ul, .ProseMirror ol ol, .ProseMirror ul ol, .ProseMirror ol ul { padding-left: 1.5em; }
        .ProseMirror code { background: #252525; border-radius: 4px; padding: 2px 5px; font-size: .88em; color: #e0b47a; }
        .ProseMirror blockquote { border-left: 3px solid #c4933f; padding-left: 1em; color: #aaa; margin: .5em 0; }
        .ProseMirror table { border-collapse: collapse; width: 100%; margin: .75em 0; }
        .ProseMirror td, .ProseMirror th { border: 1px solid #2a2a2a; padding: 6px 10px; min-width: 60px; vertical-align: top; }
        .ProseMirror th { background: #1a1a1a; font-weight: 600; color: #fff; }
        .ProseMirror p.is-editor-empty:first-child::before { color: #555; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
        .scrollbar-none { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  )
}
