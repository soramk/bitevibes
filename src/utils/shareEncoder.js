/**
 * URLベース共有のエンコード/デコード
 * Firebase不要で動作する共有機能
 */

/**
 * プリセットデータをURLパラメータ用にエンコード
 */
export function encodePreset(preset) {
    try {
        const data = {
            n: preset.name,
            m: preset.mealType || 'all',
            i: preset.items.map(item => ({
                n: item.name,
                e: item.enabled ? 1 : 0,
            })),
        }
        const json = JSON.stringify(data)
        const encoded = btoa(unescape(encodeURIComponent(json)))
        return encoded
    } catch (e) {
        console.warn('[BiteVibes] Encode failed:', e)
        return null
    }
}

/**
 * URLパラメータからプリセットデータをデコード
 */
export function decodePreset(encoded) {
    try {
        const json = decodeURIComponent(escape(atob(encoded)))
        const data = JSON.parse(json)
        return {
            id: `imported_${Date.now()}`,
            name: data.n || '共有メニュー',
            mealType: data.m || 'all',
            items: (data.i || []).map((item, idx) => ({
                id: `imp_${Date.now()}_${idx}`,
                name: item.n,
                enabled: item.e === 1,
            })),
        }
    } catch (e) {
        console.warn('[BiteVibes] Decode failed:', e)
        return null
    }
}

/**
 * 現在のURLから共有パラメータを取得
 */
export function getShareParam() {
    const params = new URLSearchParams(window.location.search)
    return params.get('import')
}

/**
 * 共有URLを生成
 */
export function generateShareUrl(preset) {
    const encoded = encodePreset(preset)
    if (!encoded) return null
    const url = new URL(window.location.origin)
    url.searchParams.set('import', encoded)
    return url.toString()
}

/**
 * URLから共有パラメータを除去
 */
export function clearShareParam() {
    const url = new URL(window.location.href)
    url.searchParams.delete('import')
    window.history.replaceState({}, '', url.pathname)
}
