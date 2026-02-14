import { Disc3, UtensilsCrossed, Share2, Users } from 'lucide-react'

const navItems = [
    { id: 'roulette', label: 'ルーレット', icon: Disc3 },
    { id: 'menu', label: 'メニュー', icon: UtensilsCrossed },
    { id: 'share', label: '共有', icon: Share2 },
    { id: 'room', label: 'ルーム', icon: Users },
]

export default function BottomNav({ activeView, onViewChange }) {
    return (
        <nav className="bottom-nav" id="bottom-nav">
            {navItems.map(item => {
                const Icon = item.icon
                const isActive = activeView === item.id
                return (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                        aria-label={item.label}
                    >
                        <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                        <span className="bottom-nav-label">{item.label}</span>
                    </button>
                )
            })}
        </nav>
    )
}
