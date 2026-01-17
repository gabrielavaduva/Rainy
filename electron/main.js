const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const mongodb = require('./mongodb')

const DATA_DIR = path.join(app.getPath('userData'), 'rainy-data')
const NOTES_DIR = path.join(DATA_DIR, 'notes')
const FOLDERS_FILE = path.join(DATA_DIR, 'folders.json')
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json')

function ensureDataDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(NOTES_DIR)) {
    fs.mkdirSync(NOTES_DIR, { recursive: true })
  }
  if (!fs.existsSync(FOLDERS_FILE)) {
    fs.writeFileSync(FOLDERS_FILE, JSON.stringify([
      { id: 'root', name: 'Notes', parentId: null }
    ], null, 2))
  }
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify({}, null, 2))
  }
}

function getSettings() {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

function saveSettings(settings) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2))
}

async function initMongoDB() {
  const settings = getSettings()
  if (settings.mongoDbUri) {
    await mongodb.connect(settings.mongoDbUri)
  }
}

function createWindow() {
  // Get icon path - use PNG for all platforms in dev
  const isDev = process.env.VITE_DEV_SERVER_URL
  const iconPath = isDev
    ? path.join(process.cwd(), 'build', 'icon.png')
    : path.join(__dirname, '../build', 'icon.png')

  // Set dock icon on macOS
  if (process.platform === 'darwin' && app.dock) {
    try {
      app.dock.setIcon(iconPath)
    } catch (e) {
      console.log('Could not set dock icon:', e.message)
    }
  }

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(async () => {
  ensureDataDirs()
  await initMongoDB()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC Handlers for folders (MongoDB with local fallback)
ipcMain.handle('get-folders', async () => {
  // Try MongoDB first
  const mongoFolders = await mongodb.getFolders()
  if (mongoFolders !== null) {
    return mongoFolders
  }

  // Fallback to local
  try {
    const data = fs.readFileSync(FOLDERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return [{ id: 'root', name: 'Notes', parentId: null }]
  }
})

ipcMain.handle('save-folders', async (event, folders) => {
  // Try MongoDB first
  const mongoSuccess = await mongodb.saveFolders(folders)

  // Always save locally as backup
  try {
    fs.writeFileSync(FOLDERS_FILE, JSON.stringify(folders, null, 2))
    return { success: true, synced: mongoSuccess }
  } catch (error) {
    return { success: false, error: error.message, synced: mongoSuccess }
  }
})

// IPC Handlers for notes (MongoDB with local fallback)
ipcMain.handle('get-notes', async () => {
  // Try MongoDB first
  const mongoNotes = await mongodb.getNotes()
  if (mongoNotes !== null) {
    return mongoNotes
  }

  // Fallback to local
  try {
    const files = fs.readdirSync(NOTES_DIR)
    const notes = files
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const content = fs.readFileSync(path.join(NOTES_DIR, f), 'utf-8')
        return JSON.parse(content)
      })
    return notes
  } catch (error) {
    return []
  }
})

ipcMain.handle('save-note', async (event, note) => {
  // Try MongoDB first
  const mongoSuccess = await mongodb.saveNote(note)

  // Always save locally as backup
  try {
    const filePath = path.join(NOTES_DIR, `${note.id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(note, null, 2))
    return { success: true, synced: mongoSuccess }
  } catch (error) {
    return { success: false, error: error.message, synced: mongoSuccess }
  }
})

ipcMain.handle('delete-note', async (event, noteId) => {
  // Try MongoDB first
  const mongoSuccess = await mongodb.deleteNote(noteId)

  // Always delete locally
  try {
    const filePath = path.join(NOTES_DIR, `${noteId}.json`)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    return { success: true, synced: mongoSuccess }
  } catch (error) {
    return { success: false, error: error.message, synced: mongoSuccess }
  }
})

// IPC Handlers for settings and MongoDB connection
ipcMain.handle('get-settings', async () => {
  const settings = getSettings()
  return {
    mongoDbUri: settings.mongoDbUri || '',
    isConnected: mongodb.getConnectionStatus()
  }
})

ipcMain.handle('save-mongodb-uri', async (event, uri) => {
  try {
    const settings = getSettings()
    settings.mongoDbUri = uri
    saveSettings(settings)

    if (uri) {
      const connected = await mongodb.connect(uri)
      return { success: true, connected }
    } else {
      await mongodb.disconnect()
      return { success: true, connected: false }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('get-connection-status', async () => {
  return mongodb.getConnectionStatus()
})

// Open external links in default browser
ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})
