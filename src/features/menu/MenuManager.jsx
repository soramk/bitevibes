import { useState } from 'react'
import { Plus, Trash2, GripVertical, ToggleLeft, ToggleRight, Pencil, Check, X } from 'lucide-react'
import './menu.css'

export default function MenuManager({ items, onAdd, onRemove, onUpdate, onToggle }) {
    const [newItemName, setNewItemName] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [editingName, setEditingName] = useState('')

    const handleAdd = (e) => {
        e.preventDefault()
        const trimmed = newItemName.trim()
        if (!trimmed) return
        onAdd(trimmed)
        setNewItemName('')
    }

    const startEdit = (item) => {
        setEditingId(item.id)
        setEditingName(item.name)
    }

    const confirmEdit = () => {
        const trimmed = editingName.trim()
        if (trimmed && editingId) {
            onUpdate(editingId, trimmed)
        }
        setEditingId(null)
        setEditingName('')
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditingName('')
    }

    const enabledCount = items.filter(i => i.enabled).length

    return (
        <div className="menu-manager">
            <div className="menu-header">
                <h2 className="menu-title">メニュー管理</h2>
                <span className="menu-count">
                    {enabledCount} / {items.length} 有効
                </span>
            </div>

            {/* Add form */}
            <form className="menu-add-form" onSubmit={handleAdd}>
                <input
                    type="text"
                    className="input-field"
                    placeholder="新しいメニューを追加..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    maxLength={30}
                    id="menu-add-input"
                />
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={!newItemName.trim()}
                    id="menu-add-button"
                    style={{ padding: '12px 20px', flexShrink: 0 }}
                >
                    <Plus size={18} />
                    追加
                </button>
            </form>

            {/* Menu list */}
            <div className="menu-list">
                {items.length === 0 ? (
                    <div className="menu-empty">
                        <p>まだメニューがありません</p>
                        <p className="menu-empty-sub">上のフォームからメニューを追加しましょう</p>
                    </div>
                ) : (
                    items.map((item, index) => (
                        <div
                            key={item.id}
                            className={`menu-item glass-card ${!item.enabled ? 'disabled' : ''}`}
                            style={{ animationDelay: `${index * 30}ms` }}
                        >
                            <div className="menu-item-grip">
                                <GripVertical size={16} />
                            </div>

                            {editingId === item.id ? (
                                <div className="menu-item-edit">
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') confirmEdit()
                                            if (e.key === 'Escape') cancelEdit()
                                        }}
                                        autoFocus
                                        maxLength={30}
                                    />
                                    <button className="btn-icon" onClick={confirmEdit} aria-label="確定">
                                        <Check size={16} />
                                    </button>
                                    <button className="btn-icon" onClick={cancelEdit} aria-label="キャンセル">
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className={`menu-item-name ${!item.enabled ? 'line-through' : ''}`}>
                                        {item.name}
                                    </span>

                                    <div className="menu-item-actions">
                                        <button
                                            className="btn-icon"
                                            onClick={() => startEdit(item)}
                                            aria-label="編集"
                                        >
                                            <Pencil size={14} />
                                        </button>

                                        <button
                                            className="menu-toggle-btn"
                                            onClick={() => onToggle(item.id)}
                                            aria-label={item.enabled ? '無効にする' : '有効にする'}
                                        >
                                            {item.enabled ? (
                                                <ToggleRight size={24} style={{ color: 'var(--color-accent-emerald)' }} />
                                            ) : (
                                                <ToggleLeft size={24} style={{ color: 'var(--color-text-muted)' }} />
                                            )}
                                        </button>

                                        <button
                                            className="btn-icon menu-delete-btn"
                                            onClick={() => onRemove(item.id)}
                                            aria-label="削除"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
