import { PartyPopper, X } from 'lucide-react'

export default function ResultDisplay({ result, show, onClose }) {
    if (!show || !result) return null

    return (
        <div className="result-overlay animate-fade-in" onClick={onClose}>
            <div className="result-card glass-card animate-slide-up" onClick={e => e.stopPropagation()}>
                <button className="result-close btn-icon" onClick={onClose} aria-label="閉じる">
                    <X size={18} />
                </button>

                <div className="result-icon">
                    <PartyPopper size={40} />
                </div>

                <p className="result-label">今日のバイブスは...</p>

                <h2 className="result-name gradient-text">{result.name}</h2>

                <p className="result-sub">行くしかない！</p>

                <button className="btn-primary" onClick={onClose} style={{ marginTop: '20px' }}>
                    もう一回！
                </button>
            </div>
        </div>
    )
}
