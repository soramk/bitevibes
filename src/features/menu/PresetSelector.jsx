import { useState } from 'react'
import { ChevronDown, Plus, Trash2, Pencil, Check, X, Sun, Moon, Globe } from 'lucide-react'
import { MEAL_TYPE_LABELS } from '../../utils/mealType'
import './menu.css'

const MEAL_TYPE_OPTIONS = [
    { value: 'all', label: 'すべて', icon: Globe },
    { value: 'lunch', label: 'ランチ', icon: Sun },
    { value: 'dinner', label: 'ディナー', icon: Moon },
]

export default function PresetSelector({
    presets,
    activePresetId,
    onSelect,
    onAdd,
    onDelete,
    onRename,
    onMealTypeChange,
    mealType,
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [newName, setNewName] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [editingName, setEditingName] = useState('')

    const activePreset = presets.find(p => p.id === activePresetId) || presets[0]

    const handleAdd = () => {
        const trimmed = newName.trim()
        if (!trimmed) return
        onAdd(trimmed)
        setNewName('')
        setIsAdding(false)
        setIsOpen(false)
    }

    const startRename = (e, preset) => {
        e.stopPropagation()
        setEditingId(preset.id)
        setEditingName(preset.name)
    }

    const confirmRename = (e) => {
        e.stopPropagation()
        const trimmed = editingName.trim()
        if (trimmed && editingId) {
            onRename(editingId, trimmed)
        }
        setEditingId(null)
    }

    const handleDelete = (e, id) => {
        e.stopPropagation()
        if (presets.length <= 1) return
        onDelete(id)
    }

    const cycleMealType = (e, preset) => {
        e.stopPropagation()
        if (!onMealTypeChange) return
        const types = ['all', 'lunch', 'dinner']
        const currentIndex = types.indexOf(preset.mealType || 'all')
        const nextType = types[(currentIndex + 1) % types.length]
        onMealTypeChange(preset.id, nextType)
    }

    const getMealTypeIcon = (type) => {
        const opt = MEAL_TYPE_OPTIONS.find(o => o.value === type) || MEAL_TYPE_OPTIONS[0]
        const Icon = opt.icon
        return <Icon size={12} />
    }

    return (
        <div className="preset-selector">
            <button
                className="preset-trigger glass-card"
                onClick={() => setIsOpen(!isOpen)}
                id="preset-selector-trigger"
            >
                <div className="preset-trigger-content">
                    <span className="preset-label">プリセット</span>
                    <span className="preset-name">{activePreset?.name || '選択してください'}</span>
                </div>
                <div className="preset-trigger-right">
                    {activePreset?.mealType && activePreset.mealType !== 'all' && (
                        <span className={`preset-meal-badge ${activePreset.mealType}`}>
                            {getMealTypeIcon(activePreset.mealType)}
                            {MEAL_TYPE_LABELS[activePreset.mealType]}
                        </span>
                    )}
                    <ChevronDown
                        size={18}
                        style={{
                            color: 'var(--color-text-secondary)',
                            transition: 'transform 0.3s ease',
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                    />
                </div>
            </button>

            {isOpen && (
                <div className="preset-dropdown glass-card animate-fade-in">
                    {presets.map(preset => (
                        <div
                            key={preset.id}
                            className={`preset-option ${preset.id === activePresetId ? 'active' : ''}`}
                            onClick={() => {
                                if (editingId !== preset.id) {
                                    onSelect(preset.id)
                                    setIsOpen(false)
                                }
                            }}
                        >
                            {editingId === preset.id ? (
                                <div className="preset-edit-row" onClick={e => e.stopPropagation()}>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') confirmRename(e)
                                            if (e.key === 'Escape') setEditingId(null)
                                        }}
                                        autoFocus
                                        maxLength={20}
                                        style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                                    />
                                    <button className="btn-icon" onClick={confirmRename} style={{ width: '32px', height: '32px' }}>
                                        <Check size={14} />
                                    </button>
                                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); setEditingId(null) }} style={{ width: '32px', height: '32px' }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="preset-option-left">
                                        <span className="preset-option-name">
                                            {preset.name}
                                        </span>
                                        <div className="preset-option-meta">
                                            <span className="preset-option-count">{preset.items?.length || 0}品</span>
                                            {preset.mealType && preset.mealType !== 'all' && (
                                                <span className={`preset-meal-badge small ${preset.mealType}`}>
                                                    {getMealTypeIcon(preset.mealType)}
                                                    {MEAL_TYPE_LABELS[preset.mealType]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="preset-option-actions">
                                        {onMealTypeChange && (
                                            <button
                                                className="btn-icon"
                                                onClick={(e) => cycleMealType(e, preset)}
                                                style={{ width: '28px', height: '28px' }}
                                                aria-label="食事タイプ変更"
                                                title={`現在: ${MEAL_TYPE_LABELS[preset.mealType] || 'すべて'}`}
                                            >
                                                {getMealTypeIcon(preset.mealType || 'all')}
                                            </button>
                                        )}
                                        <button
                                            className="btn-icon"
                                            onClick={(e) => startRename(e, preset)}
                                            style={{ width: '28px', height: '28px' }}
                                            aria-label="名前変更"
                                        >
                                            <Pencil size={12} />
                                        </button>
                                        {presets.length > 1 && (
                                            <button
                                                className="btn-icon menu-delete-btn"
                                                onClick={(e) => handleDelete(e, preset.id)}
                                                style={{ width: '28px', height: '28px' }}
                                                aria-label="削除"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}

                    {/* Add new preset */}
                    {isAdding ? (
                        <div className="preset-add-form" onClick={e => e.stopPropagation()}>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="プリセット名..."
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAdd()
                                    if (e.key === 'Escape') {
                                        setIsAdding(false)
                                        setNewName('')
                                    }
                                }}
                                autoFocus
                                maxLength={20}
                                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                            />
                            <button
                                className="btn-primary"
                                onClick={handleAdd}
                                disabled={!newName.trim()}
                                style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                            >
                                追加
                            </button>
                        </div>
                    ) : (
                        <button
                            className="preset-add-btn"
                            onClick={(e) => { e.stopPropagation(); setIsAdding(true) }}
                        >
                            <Plus size={16} />
                            新しいプリセット
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
