import { useState, useCallback, useEffect, useRef } from 'react'
import { detectMealType, matchesMealType } from '../utils/mealType'
import {
    isFirebaseConfigured,
    signInAnon,
    onAuthChange,
    getCurrentUserId,
    savePresetsToCloud,
    loadPresetsFromCloud,
    saveHistory,
} from '../utils/firebase'

const STORAGE_KEY = 'bitevibes_data'
const HISTORY_KEY = 'bitevibes_history'

const DEFAULT_PRESETS = [
    {
        id: 'default',
        name: '定番メニュー',
        mealType: 'all',
        items: [
            { id: '1', name: 'ラーメン', enabled: true },
            { id: '2', name: 'カレーライス', enabled: true },
            { id: '3', name: '寿司', enabled: true },
            { id: '4', name: 'ハンバーグ', enabled: true },
            { id: '5', name: 'パスタ', enabled: true },
            { id: '6', name: '焼肉', enabled: true },
            { id: '7', name: '天ぷら', enabled: true },
            { id: '8', name: 'うどん', enabled: true },
        ],
    },
    {
        id: 'lunch',
        name: '平日のランチ',
        mealType: 'lunch',
        items: [
            { id: 'l1', name: '牛丼', enabled: true },
            { id: 'l2', name: 'サラダボウル', enabled: true },
            { id: 'l3', name: 'サンドイッチ', enabled: true },
            { id: 'l4', name: 'そば', enabled: true },
            { id: 'l5', name: 'おにぎりセット', enabled: true },
            { id: 'l6', name: '日替わり定食', enabled: true },
            { id: 'l7', name: 'ベーグル', enabled: true },
        ],
    },
    {
        id: 'weekend_lunch',
        name: '休日ランチ',
        mealType: 'lunch',
        items: [
            { id: 'wl1', name: 'パンケーキ', enabled: true },
            { id: 'wl2', name: 'オムライス', enabled: true },
            { id: 'wl3', name: 'ビストロランチ', enabled: true },
            { id: 'wl4', name: 'エスニック料理', enabled: true },
            { id: 'wl5', name: 'ブランチビュッフェ', enabled: true },
        ],
    },
    {
        id: 'dinner',
        name: '定番ディナー',
        mealType: 'dinner',
        items: [
            { id: 'd1', name: 'しゃぶしゃぶ', enabled: true },
            { id: 'd2', name: '焼鳥', enabled: true },
            { id: 'd3', name: 'イタリアン', enabled: true },
            { id: 'd4', name: '中華料理', enabled: true },
            { id: 'd5', name: 'ステーキ', enabled: true },
            { id: 'd6', name: '鍋', enabled: true },
        ],
    },
    {
        id: 'midnight',
        name: '深夜の背徳メシ',
        mealType: 'dinner',
        items: [
            { id: 'm1', name: '二郎系ラーメン', enabled: true },
            { id: 'm2', name: 'ピザ', enabled: true },
            { id: 'm3', name: 'から揚げ', enabled: true },
            { id: 'm4', name: 'チーズバーガー', enabled: true },
            { id: 'm5', name: 'カツカレー', enabled: true },
            { id: 'm6', name: '背脂チャーハン', enabled: true },
        ],
    },
]

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            const data = JSON.parse(saved)
            // mealType 未対応データのマイグレーション
            if (data.presets) {
                data.presets = data.presets.map(p => ({
                    ...p,
                    mealType: p.mealType || 'all',
                }))
            }
            return data
        }
    } catch (e) {
        console.warn('Failed to load data:', e)
    }
    return {
        presets: DEFAULT_PRESETS,
        activePresetId: 'default',
    }
}

function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
        console.warn('Failed to save data:', e)
    }
}

function loadLocalHistory() {
    try {
        const saved = localStorage.getItem(HISTORY_KEY)
        return saved ? JSON.parse(saved) : []
    } catch {
        return []
    }
}

function saveLocalHistory(history) {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)))
    } catch { /* ignore */ }
}

export function useMenuStore() {
    const [data, setData] = useState(() => loadData())
    const [mealType, setMealType] = useState(() => detectMealType())
    const [history, setHistory] = useState(() => loadLocalHistory())
    const [cloudSynced, setCloudSynced] = useState(false)
    const [userId, setUserId] = useState(null)
    const syncTimerRef = useRef(null)

    // Firebase匿名認証
    useEffect(() => {
        if (!isFirebaseConfigured) return
        const unsub = onAuthChange((user) => {
            if (user) {
                setUserId(user.uid)
            }
        })
        signInAnon()
        return unsub
    }, [])

    // 初回クラウドロード
    useEffect(() => {
        if (!userId || cloudSynced) return
        loadPresetsFromCloud(userId).then(cloudData => {
            if (cloudData && cloudData.presets) {
                const merged = {
                    presets: cloudData.presets.map(p => ({ ...p, mealType: p.mealType || 'all' })),
                    activePresetId: cloudData.activePresetId,
                }
                setData(merged)
                saveData(merged)
                setCloudSynced(true)
            } else {
                setCloudSynced(true)
            }
        })
    }, [userId, cloudSynced])

    // クラウドへの遅延同期
    const schedulCloudSync = useCallback((newData) => {
        if (!userId || !isFirebaseConfigured) return
        if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
        syncTimerRef.current = setTimeout(() => {
            savePresetsToCloud(userId, newData)
        }, 2000)
    }, [userId])

    const updateData = useCallback((updater) => {
        setData(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater
            saveData(next)
            schedulCloudSync(next)
            return next
        })
    }, [schedulCloudSync])

    // mealType フィルター適用
    const filteredPresets = data.presets.filter(p => matchesMealType(p, mealType))
    const activePreset = data.presets.find(p => p.id === data.activePresetId) || filteredPresets[0] || data.presets[0]
    const menuItems = activePreset?.items || []

    // mealType変更時、フィルターにマッチするプリセットを自動選択
    useEffect(() => {
        const currentActive = data.presets.find(p => p.id === data.activePresetId)
        if (currentActive && matchesMealType(currentActive, mealType)) return
        const firstMatch = data.presets.find(p => matchesMealType(p, mealType))
        if (firstMatch) {
            updateData(prev => ({ ...prev, activePresetId: firstMatch.id }))
        }
    }, [mealType])

    const setActivePresetId = useCallback((id) => {
        updateData(prev => ({ ...prev, activePresetId: id }))
    }, [updateData])

    const addPreset = useCallback((name, presetMealType) => {
        const id = `preset_${Date.now()}`
        updateData(prev => ({
            ...prev,
            presets: [...prev.presets, { id, name, mealType: presetMealType || mealType, items: [] }],
            activePresetId: id,
        }))
    }, [updateData, mealType])

    const deletePreset = useCallback((id) => {
        updateData(prev => {
            const filtered = prev.presets.filter(p => p.id !== id)
            return {
                ...prev,
                presets: filtered.length > 0 ? filtered : DEFAULT_PRESETS,
                activePresetId: filtered.length > 0 ? filtered[0].id : 'default',
            }
        })
    }, [updateData])

    const renamePreset = useCallback((id, newName) => {
        updateData(prev => ({
            ...prev,
            presets: prev.presets.map(p => p.id === id ? { ...p, name: newName } : p),
        }))
    }, [updateData])

    const updatePresetMealType = useCallback((id, newMealType) => {
        updateData(prev => ({
            ...prev,
            presets: prev.presets.map(p => p.id === id ? { ...p, mealType: newMealType } : p),
        }))
    }, [updateData])

    const updatePresetItems = useCallback((items) => {
        updateData(prev => ({
            ...prev,
            presets: prev.presets.map(p =>
                p.id === prev.activePresetId ? { ...p, items } : p
            ),
        }))
    }, [updateData])

    const addMenuItem = useCallback((name) => {
        const newItem = { id: `item_${Date.now()}`, name, enabled: true }
        updatePresetItems([...menuItems, newItem])
    }, [menuItems, updatePresetItems])

    const removeMenuItem = useCallback((id) => {
        updatePresetItems(menuItems.filter(item => item.id !== id))
    }, [menuItems, updatePresetItems])

    const updateMenuItem = useCallback((id, name) => {
        updatePresetItems(menuItems.map(item =>
            item.id === id ? { ...item, name } : item
        ))
    }, [menuItems, updatePresetItems])

    const toggleMenuItem = useCallback((id) => {
        updatePresetItems(menuItems.map(item =>
            item.id === id ? { ...item, enabled: !item.enabled } : item
        ))
    }, [menuItems, updatePresetItems])

    // プリセットインポート（共有用）
    const importPreset = useCallback((preset) => {
        const id = preset.id || `imported_${Date.now()}`
        const importedPreset = { ...preset, id }
        updateData(prev => ({
            ...prev,
            presets: [...prev.presets, importedPreset],
            activePresetId: id,
        }))
        return id
    }, [updateData])

    // 履歴追加
    const addHistoryEntry = useCallback((entry) => {
        const newEntry = {
            id: `h_${Date.now()}`,
            menuName: entry.name,
            presetName: activePreset?.name || '',
            mealType,
            timestamp: Date.now(),
        }
        setHistory(prev => {
            const next = [newEntry, ...prev].slice(0, 100)
            saveLocalHistory(next)
            return next
        })
        // クラウドにも保存
        if (userId && isFirebaseConfigured) {
            saveHistory(userId, newEntry)
        }
    }, [activePreset, mealType, userId])

    return {
        // Presets
        presets: data.presets,
        filteredPresets,
        activePresetId: data.activePresetId,
        activePreset,
        setActivePresetId,
        addPreset,
        deletePreset,
        renamePreset,
        updatePresetMealType,
        importPreset,
        // Menu Items
        menuItems,
        addMenuItem,
        removeMenuItem,
        updateMenuItem,
        toggleMenuItem,
        // Meal Type
        mealType,
        setMealType,
        // History
        history,
        addHistoryEntry,
        // Cloud
        isFirebaseConfigured,
        cloudSynced,
        userId,
    }
}
