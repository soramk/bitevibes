import { Download, X } from 'lucide-react'
import { MEAL_TYPE_LABELS } from '../../utils/mealType'
import './share.css'

export default function ImportDialog({ preset, onImport, onCancel }) {
    if (!preset) return null

    return (
        <div className="import-overlay" onClick={onCancel}>
            <div className="import-dialog glass-card animate-slide-up" onClick={e => e.stopPropagation()}>
                <button className="import-close btn-icon" onClick={onCancel} aria-label="閉じる">
                    <X size={18} />
                </button>

                <div className="import-icon">
                    <Download size={36} />
                </div>

                <h2 className="import-title">メニューリストが共有されました</h2>

                <div className="import-preview glass-card">
                    <div className="import-preview-header">
                        <span className="import-preview-name">{preset.name}</span>
                        {preset.mealType && preset.mealType !== 'all' && (
                            <span className="import-preview-meal">
                                {MEAL_TYPE_LABELS[preset.mealType]}
                            </span>
                        )}
                    </div>
                    <div className="import-preview-items">
                        {preset.items?.map(item => (
                            <span key={item.id} className="share-preview-tag">
                                {item.name}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="import-actions">
                    <button
                        className="btn-primary"
                        onClick={() => onImport(preset)}
                        id="import-confirm-button"
                    >
                        <Download size={18} />
                        インポート
                    </button>
                    <button className="btn-secondary" onClick={onCancel}>
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    )
}
