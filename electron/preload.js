const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Folder operations
  getFolders: () => ipcRenderer.invoke('get-folders'),
  saveFolders: (folders) => ipcRenderer.invoke('save-folders', folders),

  // Note operations
  getNotes: () => ipcRenderer.invoke('get-notes'),
  saveNote: (note) => ipcRenderer.invoke('save-note', note),
  deleteNote: (noteId) => ipcRenderer.invoke('delete-note', noteId),

  // Settings & MongoDB
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveMongoDbUri: (uri) => ipcRenderer.invoke('save-mongodb-uri', uri),
  getConnectionStatus: () => ipcRenderer.invoke('get-connection-status'),

  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
})
