import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import NoteList from './components/NoteList/NoteList'
import Editor from './components/Editor/Editor'
import ThemeToggle from './components/ThemeToggle/ThemeToggle'
import { useStorage } from './hooks/useStorage'

function App() {
  const { folders, notes, saveFolders, saveNote, deleteNote, loading } = useStorage()
  const [selectedFolderId, setSelectedFolderId] = useState('root')
  const [selectedNoteId, setSelectedNoteId] = useState(null)

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

  return (
    <div className="app">
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
      <div className="main-content">
        <div className="header">
          <h1 className="app-title">Rainy</h1>
          <ThemeToggle />
        </div>
        <Editor
          note={selectedNote}
          onUpdate={handleUpdateNote}
        />
      </div>
    </div>
  )
}

export default App
