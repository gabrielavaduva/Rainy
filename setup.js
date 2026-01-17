#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Setting up Rainy...\n')

// Install dependencies
console.log('📦 Installing dependencies...')
try {
  execSync('npm install', { stdio: 'inherit' })
  console.log('✅ Dependencies installed\n')
} catch (error) {
  console.error('❌ Failed to install dependencies')
  process.exit(1)
}

// Create data directories (for development)
const dataDir = path.join(__dirname, 'data')
const notesDir = path.join(dataDir, 'notes')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
  console.log('📁 Created data directory')
}

if (!fs.existsSync(notesDir)) {
  fs.mkdirSync(notesDir, { recursive: true })
  console.log('📁 Created notes directory')
}

// Create initial folders.json if it doesn't exist
const foldersFile = path.join(dataDir, 'folders.json')
if (!fs.existsSync(foldersFile)) {
  fs.writeFileSync(foldersFile, JSON.stringify([
    { id: 'root', name: 'Notes', parentId: null }
  ], null, 2))
  console.log('📝 Created initial folders.json')
}

console.log('\n✅ Setup complete!')
console.log('\nTo start the app, run:')
console.log('  npm run dev')
