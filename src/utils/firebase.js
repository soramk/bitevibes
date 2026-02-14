import { initializeApp } from 'firebase/app'
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    onSnapshot,
    serverTimestamp,
    query,
    where,
    orderBy,
    limit,
} from 'firebase/firestore'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'

// Firebase設定チェック
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'undefined'
)

let app = null
let db = null
let auth = null

if (isFirebaseConfigured) {
    try {
        app = initializeApp(firebaseConfig)
        db = getFirestore(app)
        auth = getAuth(app)
    } catch (e) {
        console.warn('[BiteVibes] Firebase initialization failed:', e)
    }
}

// 匿名認証
export async function signInAnon() {
    if (!auth) return null
    try {
        const result = await signInAnonymously(auth)
        return result.user
    } catch (e) {
        console.warn('[BiteVibes] Anonymous auth failed:', e)
        return null
    }
}

export function onAuthChange(callback) {
    if (!auth) return () => { }
    return onAuthStateChanged(auth, callback)
}

export function getCurrentUserId() {
    return auth?.currentUser?.uid || null
}

// === Cloud Storage (Step 1) ===

/**
 * ユーザーのプリセットデータをクラウドに保存
 */
export async function savePresetsToCloud(userId, data) {
    if (!db || !userId) return false
    try {
        await setDoc(doc(db, 'users', userId), {
            presets: data.presets,
            activePresetId: data.activePresetId,
            updatedAt: serverTimestamp(),
        })
        return true
    } catch (e) {
        console.warn('[BiteVibes] Cloud save failed:', e)
        return false
    }
}

/**
 * ユーザーのプリセットデータをクラウドから読み込み
 */
export async function loadPresetsFromCloud(userId) {
    if (!db || !userId) return null
    try {
        const snap = await getDoc(doc(db, 'users', userId))
        if (snap.exists()) {
            return snap.data()
        }
        return null
    } catch (e) {
        console.warn('[BiteVibes] Cloud load failed:', e)
        return null
    }
}

/**
 * 食事履歴を保存
 */
export async function saveHistory(userId, entry) {
    if (!db || !userId) return false
    try {
        const historyRef = doc(collection(db, 'users', userId, 'history'))
        await setDoc(historyRef, {
            ...entry,
            createdAt: serverTimestamp(),
        })
        return true
    } catch (e) {
        console.warn('[BiteVibes] History save failed:', e)
        return false
    }
}

/**
 * 食事履歴を取得
 */
export async function loadHistory(userId, maxItems = 50) {
    if (!db || !userId) return []
    try {
        const q = query(
            collection(db, 'users', userId, 'history'),
            orderBy('createdAt', 'desc'),
            limit(maxItems)
        )
        const snap = await getDocs(q)
        return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } catch (e) {
        console.warn('[BiteVibes] History load failed:', e)
        return []
    }
}

// === Share (Step 2) ===

/**
 * 共有プリセットをFirestoreに保存
 */
export async function createSharedPreset(preset, userId) {
    if (!db) return null
    try {
        const shareRef = doc(collection(db, 'shared'))
        await setDoc(shareRef, {
            preset,
            createdBy: userId || 'anonymous',
            createdAt: serverTimestamp(),
        })
        return shareRef.id
    } catch (e) {
        console.warn('[BiteVibes] Share create failed:', e)
        return null
    }
}

/**
 * 共有プリセットを読み込み
 */
export async function loadSharedPreset(shareId) {
    if (!db) return null
    try {
        const snap = await getDoc(doc(db, 'shared', shareId))
        if (snap.exists()) {
            return snap.data().preset
        }
        return null
    } catch (e) {
        console.warn('[BiteVibes] Share load failed:', e)
        return null
    }
}

// === Realtime Room (Step 3) ===

/**
 * ルームを作成
 */
export async function createRoom(hostId, preset) {
    if (!db) return null
    try {
        const roomCode = generateRoomCode()
        const roomRef = doc(db, 'rooms', roomCode)
        await setDoc(roomRef, {
            hostId,
            roomCode,
            preset,
            participants: [{ id: hostId, joinedAt: Date.now() }],
            rouletteState: {
                isSpinning: false,
                angle: 0,
                result: null,
            },
            createdAt: serverTimestamp(),
        })
        return roomCode
    } catch (e) {
        console.warn('[BiteVibes] Room create failed:', e)
        return null
    }
}

/**
 * ルームに参加
 */
export async function joinRoom(roomCode, userId) {
    if (!db) return null
    try {
        const roomRef = doc(db, 'rooms', roomCode)
        const snap = await getDoc(roomRef)
        if (!snap.exists()) return null

        const data = snap.data()
        const participants = data.participants || []
        if (!participants.find(p => p.id === userId)) {
            participants.push({ id: userId, joinedAt: Date.now() })
            await updateDoc(roomRef, { participants })
        }
        return data
    } catch (e) {
        console.warn('[BiteVibes] Room join failed:', e)
        return null
    }
}

/**
 * ルーレットの状態を更新
 */
export async function updateRoomRouletteState(roomCode, state) {
    if (!db) return false
    try {
        await updateDoc(doc(db, 'rooms', roomCode), {
            rouletteState: state,
        })
        return true
    } catch (e) {
        console.warn('[BiteVibes] Room state update failed:', e)
        return false
    }
}

/**
 * ルームのリアルタイムリスナー
 */
export function onRoomUpdate(roomCode, callback) {
    if (!db) return () => { }
    return onSnapshot(doc(db, 'rooms', roomCode), (snap) => {
        if (snap.exists()) {
            callback(snap.data())
        }
    })
}

/**
 * ルームを削除
 */
export async function deleteRoom(roomCode) {
    if (!db) return false
    try {
        await deleteDoc(doc(db, 'rooms', roomCode))
        return true
    } catch (e) {
        console.warn('[BiteVibes] Room delete failed:', e)
        return false
    }
}

/**
 * 6文字のルームコード生成
 */
function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)]
    }
    return code
}
