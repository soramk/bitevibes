import { useRef, useEffect } from 'react'
import { ROULETTE_COLORS } from '../../utils/roulettePhysics'

export default function RouletteWheel({ items, angle, isSpinning }) {
    const canvasRef = useRef(null)
    const containerRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        const dpr = window.devicePixelRatio || 1
        const container = containerRef.current
        const size = Math.min(container.clientWidth, 340)

        canvas.width = size * dpr
        canvas.height = size * dpr
        canvas.style.width = `${size}px`
        canvas.style.height = `${size}px`
        ctx.scale(dpr, dpr)

        const cx = size / 2
        const cy = size / 2
        const radius = size / 2 - 10

        ctx.clearRect(0, 0, size, size)

        if (items.length === 0) return

        const segmentAngle = (2 * Math.PI) / items.length
        const rotationRad = (angle * Math.PI) / 180

        // Outer ring — subtle
        ctx.beginPath()
        ctx.arc(cx, cy, radius + 4, 0, 2 * Math.PI)
        ctx.strokeStyle = isSpinning
            ? 'rgba(255, 107, 107, 0.3)'
            : 'rgba(0, 0, 0, 0.06)'
        ctx.lineWidth = 2
        ctx.stroke()

        // Draw segments
        items.forEach((item, i) => {
            const startAngle = rotationRad + i * segmentAngle - Math.PI / 2
            const endAngle = startAngle + segmentAngle
            const color = ROULETTE_COLORS[i % ROULETTE_COLORS.length]

            ctx.beginPath()
            ctx.moveTo(cx, cy)
            ctx.arc(cx, cy, radius, startAngle, endAngle)
            ctx.closePath()
            ctx.fillStyle = color.bg
            ctx.fill()

            // Thin white border between segments
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
            ctx.lineWidth = 2
            ctx.stroke()

            // Text
            ctx.save()
            const textAngle = startAngle + segmentAngle / 2
            const textRadius = radius * 0.65
            const tx = cx + Math.cos(textAngle) * textRadius
            const ty = cy + Math.sin(textAngle) * textRadius

            ctx.translate(tx, ty)
            ctx.rotate(textAngle + Math.PI / 2)

            ctx.fillStyle = color.text
            ctx.font = `700 ${Math.min(13, 110 / items.length)}px 'Outfit', sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            // Text shadow for readability
            ctx.shadowColor = 'rgba(0,0,0,0.15)'
            ctx.shadowBlur = 2
            ctx.shadowOffsetY = 1

            const maxLen = items.length > 6 ? 5 : 8
            const displayName = item.name.length > maxLen
                ? item.name.slice(0, maxLen) + '…'
                : item.name

            ctx.fillText(displayName, 0, 0)
            ctx.shadowColor = 'transparent'
            ctx.restore()
        })

        // Center circle — white
        ctx.beginPath()
        ctx.arc(cx, cy, 22, 0, 2 * Math.PI)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.shadowColor = 'rgba(0,0,0,0.1)'
        ctx.shadowBlur = 8
        ctx.shadowOffsetY = 2
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)'
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.shadowColor = 'transparent'

        // Center BV text
        ctx.fillStyle = '#ff6b6b'
        ctx.font = "800 11px 'Outfit', sans-serif"
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('BV', cx, cy)

    }, [items, angle, isSpinning])

    return (
        <div className="roulette-wheel-container" ref={containerRef}>
            {/* Pointer — pointing DOWN toward wheel */}
            <div className="roulette-pointer">
                <svg width="22" height="30" viewBox="0 0 22 30">
                    <defs>
                        <linearGradient id="ptrGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ff6b6b" />
                            <stop offset="100%" stopColor="#ff4757" />
                        </linearGradient>
                        <filter id="ptrShadow">
                            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#ff6b6b" floodOpacity="0.3" />
                        </filter>
                    </defs>
                    <path
                        d="M2 0 L11 8 L20 0 L11 30 Z"
                        fill="url(#ptrGrad)"
                        filter="url(#ptrShadow)"
                    />
                </svg>
            </div>
            <canvas ref={canvasRef} className={`roulette-canvas ${isSpinning ? 'spinning' : ''}`} />
        </div>
    )
}
