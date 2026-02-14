import { useState, useEffect, useRef, useCallback } from 'react'
import { Users, Plus, LogIn, Copy, Check, Play, X, CloudOff, Wifi } from 'lucide-react'
import {
    isFirebaseConfigured,
    createRoom,
    joinRoom,
    onRoomUpdate,
    updateRoomRouletteState,
    deleteRoom,
} from '../../utils/firebase'
import { ROULETTE_COLORS, vibrateDevice } from '../../utils/roulettePhysics'
import confetti from 'canvas-confetti'
import './realtime.css'

export default function RealtimeRoom({ presets, activePreset, userId, onResult }) {
    const [mode, setMode] = useState(null) // null | 'create' | 'join'
    const [roomCode, setRoomCode] = useState('')
    const [joinCode, setJoinCode] = useState('')
    const [roomData, setRoomData] = useState(null)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)
    const unsubRef = useRef(null)
    const prevSpinning = useRef(false)

    // ルーム退出時にリスナー解除
    useEffect(() => {
        return () => {
            if (unsubRef.current) unsubRef.current()
        }
    }, [])

    // スピン結果の検知
    useEffect(() => {
        if (!roomData) return
        const { rouletteState } = roomData
        if (prevSpinning.current && !rouletteState.isSpinning && rouletteState.result) {
            vibrateDevice([100, 30, 100, 30, 200])
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ROULETTE_COLORS.slice(0, 5).map(c => c.bg),
            })
            if (onResult) {
                onResult({ name: rouletteState.result })
            }
        }
        prevSpinning.current = rouletteState.isSpinning
    }, [roomData?.rouletteState?.isSpinning, roomData?.rouletteState?.result, onResult])

    const handleCreate = async () => {
        if (!activePreset) {
            setError('プリセットを選択してください')
            return
        }
        if (!userId) {
            setError('認証中です。しばらくお待ちください...')
            return
        }
        setError('')
        try {
            const code = await createRoom(userId, activePreset)
            if (code) {
                setRoomCode(code)
                setMode('host')
                // リアルタイムリスナー開始
                unsubRef.current = onRoomUpdate(code, (data) => {
                    setRoomData(data)
                })
            } else {
                setError('ルームの作成に失敗しました')
            }
        } catch (e) {
            console.error('[BiteVibes] Room create error:', e)
            setError(`ルームの作成に失敗しました: ${e.message}`)
        }
    }

    const handleJoin = async () => {
        if (!userId || !joinCode.trim()) return
        setError('')
        const data = await joinRoom(joinCode.trim().toUpperCase(), userId)
        if (data) {
            setRoomCode(joinCode.trim().toUpperCase())
            setMode('guest')
            setRoomData(data)
            // リアルタイムリスナー開始
            unsubRef.current = onRoomUpdate(joinCode.trim().toUpperCase(), (d) => {
                setRoomData(d)
            })
        } else {
            setError('ルームが見つかりません。コードを確認してください。')
        }
    }

    const handleSpin = async () => {
        if (!roomCode || !roomData) return
        const items = roomData.preset?.items?.filter(i => i.enabled) || []
        if (items.length === 0) return

        const randomIdx = Math.floor(Math.random() * items.length)
        const result = items[randomIdx].name

        // スピン開始
        await updateRoomRouletteState(roomCode, {
            isSpinning: true,
            angle: 0,
            result: null,
        })

        // 3秒後に結果を設定
        setTimeout(async () => {
            await updateRoomRouletteState(roomCode, {
                isSpinning: false,
                angle: ((360 / items.length) * randomIdx + Math.random() * (360 / items.length)) % 360,
                result,
            })
        }, 3000)
    }

    const handleLeave = async () => {
        if (unsubRef.current) unsubRef.current()
        if (mode === 'host' && roomCode) {
            await deleteRoom(roomCode)
        }
        setRoomCode('')
        setRoomData(null)
        setMode(null)
        setJoinCode('')
        setError('')
        prevSpinning.current = false
    }

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(roomCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    // Firebase未設定
    if (!isFirebaseConfigured) {
        return (
            <div className="room-panel">
                <div className="room-header">
                    <h2 className="room-title">グループ・バイブス</h2>
                    <p className="room-subtitle">みんなで同じルーレットを回そう</p>
                </div>
                <div className="room-setup-notice glass-card">
                    <CloudOff size={32} style={{ color: 'var(--color-text-muted)' }} />
                    <h3>Firebase設定が必要です</h3>
                    <p>
                        リアルタイム同期機能を利用するには、Firebase の設定が必要です。
                    </p>
                    <ol className="room-setup-steps">
                        <li><a href="https://console.firebase.google.com/" target="_blank" rel="noopener">Firebase Console</a> でプロジェクトを作成</li>
                        <li>Firestore Database を有効化</li>
                        <li>Authentication で匿名認証を有効化</li>
                        <li><code>.env</code> ファイルに設定値を記入</li>
                    </ol>
                    <pre className="room-setup-env">
                        {`VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx`}
                    </pre>
                </div>
            </div>
        )
    }

    // ルーム未参加
    if (!mode || (!roomData && mode !== 'host')) {
        return (
            <div className="room-panel">
                <div className="room-header">
                    <h2 className="room-title">グループ・バイブス</h2>
                    <p className="room-subtitle">みんなで同じルーレットを回そう</p>
                </div>

                <div className="room-actions">
                    <button
                        className="room-action-card glass-card"
                        onClick={handleCreate}
                        id="room-create-button"
                    >
                        <div className="room-action-icon create">
                            <Plus size={28} />
                        </div>
                        <div className="room-action-text">
                            <h3>ルームを作成</h3>
                            <p>新しいルームを作成して友達を招待</p>
                        </div>
                    </button>

                    <div className="room-divider">
                        <span>または</span>
                    </div>

                    <div className="room-join-section glass-card">
                        <div className="room-action-icon join">
                            <LogIn size={28} />
                        </div>
                        <h3>ルームに参加</h3>
                        <p>ルームコードを入力して参加</p>
                        <div className="room-join-form">
                            <input
                                type="text"
                                className="input-field room-code-input"
                                placeholder="ルームコード（6文字）"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                maxLength={6}
                                id="room-join-input"
                            />
                            <button
                                className="btn-primary"
                                onClick={handleJoin}
                                disabled={joinCode.length < 6}
                                id="room-join-button"
                            >
                                参加
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="room-error animate-fade-in">{error}</div>
                )}
            </div>
        )
    }

    // ルーム参加中
    const items = roomData?.preset?.items?.filter(i => i.enabled) || []
    const rState = roomData?.rouletteState || {}
    const participantCount = roomData?.participants?.length || 1

    return (
        <div className="room-panel">
            <div className="room-header">
                <div className="room-live-badge">
                    <Wifi size={14} />
                    <span>LIVE</span>
                </div>
                <h2 className="room-title">{roomData?.preset?.name || 'ルーム'}</h2>
            </div>

            {/* Room Code */}
            <div className="room-code-display glass-card">
                <span className="room-code-label">ルームコード</span>
                <div className="room-code-value">
                    {roomCode.split('').map((char, i) => (
                        <span key={i} className="room-code-char">{char}</span>
                    ))}
                </div>
                <button
                    className={`btn-secondary ${copied ? 'copied' : ''}`}
                    onClick={handleCopyCode}
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'コピー済み' : 'コードをコピー'}
                </button>
            </div>

            {/* Participants */}
            <div className="room-participants glass-card">
                <Users size={18} />
                <span>{participantCount} 人が参加中</span>
            </div>

            {/* Result / Status */}
            <div className="room-status glass-card">
                {rState.isSpinning ? (
                    <div className="room-spinning">
                        <div className="room-spinner" />
                        <p>スピン中...</p>
                    </div>
                ) : rState.result ? (
                    <div className="room-result animate-slide-up">
                        <p className="room-result-label">結果</p>
                        <h2 className="room-result-name gradient-text">{rState.result}</h2>
                    </div>
                ) : (
                    <div className="room-waiting">
                        <p>スピンボタンを押してルーレットを回そう！</p>
                    </div>
                )}
            </div>

            {/* Menu Items Preview */}
            <div className="room-items-preview glass-card">
                <span className="share-label">メニュー一覧 ({items.length}品)</span>
                <div className="share-preview-items" style={{ marginTop: '8px' }}>
                    {items.map(item => (
                        <span key={item.id} className="share-preview-tag">{item.name}</span>
                    ))}
                </div>
            </div>

            {/* Controls */}
            <div className="room-controls">
                <button
                    className={`btn-primary room-spin-btn ${rState.isSpinning ? 'spinning' : ''}`}
                    onClick={handleSpin}
                    disabled={rState.isSpinning || items.length === 0}
                    id="room-spin-button"
                >
                    <Play size={20} />
                    {rState.isSpinning ? 'スピン中...' : 'VIBES!'}
                </button>

                <button
                    className="btn-secondary room-leave-btn"
                    onClick={handleLeave}
                >
                    <X size={16} />
                    退出
                </button>
            </div>
        </div>
    )
}
