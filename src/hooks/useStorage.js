import { useState, useEffect, useCallback } from 'react'

export function useStorage() {
  const [folders, setFolders] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [foldersData, notesData] = await Promise.all([
          window.electronAPI.getFolders(),
          window.electronAPI.getNotes(),
        ])
        setFolders(foldersData)
        setNotes(notesData)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Folder operations
  const saveFolders = useCallback(async (newFolders) => {
    const result = await window.electronAPI.saveFolders(newFolders)
    if (result.success) {
      setFolders(newFolders)
    }
    return result
  }, [])

  // Note operations
  const saveNote = useCallback(async (note) => {
    const result = await window.electronAPI.saveNote(note)
    if (result.success) {
      setNotes(prev => {
        const existing = prev.findIndex(n => n.id === note.id)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = note
          return updated
        }
        return [...prev, note]
      })
    }
    return result
  }, [])

  const deleteNote = useCallback(async (noteId) => {
    const result = await window.electronAPI.deleteNote(noteId)
    if (result.success) {
      setNotes(prev => prev.filter(n => n.id !== noteId))
    }
    return result
  }, [])

  return {
    folders,
    notes,
    loading,
    saveFolders,
    saveNote,
    deleteNote,
  }
}
