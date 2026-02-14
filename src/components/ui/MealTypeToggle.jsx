import { Sun, Moon } from 'lucide-react'
import { MEAL_TYPES, MEAL_TYPE_LABELS } from '../../utils/mealType'

export default function MealTypeToggle({ mealType, onChange }) {
    return (
        <div className="meal-type-toggle" id="meal-type-toggle">
            <button
                className={`meal-type-btn ${mealType === MEAL_TYPES.LUNCH ? 'active lunch' : ''}`}
                onClick={() => onChange(MEAL_TYPES.LUNCH)}
                aria-label="ランチモード"
            >
                <Sun size={16} />
                <span>{MEAL_TYPE_LABELS.lunch}</span>
            </button>
            <button
                className={`meal-type-btn ${mealType === MEAL_TYPES.DINNER ? 'active dinner' : ''}`}
                onClick={() => onChange(MEAL_TYPES.DINNER)}
                aria-label="ディナーモード"
            >
                <Moon size={16} />
                <span>{MEAL_TYPE_LABELS.dinner}</span>
            </button>
            <div
                className="meal-type-slider"
                style={{
                    transform: mealType === MEAL_TYPES.DINNER ? 'translateX(100%)' : 'translateX(0)',
                }}
            />
        </div>
    )
}
