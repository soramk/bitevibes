import { useState, useRef, useCallback, useEffect } from 'react'
import { Play, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'
import {
    getInitialVelocity,
    physicsStep,
    getSelectedIndex,
    ROULETTE_COLORS,
    vibrateDevice,
} from '../../utils/roulettePhysics'
import RouletteWheel from './RouletteWheel'
import ResultDisplay from './ResultDisplay'
import './roulette.css'

export default function Roulette({ items, onResult }) {
    const [angle, setAngle] = useState(0)
    const [isSpinning, setIsSpinning] = useState(false)
    const [result, setResult] = useState(null)
    const [showResult, setShowResult] = useState(false)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const animFrameRef = useRef(null)
    const velocityRef = useRef(0)
    const angleRef = useRef(0)
    const audioCtxRef = useRef(null)

    // サウンドエフェクト
    const playTickSound = useCallback(() => {
        if (!soundEnabled) return
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
            }
            const ctx = audioCtxRef.current
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.frequency.value = 800 + Math.random() * 400
            osc.type = 'sine'
            gain.gain.setValueAtTime(0.05, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
            osc.start(ctx.currentTime)
            osc.stop(ctx.currentTime + 0.05)
        } catch (e) {
            // Audio not supported
        }
    }, [soundEnabled])

    const playWinSound = useCallback(() => {
        if (!soundEnabled) return
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
            }
            const ctx = audioCtxRef.current
            const notes = [523.25, 659.25, 783.99, 1046.50]
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator()
                const gain = ctx.createGain()
                osc.connect(gain)
                gain.connect(ctx.destination)
                osc.frequency.value = freq
                osc.type = 'sine'
                const startTime = ctx.currentTime + i * 0.12
                gain.gain.setValueAtTime(0.1, startTime)
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3)
                osc.start(startTime)
                osc.stop(startTime + 0.3)
            })
        } catch (e) {
            // Audio not supported
        }
    }, [soundEnabled])

    // ルーレット回転アニメーション
    const animate = useCallback(() => {
        const { angle: newAngle, velocity, stopped } = physicsStep(
            angleRef.current,
            velocityRef.current,
        )

        angleRef.current = newAngle
        velocityRef.current = velocity
        setAngle(newAngle)

        // 速度に応じてチック音
        if (velocity > 2 && Math.floor(newAngle / (360 / Math.max(items.length, 1))) !==
            Math.floor((newAngle - velocity) / (360 / Math.max(items.length, 1)))) {
            playTickSound()
        }

        if (stopped) {
            setIsSpinning(false)
            const selectedIdx = getSelectedIndex(newAngle, items.length)
            if (selectedIdx >= 0 && items[selectedIdx]) {
                const selectedItem = items[selectedIdx]
                setResult(selectedItem)
                setShowResult(true)
                playWinSound()
                vibrateDevice([100, 30, 100, 30, 200])

                // Confetti
                confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ROULETTE_COLORS.slice(0, 5).map(c => c.bg),
                })

                // 履歴に追加
                if (onResult) {
                    onResult(selectedItem)
                }
            }
            return
        }

        animFrameRef.current = requestAnimationFrame(animate)
    }, [items, playTickSound, playWinSound, onResult])

    const spin = useCallback(() => {
        if (isSpinning || items.length === 0) return

        setShowResult(false)
        setResult(null)
        setIsSpinning(true)
        velocityRef.current = getInitialVelocity()
        vibrateDevice([50])

        animFrameRef.current = requestAnimationFrame(animate)
    }, [isSpinning, items.length, animate])

    const reset = useCallback(() => {
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current)
        }
        setIsSpinning(false)
        setShowResult(false)
        setResult(null)
        setAngle(0)
        angleRef.current = 0
        velocityRef.current = 0
    }, [])

    useEffect(() => {
        return () => {
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current)
            }
        }
    }, [])

    if (items.length === 0) {
        return (
            <div className="roulette-empty glass-card">
                <Sparkles size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px' }} />
                <h2 style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', fontWeight: 500 }}>
                    メニューが選択されていません
                </h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
                    メニュー管理からアイテムを追加するか、有効にしてください
                </p>
            </div>
        )
    }

    return (
        <div className="roulette-container">
            {/* Sound toggle */}
            <div className="roulette-sound-toggle">
                <button
                    className="btn-icon"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    aria-label={soundEnabled ? 'サウンドオフ' : 'サウンドオン'}
                >
                    {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
            </div>

            {/* Roulette Wheel */}
            <RouletteWheel items={items} angle={angle} isSpinning={isSpinning} />

            {/* Controls */}
            <div className="roulette-controls">
                <button
                    className={`btn-primary roulette-spin-btn ${isSpinning ? 'spinning' : ''}`}
                    onClick={spin}
                    disabled={isSpinning || items.length === 0}
                    id="spin-button"
                >
                    <Play size={20} />
                    {isSpinning ? 'スピン中...' : 'VIBES!'}
                </button>

                <button
                    className="btn-secondary"
                    onClick={reset}
                    disabled={isSpinning}
                    id="reset-button"
                >
                    <RotateCcw size={16} />
                    リセット
                </button>
            </div>

            {/* Result */}
            <ResultDisplay result={result} show={showResult} onClose={() => setShowResult(false)} />
        </div>
    )
}
