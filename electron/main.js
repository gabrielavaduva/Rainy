const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

const DATA_DIR = path.join(app.getPath('userData'), 'rainy-data')
const NOTES_DIR = path.join(DATA_DIR, 'notes')
const FOLDERS_FILE = path.join(DATA_DIR, 'folders.json')

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
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  ensureDataDirs()
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

// IPC Handlers for folders
ipcMain.handle('get-folders', async () => {
  try {
    const data = fs.readFileSync(FOLDERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return [{ id: 'root', name: 'Notes', parentId: null }]
  }
})

ipcMain.handle('save-folders', async (event, folders) => {
  try {
    fs.writeFileSync(FOLDERS_FILE, JSON.stringify(folders, null, 2))
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// IPC Handlers for notes
ipcMain.handle('get-notes', async () => {
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
  try {
    const filePath = path.join(NOTES_DIR, `${note.id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(note, null, 2))
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('delete-note', async (event, noteId) => {
  try {
    const filePath = path.join(NOTES_DIR, `${noteId}.json`)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})
