/**
 * 食事タイプ (mealType) ユーティリティ
 */

export const MEAL_TYPES = {
    LUNCH: 'lunch',
    DINNER: 'dinner',
}

export const MEAL_TYPE_LABELS = {
    lunch: 'ランチ',
    dinner: 'ディナー',
}

/**
 * 現在の時刻から食事タイプを自動判定
 * 6:00 - 14:59 → ランチ
 * 15:00 - 5:59 → ディナー
 */
export function detectMealType() {
    const hour = new Date().getHours()
    return (hour >= 6 && hour < 15) ? MEAL_TYPES.LUNCH : MEAL_TYPES.DINNER
}

/**
 * プリセットが指定のmealTypeに一致するかチェック
 */
export function matchesMealType(preset, mealType) {
    if (!preset.mealType || preset.mealType === 'all') return true
    return preset.mealType === mealType
}
