import { useState, useEffect } from 'react'
import { Apple, CloudRain, Settings as SettingsIcon } from 'lucide-react'
import Sidebar from './components/Sidebar/Sidebar'
import NoteList from './components/NoteList/NoteList'
import Editor from './components/Editor/Editor'
import ThemeToggle from './components/ThemeToggle/ThemeToggle'
import AppleNotesView from './components/AppleNotesView/AppleNotesView'
import Settings from './components/Settings/Settings'
import { useStorage } from './hooks/useStorage'

function App() {
  const { folders, notes, saveFolders, saveNote, deleteNote, loading } = useStorage()
  const [selectedFolderId, setSelectedFolderId] = useState('root')
  const [selectedNoteId, setSelectedNoteId] = useState(null)
  const [viewMode, setViewMode] = useState('rainy') // 'rainy' or 'apple'
  const [showSettings, setShowSettings] = useState(false)

  const selectedNote = notes.find(n => n.id === selectedNoteId)
  const folderNotes = notes.filter(n => n.folderId === selectedFolderId)

  const handleCreateNote = async () => {
    const newNote = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      folderId: selectedFolderId,
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await saveNote(newNote)
    setSelectedNoteId(newNote.id)
  }

  const handleUpdateNote = async (updates) => {
    if (!selectedNote) return
    const updated = {
      ...selectedNote,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    await saveNote(updated)
  }

  const handleDeleteNote = async (noteId) => {
    await deleteNote(noteId)
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  const isAppleView = viewMode === 'apple'

  return (
    <div className="app">
      {!isAppleView && (
        <>
          <Sidebar
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
            onSaveFolders={saveFolders}
          />
          <NoteList
            notes={folderNotes}
            selectedNoteId={selectedNoteId}
            onSelectNote={setSelectedNoteId}
            onCreateNote={handleCreateNote}
            onDeleteNote={handleDeleteNote}
          />
        </>
      )}
      <div className="main-content">
        <div className="header">
          <h1 className="app-title">{isAppleView ? 'Apple Notes' : 'Rainy'}</h1>
          <div className="header-actions">
            <button
              className="btn-icon view-toggle"
              onClick={() => setViewMode(isAppleView ? 'rainy' : 'apple')}
              title={`Switch to ${isAppleView ? 'Rainy' : 'Apple Notes'}`}
            >
              {isAppleView ? <CloudRain size={18} /> : <Apple size={18} />}
            </button>
            <button
              className="btn-icon"
              onClick={() => setShowSettings(true)}
              title="Settings"
            >
              <SettingsIcon size={18} />
            </button>
            <ThemeToggle />
          </div>
        </div>
        {isAppleView ? (
          <AppleNotesView />
        ) : (
          <Editor
            note={selectedNote}
            onUpdate={handleUpdateNote}
          />
        )}
      </div>

      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}

export default App
