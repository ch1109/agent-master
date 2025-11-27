import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout'
import {
  IntentConfigPage,
  IntentDetailPage,
  UIConfigPage,
  UIDetailPage,
  DebugConfigPage,
  PromptOptimizePage,
  PromptOptimizeFlowPage,
  PromptDetailPage,
  TestCasePage,
  BadcasePage,
  PlaceholderPage
} from '@/pages'

// 包装页面组件，添加布局
function PageWrapper({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/config/intent" replace />,
  },
  // 配置管理
  {
    path: '/config/intent',
    element: <PageWrapper><IntentConfigPage /></PageWrapper>,
  },
  {
    path: '/config/intent/:id',
    element: <PageWrapper><IntentDetailPage /></PageWrapper>,
  },
  {
    path: '/config/ui',
    element: <PageWrapper><UIConfigPage /></PageWrapper>,
  },
  {
    path: '/config/ui/:id',
    element: <PageWrapper><UIDetailPage /></PageWrapper>,
  },
  {
    path: '/config/dialog',
    element: <PageWrapper><PlaceholderPage title="对话流程配置" description="配置多轮对话的流程和跳转逻辑" /></PageWrapper>,
  },
  {
    path: '/config/knowledge',
    element: <PageWrapper><PlaceholderPage title="知识库管理" description="管理 Agent 的知识库内容" /></PageWrapper>,
  },
  {
    path: '/config/debug',
    element: <PageWrapper><DebugConfigPage /></PageWrapper>,
  },
  // Playground
  {
    path: '/playground/prompt',
    element: <Navigate to="/playground/prompt/optimize" replace />,
  },
  {
    path: '/playground/prompt/optimize',
    element: <PageWrapper><PromptOptimizePage /></PageWrapper>,
  },
  {
    path: '/playground/prompt/optimize/:mode',
    element: <PageWrapper><PromptOptimizeFlowPage /></PageWrapper>,
  },
  {
    path: '/playground/prompt/:id',
    element: <PageWrapper><PromptDetailPage /></PageWrapper>,
  },
  {
    path: '/playground/test',
    element: <PageWrapper><TestCasePage /></PageWrapper>,
  },
  {
    path: '/playground/badcase',
    element: <PageWrapper><BadcasePage /></PageWrapper>,
  },
  // 运行监控
  {
    path: '/monitor/dashboard',
    element: <PageWrapper><PlaceholderPage title="会话监控" description="实时监控 Agent 会话状态" /></PageWrapper>,
  },
  {
    path: '/monitor/logs',
    element: <PageWrapper><PlaceholderPage title="日志查询" description="查询和分析运行日志" /></PageWrapper>,
  },
  // 系统设置
  {
    path: '/settings',
    element: <PageWrapper><PlaceholderPage title="系统设置" description="配置系统参数和模型接口" /></PageWrapper>,
  },
  // 404
  {
    path: '*',
    element: <PageWrapper><PlaceholderPage title="页面不存在" description="您访问的页面不存在" /></PageWrapper>,
  },
])

export default router
