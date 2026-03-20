import React from 'react'
import { Toolbar } from './components/Toolbar/Toolbar'
import { Preview } from './components/Preview/Preview'
import { Timeline } from './components/Timeline/Timeline'
import { Inspector } from './components/Inspector/Inspector'
import { SourcePicker } from './components/SourcePicker/SourcePicker'
import { ExportDialog } from './components/ExportDialog/ExportDialog'

const App: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-surface text-white">
      <Toolbar />

      <div className="flex-1 flex overflow-hidden">
        <Preview />
        <Inspector />
      </div>

      <Timeline />

      <SourcePicker />
      <ExportDialog />
    </div>
  )
}

export default App
