import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderPlus, Pencil, Trash2 } from 'lucide-react'
import './Sidebar.css'

function FolderItem({ folder, folders, selectedFolderId, onSelectFolder, onAddFolder, onRenameFolder, onDeleteFolder, level = 0 }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(folder.name)

  const children = folders.filter(f => f.parentId === folder.id)
  const hasChildren = children.length > 0
  const isSelected = folder.id === selectedFolderId

  const handleRename = () => {
    if (editName.trim() && editName !== folder.name) {
      onRenameFolder(folder.id, editName.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleRename()
    if (e.key === 'Escape') {
      setEditName(folder.name)
      setIsEditing(false)
    }
  }

  return (
    <div className="folder-item">
      <div
        className={`folder-row ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <button
          className="expand-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className="folder-content" onClick={() => onSelectFolder(folder.id)}>
          <Folder size={16} />
          {isEditing ? (
            <input
              className="folder-name-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="folder-name">{folder.name}</span>
          )}
        </div>

        <div className="folder-actions">
          <button className="btn-icon" onClick={() => onAddFolder(folder.id)} title="Add subfolder">
            <FolderPlus size={14} />
          </button>
          <button className="btn-icon" onClick={() => setIsEditing(true)} title="Rename">
            <Pencil size={14} />
          </button>
          {folder.id !== 'root' && (
            <button className="btn-icon btn-danger" onClick={() => onDeleteFolder(folder.id)} title="Delete">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="folder-children">
          {children.map(child => (
            <FolderItem
              key={child.id}
              folder={child}
              folders={folders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              onAddFolder={onAddFolder}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Sidebar({ folders, selectedFolderId, onSelectFolder, onSaveFolders }) {
  const rootFolders = folders.filter(f => f.parentId === null)

  const handleAddFolder = (parentId) => {
    const newFolder = {
      id: crypto.randomUUID(),
      name: 'New Folder',
      parentId: parentId,
    }
    onSaveFolders([...folders, newFolder])
  }

  const handleRenameFolder = (folderId, newName) => {
    const updated = folders.map(f =>
      f.id === folderId ? { ...f, name: newName } : f
    )
    onSaveFolders(updated)
  }

  const handleDeleteFolder = (folderId) => {
    // Get all descendant folder IDs
    const getDescendants = (id) => {
      const children = folders.filter(f => f.parentId === id)
      return [id, ...children.flatMap(c => getDescendants(c.id))]
    }
    const toDelete = new Set(getDescendants(folderId))
    const updated = folders.filter(f => !toDelete.has(f.id))
    onSaveFolders(updated)
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span>Folders</span>
        <button className="btn-icon" onClick={() => handleAddFolder(null)} title="Add folder">
          <FolderPlus size={16} />
        </button>
      </div>
      <div className="folder-tree">
        {rootFolders.map(folder => (
          <FolderItem
            key={folder.id}
            folder={folder}
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
            onAddFolder={handleAddFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
          />
        ))}
      </div>
    </div>
  )
}

export default Sidebar
