import { useState } from 'react'
import { Copy, Check, Link, ExternalLink, CloudOff } from 'lucide-react'
import { generateShareUrl } from '../../utils/shareEncoder'
import { createSharedPreset } from '../../utils/firebase'
import { MEAL_TYPE_LABELS } from '../../utils/mealType'
import './share.css'

export default function SharePanel({ presets, activePreset, onImport, isFirebaseConfigured, userId }) {
    const [copied, setCopied] = useState(false)
    const [shareUrl, setShareUrl] = useState('')
    const [selectedPresetId, setSelectedPresetId] = useState(activePreset?.id || '')

    const selectedPreset = presets.find(p => p.id === selectedPresetId) || activePreset

    const handleGenerateLink = () => {
        if (!selectedPreset) return
        const url = generateShareUrl(selectedPreset)
        if (url) {
            setShareUrl(url)
            setCopied(false)
        }
    }

    const handleCopy = async () => {
        if (!shareUrl) return
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // フォールバック
            const textarea = document.createElement('textarea')
            textarea.value = shareUrl
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleNativeShare = async () => {
        if (!shareUrl || !navigator.share) return
        try {
            await navigator.share({
                title: `BITE VIBES - ${selectedPreset.name}`,
                text: `「${selectedPreset.name}」のメニューリストを共有します！`,
                url: shareUrl,
            })
        } catch {
            // ユーザーがキャンセル
        }
    }

    return (
        <div className="share-panel">
            <div className="share-header">
                <h2 className="share-title">共有</h2>
                <p className="share-subtitle">お気に入りのメニューリストを友達に送ろう</p>
            </div>

            {/* プリセット選択 */}
            <div className="share-section glass-card">
                <label className="share-label">共有するプリセット</label>
                <select
                    className="share-select input-field"
                    value={selectedPresetId}
                    onChange={(e) => {
                        setSelectedPresetId(e.target.value)
                        setShareUrl('')
                    }}
                    id="share-preset-select"
                >
                    {presets.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name} ({p.items?.length || 0}品) {p.mealType !== 'all' ? `- ${MEAL_TYPE_LABELS[p.mealType] || ''}` : ''}
                        </option>
                    ))}
                </select>

                {selectedPreset && (
                    <div className="share-preview">
                        <div className="share-preview-header">
                            <span className="share-preview-name">{selectedPreset.name}</span>
                            <span className="share-preview-count">{selectedPreset.items?.length || 0}品</span>
                        </div>
                        <div className="share-preview-items">
                            {selectedPreset.items?.slice(0, 8).map(item => (
                                <span key={item.id} className="share-preview-tag">
                                    {item.name}
                                </span>
                            ))}
                            {(selectedPreset.items?.length || 0) > 8 && (
                                <span className="share-preview-tag more">
                                    +{selectedPreset.items.length - 8}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <button
                    className="btn-primary share-generate-btn"
                    onClick={handleGenerateLink}
                    id="share-generate-button"
                >
                    <Link size={18} />
                    共有リンクを生成
                </button>
            </div>

            {/* 生成されたURL */}
            {shareUrl && (
                <div className="share-result glass-card animate-slide-up">
                    <label className="share-label">共有リンク</label>
                    <div className="share-url-container">
                        <input
                            type="text"
                            className="input-field share-url-input"
                            value={shareUrl}
                            readOnly
                            id="share-url-input"
                        />
                        <button
                            className={`btn-primary share-copy-btn ${copied ? 'copied' : ''}`}
                            onClick={handleCopy}
                            id="share-copy-button"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? 'コピー済み' : 'コピー'}
                        </button>
                    </div>

                    {navigator.share && (
                        <button
                            className="btn-secondary share-native-btn"
                            onClick={handleNativeShare}
                        >
                            <ExternalLink size={16} />
                            他のアプリで共有
                        </button>
                    )}
                </div>
            )}

            {/* Firebase未設定時の案内 */}
            {!isFirebaseConfigured && (
                <div className="share-info glass-card">
                    <CloudOff size={20} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                    <div>
                        <p className="share-info-title">URLベース共有が利用可能</p>
                        <p className="share-info-text">
                            Firebase設定を行うと、より短いリンクでの共有が可能になります。
                            現在はURLにデータを埋め込む方式で動作しています。
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
