import { useState, useEffect } from 'react'
import { X, Database, Check, AlertCircle } from 'lucide-react'
import './Settings.css'

function Settings({ isOpen, onClose }) {
  const [mongoUri, setMongoUri] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
  }, [isOpen])

  const loadSettings = async () => {
    try {
      const settings = await window.electronAPI.getSettings()
      setMongoUri(settings.mongoDbUri || '')
      setIsConnected(settings.isConnected)
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      const result = await window.electronAPI.saveMongoDbUri(mongoUri)
      if (result.success) {
        setIsConnected(result.connected)
        setMessage({
          type: result.connected ? 'success' : 'info',
          text: result.connected
            ? 'Connected to MongoDB Atlas!'
            : mongoUri
              ? 'Could not connect. Using local storage.'
              : 'MongoDB disconnected. Using local storage.'
        })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save settings' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <div className="settings-section-header">
              <Database size={18} />
              <h3>MongoDB Atlas</h3>
              <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? 'Connected' : 'Not connected'}
              </span>
            </div>

            <p className="settings-description">
              Connect to MongoDB Atlas to sync your notes across devices.
              Your notes will also be saved locally as a backup.
            </p>

            <div className="settings-field">
              <label htmlFor="mongo-uri">Connection String</label>
              <input
                id="mongo-uri"
                type="password"
                value={mongoUri}
                onChange={e => setMongoUri(e.target.value)}
                placeholder="mongodb+srv://user:password@cluster.mongodb.net"
                spellCheck={false}
              />
              <span className="settings-hint">
                Get this from your MongoDB Atlas dashboard under "Connect"
              </span>
            </div>

            {message && (
              <div className={`settings-message ${message.type}`}>
                {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                {message.text}
              </div>
            )}

            <button
              className="btn-primary settings-save"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save & Connect'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
