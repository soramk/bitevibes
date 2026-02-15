import { useState, useEffect } from 'react'
import Header from './components/Layout/Header'
import BottomNav from './components/Layout/BottomNav'
import MealTypeToggle from './components/ui/MealTypeToggle'
import Roulette from './features/roulette/Roulette'
import MenuManager from './features/menu/MenuManager'
import PresetSelector from './features/menu/PresetSelector'
import SharePanel from './features/share/SharePanel'

import ImportDialog from './features/share/ImportDialog'
import { useMenuStore } from './hooks/useMenuStore'
import { getShareParam, decodePreset, clearShareParam } from './utils/shareEncoder'

export default function App() {
  const [activeView, setActiveView] = useState('roulette')
  const [importData, setImportData] = useState(null)

  const store = useMenuStore()

  const {
    presets,
    filteredPresets,
    activePresetId,
    activePreset,
    setActivePresetId,
    addPreset,
    deletePreset,
    renamePreset,
    updatePresetMealType,
    importPreset,
    menuItems,
    addMenuItem,
    removeMenuItem,
    updateMenuItem,
    toggleMenuItem,
    mealType,
    setMealType,
    history,
    addHistoryEntry,
    isFirebaseConfigured: fbConfigured,
    userId,
  } = store

  // URL共有パラメータのチェック
  useEffect(() => {
    const shareParam = getShareParam()
    if (shareParam) {
      const preset = decodePreset(shareParam)
      if (preset) {
        setImportData(preset)
      }
      clearShareParam()
    }
  }, [])

  const handleImport = (preset) => {
    importPreset(preset)
    setImportData(null)
    setActiveView('roulette')
  }

  return (
    <div className="app-container">
      <Header activeView={activeView} onViewChange={setActiveView} />

      <main className="app-main">
        {/* Meal Type Toggle - ルーレットとメニュー画面で表示 */}
        {(activeView === 'roulette' || activeView === 'menu') && (
          <MealTypeToggle mealType={mealType} onChange={setMealType} />
        )}

        {activeView === 'roulette' && (
          <div className="animate-fade-in">
            <PresetSelector
              presets={filteredPresets}
              activePresetId={activePresetId}
              onSelect={setActivePresetId}
              onAdd={(name) => addPreset(name, mealType)}
              onDelete={deletePreset}
              onRename={renamePreset}
              onMealTypeChange={updatePresetMealType}
              mealType={mealType}
            />
            <Roulette
              items={menuItems.filter(item => item.enabled)}
              onResult={addHistoryEntry}
            />
          </div>
        )}

        {activeView === 'menu' && (
          <div className="animate-fade-in">
            <PresetSelector
              presets={filteredPresets}
              activePresetId={activePresetId}
              onSelect={setActivePresetId}
              onAdd={(name) => addPreset(name, mealType)}
              onDelete={deletePreset}
              onRename={renamePreset}
              onMealTypeChange={updatePresetMealType}
              mealType={mealType}
            />
            <MenuManager
              items={menuItems}
              onAdd={addMenuItem}
              onRemove={removeMenuItem}
              onUpdate={updateMenuItem}
              onToggle={toggleMenuItem}
            />
          </div>
        )}

        {activeView === 'share' && (
          <div className="animate-fade-in">
            <SharePanel
              presets={presets}
              activePreset={activePreset}
              onImport={importPreset}
              isFirebaseConfigured={fbConfigured}
              userId={userId}
            />
          </div>
        )}


      </main>

      <BottomNav activeView={activeView} onViewChange={setActiveView} />

      {/* Import Dialog */}
      {importData && (
        <ImportDialog
          preset={importData}
          onImport={handleImport}
          onCancel={() => setImportData(null)}
        />
      )}
    </div>
  )
}
