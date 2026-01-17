import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { useState, useRef, useCallback } from 'react'

const ResizableImageComponent = ({ node, updateAttributes, selected }) => {
  const [isResizing, setIsResizing] = useState(false)
  const imageRef = useRef(null)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsResizing(true)
    startX.current = e.clientX
    startWidth.current = imageRef.current?.offsetWidth || node.attrs.width || 300

    const handleMouseMove = (e) => {
      const diff = e.clientX - startX.current
      const newWidth = Math.max(100, startWidth.current + diff)
      updateAttributes({ width: newWidth })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [node.attrs.width, updateAttributes])

  return (
    <NodeViewWrapper className="resizable-image-wrapper">
      <div
        className={`resizable-image-container ${selected ? 'selected' : ''} ${isResizing ? 'resizing' : ''}`}
        style={{ width: node.attrs.width ? `${node.attrs.width}px` : 'auto', maxWidth: '100%' }}
      >
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          title={node.attrs.title || ''}
          style={{ width: '100%', height: 'auto' }}
          draggable={false}
        />
        <div
          className="resize-handle resize-handle-right"
          onMouseDown={handleMouseDown}
        />
        <div
          className="resize-handle resize-handle-left"
          onMouseDown={handleMouseDown}
        />
      </div>
    </NodeViewWrapper>
  )
}

export const ResizableImage = Node.create({
  name: 'image',

  addOptions() {
    return {
      inline: true,
      allowBase64: true,
      HTMLAttributes: {},
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent)
  },

  addCommands() {
    return {
      setImage: options => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },
})

export default ResizableImage
