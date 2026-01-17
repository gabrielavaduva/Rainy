import { Bold, Italic, Underline, Image, Type, ListTodo } from 'lucide-react'

function Toolbar({ editor }) {
  if (!editor) return null

  const handleImageUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = () => {
          editor.chain().focus().setImage({ src: reader.result }).run()
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handlePaste = (e) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          const reader = new FileReader()
          reader.onload = () => {
            editor.chain().focus().setImage({ src: reader.result }).run()
          }
          reader.readAsDataURL(file)
        }
        break
      }
    }
  }

  // Attach paste handler to editor
  if (editor.view?.dom && !editor.view.dom._pasteHandlerAttached) {
    editor.view.dom.addEventListener('paste', handlePaste)
    editor.view.dom._pasteHandlerAttached = true
  }

  const setFontSize = (size) => {
    editor.chain().focus().unsetMark('textStyle').run()
    if (size !== 'medium') {
      editor.chain().focus().setMark('textStyle', { fontSize: size }).run()
    }
  }

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </button>
        <button
          className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} />
        </button>
        <button
          className={`toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline (Ctrl+U)"
        >
          <Underline size={16} />
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className={`toolbar-btn font-size-btn ${editor.isActive('textStyle', { fontSize: 'small' }) ? 'active' : ''}`}
          onClick={() => setFontSize('small')}
          title="Small text"
        >
          <Type size={12} />
        </button>
        <button
          className={`toolbar-btn font-size-btn ${!editor.isActive('textStyle', { fontSize: 'small' }) && !editor.isActive('textStyle', { fontSize: 'large' }) ? 'active' : ''}`}
          onClick={() => setFontSize('medium')}
          title="Medium text"
        >
          <Type size={16} />
        </button>
        <button
          className={`toolbar-btn font-size-btn ${editor.isActive('textStyle', { fontSize: 'large' }) ? 'active' : ''}`}
          onClick={() => setFontSize('large')}
          title="Large text"
        >
          <Type size={20} />
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${editor.isActive('taskList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          title="Todo list"
        >
          <ListTodo size={16} />
        </button>
        <button
          className="toolbar-btn"
          onClick={handleImageUpload}
          title="Insert image"
        >
          <Image size={16} />
        </button>
      </div>
    </div>
  )
}

export default Toolbar
