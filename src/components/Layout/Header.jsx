import { Disc3, UtensilsCrossed, Share2, Users } from 'lucide-react'

export default function Header({ activeView, onViewChange }) {
    const navItems = [
        { id: 'roulette', label: 'ルーレット', icon: Disc3 },
        { id: 'menu', label: 'メニュー', icon: UtensilsCrossed },
        { id: 'share', label: '共有', icon: Share2 },
        { id: 'room', label: 'ルーム', icon: Users },
    ]

    return (
        <header className="app-header">
            <div className="header-inner">
                {/* Logo */}
                <button
                    onClick={() => onViewChange('roulette')}
                    className="header-logo"
                    aria-label="ホーム"
                >
                    <div className="header-logo-icon">
                        <span>BV</span>
                    </div>
                    <span className="header-logo-text gradient-text">
                        BITE VIBES
                    </span>
                </button>

                {/* Desktop Nav */}
                <nav className="header-nav">
                    {navItems.map(item => {
                        const Icon = item.icon
                        const isActive = activeView === item.id
                        return (
                            <button
                                key={item.id}
                                onClick={() => onViewChange(item.id)}
                                className={`header-nav-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={16} />
                                {item.label}
                            </button>
                        )
                    })}
                </nav>
            </div>
        </header>
    )
}
