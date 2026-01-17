import { FileText, Plus, Trash2 } from 'lucide-react'
import './NoteList.css'

function NoteList({ notes, selectedNoteId, onSelectNote, onCreateNote, onDeleteNote }) {
  const sortedNotes = [...notes].sort((a, b) =>
    new Date(b.updatedAt) - new Date(a.updatedAt)
  )

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const getPreview = (content) => {
    if (!content) return 'No content'
    // Strip HTML tags and get first 50 chars
    const text = content.replace(/<[^>]*>/g, '').trim()
    return text.length > 50 ? text.substring(0, 50) + '...' : text || 'No content'
  }

  return (
    <div className="note-list">
      <div className="note-list-header">
        <span>Notes ({notes.length})</span>
        <button className="btn-icon" onClick={onCreateNote} title="New note">
          <Plus size={18} />
        </button>
      </div>
      <div className="note-list-content">
        {sortedNotes.length === 0 ? (
          <div className="empty-state">
            <FileText size={32} />
            <p>No notes in this folder</p>
            <button className="btn-primary" onClick={onCreateNote}>
              Create Note
            </button>
          </div>
        ) : (
          sortedNotes.map(note => (
            <div
              key={note.id}
              className={`note-item ${note.id === selectedNoteId ? 'selected' : ''}`}
              onClick={() => onSelectNote(note.id)}
            >
              <div className="note-item-content">
                <div className="note-title">{note.title || 'Untitled Note'}</div>
                <div className="note-preview">{getPreview(note.content)}</div>
                <div className="note-date">{formatDate(note.updatedAt)}</div>
              </div>
              <button
                className="btn-icon btn-danger note-delete"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteNote(note.id)
                }}
                title="Delete note"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NoteList
