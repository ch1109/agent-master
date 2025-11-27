import { ReactNode } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Sidebar } from './Sidebar'
import { ScenarioAIAssistant } from './ScenarioAIAssistant'

interface AppLayoutProps {
  children: ReactNode
}

/**
 * 应用主布局组件
 * 三区域布局：侧边导航(240px) + 主工作区(自适应) + AI助手(400px可拖拽)
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-base)]">
      {/* 左侧导航 - 固定宽度 */}
      <Sidebar />
      
      {/* 主工作区 + AI助手 - 可拖拽调整 */}
      <PanelGroup direction="horizontal" className="flex-1">
        {/* 主工作区 */}
        <Panel 
          defaultSize={70} 
          minSize={40}
          className="flex flex-col"
        >
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[var(--bg-base)]">
            {children}
          </main>
        </Panel>
        
        {/* 可拖拽分隔线 */}
        <PanelResizeHandle className="resize-handle" />
        
        {/* AI 助手面板 */}
        <Panel
          defaultSize={30}
          minSize={20}
          maxSize={45}
          className="flex flex-col"
        >
          <ScenarioAIAssistant />
        </Panel>
      </PanelGroup>
    </div>
  )
}

export default AppLayout

