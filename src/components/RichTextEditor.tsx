import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Quote, 
  Code,
  Link2,
  Heading1,
  Heading2,
  ImageIcon,
} from 'lucide-react'
import { useEffect, useRef } from 'react'

interface Props {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function RichTextEditor({ content, onChange, placeholder }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing your thoughts...',
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-amber-400 underline hover:text-amber-300',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-3 border border-ink-700',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] px-6 py-5',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const src = ev.target?.result as string
      if (src) editor.chain().focus().setImage({ src }).run()
    }
    reader.readAsDataURL(file)
    // Reset so the same file can be picked again
    e.target.value = ''
  }

  return (
    <div className="border border-amber-500/30 rounded-2xl overflow-hidden bg-ink-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-3 border-b border-ink-800 bg-ink-900/50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-ink-500 hover:text-ink-200 hover:bg-ink-800'
          }`}
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-ink-500 hover:text-ink-200 hover:bg-ink-800'
          }`}
        >
          <Heading2 size={16} />
        </button>

        <div className="w-px h-5 bg-ink-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('bold')
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-ink-500 hover:text-ink-200 hover:bg-ink-800'
          }`}
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('italic')
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-ink-500 hover:text-ink-200 hover:bg-ink-800'
          }`}
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('underline')
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-ink-500 hover:text-ink-200 hover:bg-ink-800'
          }`}
        >
          <UnderlineIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('strike')
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-ink-500 hover:text-ink-200 hover:bg-ink-800'
          }`}
        >
          <Strikethrough size={16} />
        </button>

        <div className="w-px h-5 bg-ink-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-ink-500 hover:text-ink-200 hover:bg-ink-800'
          }`}
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-ink-500 hover:text-ink-200 hover:bg-ink-800'
          }`}
        >
          <ListOrdered size={16} />
        </button>

        <div className="w-px h-5 bg-ink-800 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-ink-500 hover:text-ink-200 hover:bg-ink-800'
          }`}
        >
          <Quote size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('codeBlock')
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-ink-500 hover:text-ink-200 hover:bg-ink-800'
          }`}
        >
          <Code size={16} />
        </button>
        <button
          type="button"
          onClick={addLink}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('link')
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-ink-500 hover:text-ink-200 hover:bg-ink-800'
          }`}
        >
          <Link2 size={16} />
        </button>

        <div className="w-px h-5 bg-ink-800 mx-1" />

        {/* Image upload */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Insert image"
          className="p-2 rounded-lg transition-colors text-ink-500 hover:text-ink-200 hover:bg-ink-800"
        >
          <ImageIcon size={16} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageFile}
        />
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
