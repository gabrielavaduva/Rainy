const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Folder operations
  getFolders: () => ipcRenderer.invoke('get-folders'),
  saveFolders: (folders) => ipcRenderer.invoke('save-folders', folders),

  // Note operations
  getNotes: () => ipcRenderer.invoke('get-notes'),
  saveNote: (note) => ipcRenderer.invoke('save-note', note),
  deleteNote: (noteId) => ipcRenderer.invoke('delete-note', noteId),
})
