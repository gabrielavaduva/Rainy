const { MongoClient } = require('mongodb')

let client = null
let db = null
let isConnected = false

const SETTINGS_KEY = 'mongoDbUri'

async function connect(uri) {
  if (!uri) return false

  try {
    if (client) {
      await client.close()
    }

    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    })

    await client.connect()
    db = client.db('rainy')

    // Ensure collections exist
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map(c => c.name)

    if (!collectionNames.includes('notes')) {
      await db.createCollection('notes')
    }
    if (!collectionNames.includes('folders')) {
      await db.createCollection('folders')
      // Insert default root folder if empty
      const foldersCount = await db.collection('folders').countDocuments()
      if (foldersCount === 0) {
        await db.collection('folders').insertOne({
          id: 'root',
          name: 'Notes',
          parentId: null
        })
      }
    }

    isConnected = true
    console.log('Connected to MongoDB Atlas')
    return true
  } catch (error) {
    console.error('MongoDB connection error:', error.message)
    isConnected = false
    return false
  }
}

async function disconnect() {
  if (client) {
    await client.close()
    client = null
    db = null
    isConnected = false
  }
}

function getConnectionStatus() {
  return isConnected
}

// Notes operations
async function getNotes() {
  if (!isConnected || !db) return null
  try {
    const notes = await db.collection('notes').find({}).toArray()
    return notes.map(({ _id, ...note }) => note)
  } catch (error) {
    console.error('MongoDB getNotes error:', error.message)
    return null
  }
}

async function saveNote(note) {
  if (!isConnected || !db) return false
  try {
    await db.collection('notes').updateOne(
      { id: note.id },
      { $set: note },
      { upsert: true }
    )
    return true
  } catch (error) {
    console.error('MongoDB saveNote error:', error.message)
    return false
  }
}

async function deleteNote(noteId) {
  if (!isConnected || !db) return false
  try {
    await db.collection('notes').deleteOne({ id: noteId })
    return true
  } catch (error) {
    console.error('MongoDB deleteNote error:', error.message)
    return false
  }
}

// Folders operations
async function getFolders() {
  if (!isConnected || !db) return null
  try {
    const folders = await db.collection('folders').find({}).toArray()
    return folders.map(({ _id, ...folder }) => folder)
  } catch (error) {
    console.error('MongoDB getFolders error:', error.message)
    return null
  }
}

async function saveFolders(folders) {
  if (!isConnected || !db) return false
  try {
    // Replace all folders
    await db.collection('folders').deleteMany({})
    if (folders.length > 0) {
      await db.collection('folders').insertMany(folders)
    }
    return true
  } catch (error) {
    console.error('MongoDB saveFolders error:', error.message)
    return false
  }
}

module.exports = {
  connect,
  disconnect,
  getConnectionStatus,
  getNotes,
  saveNote,
  deleteNote,
  getFolders,
  saveFolders,
  SETTINGS_KEY
}
