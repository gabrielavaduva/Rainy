import { useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextStyle from '@tiptap/extension-text-style'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Extension } from '@tiptap/core'
import ResizableImage from './ResizableImage'
import Toolbar from './Toolbar'
import './Editor.css'

// Custom extension for font sizes
const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}
              const sizes = {
                small: '12px',
                medium: '16px',
                large: '20px',
              }
              return { style: `font-size: ${sizes[attributes.fontSize] || attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
})

function Editor({ note, onUpdate }) {
  const titleRef = useRef(null)
  const saveTimeoutRef = useRef(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      ResizableImage.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      TextStyle,
      FontSize,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: note?.content || '',
    editable: !!note,
    onUpdate: ({ editor }) => {
      if (!note) return
      // Debounced auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        onUpdate({ content: editor.getHTML() })
      }, 500)
    },
  })

  // Update editor content when note changes
  useEffect(() => {
    if (editor && note) {
      const currentContent = editor.getHTML()
      if (currentContent !== note.content) {
        editor.commands.setContent(note.content || '')
      }
      editor.setEditable(true)
    } else if (editor) {
      editor.commands.setContent('')
      editor.setEditable(false)
    }
  }, [note?.id, editor])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const handleTitleChange = useCallback((e) => {
    if (!note) return
    onUpdate({ title: e.target.value })
  }, [note, onUpdate])

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      editor?.commands.focus()
    }
  }

  const handleEditorClick = (e) => {
    const link = e.target.closest('a')
    if (link && link.href) {
      e.preventDefault()
      window.electronAPI.openExternal(link.href)
    }
  }

  if (!note) {
    return (
      <div className="editor-empty">
        <p>Select a note or create a new one</p>
      </div>
    )
  }

  return (
    <div className="editor-container">
      <input
        ref={titleRef}
        className="editor-title"
        type="text"
        value={note.title || ''}
        onChange={handleTitleChange}
        onKeyDown={handleTitleKeyDown}
        placeholder="Note title..."
      />
      <Toolbar editor={editor} />
      <div className="editor-scroll-wrapper" onClick={handleEditorClick}>
        <EditorContent editor={editor} className="editor-content" />
      </div>
    </div>
  )
}

export default Editor
