/**
 * ルーレット物理エンジンユーティリティ
 */

const FRICTION = 0.985
const MIN_VELOCITY = 0.1
const MIN_INITIAL_VELOCITY = 15
const MAX_INITIAL_VELOCITY = 30

export function getInitialVelocity() {
    return MIN_INITIAL_VELOCITY + Math.random() * (MAX_INITIAL_VELOCITY - MIN_INITIAL_VELOCITY)
}

export function physicsStep(angle, velocity) {
    const newVelocity = velocity * FRICTION
    const newAngle = (angle + newVelocity) % 360
    return {
        angle: newAngle,
        velocity: newVelocity,
        stopped: Math.abs(newVelocity) < MIN_VELOCITY,
    }
}

export function getSelectedIndex(angle, itemCount) {
    if (itemCount === 0) return -1
    const segmentAngle = 360 / itemCount
    const normalizedAngle = ((360 - (angle % 360)) + segmentAngle / 2) % 360
    return Math.floor(normalizedAngle / segmentAngle) % itemCount
}

/**
 * カラーパレット — Bright & Fun (ライトテーマ対応)
 */
export const ROULETTE_COLORS = [
    { bg: '#ff6b6b', text: '#fff' },    // Coral Red
    { bg: '#ffa23a', text: '#fff' },    // Warm Orange
    { bg: '#ffd43b', text: '#5c4813' }, // Sunny Yellow
    { bg: '#51cf66', text: '#fff' },    // Fresh Green
    { bg: '#38d9a9', text: '#fff' },    // Mint Teal
    { bg: '#4dabf7', text: '#fff' },    // Sky Blue
    { bg: '#9775fa', text: '#fff' },    // Soft Purple
    { bg: '#f783ac', text: '#fff' },    // Pink
    { bg: '#20c997', text: '#fff' },    // Emerald
    { bg: '#ff922b', text: '#fff' },    // Deep Orange
]

export function vibrateDevice(pattern = [100, 50, 100]) {
    if (navigator.vibrate) {
        navigator.vibrate(pattern)
    }
}
