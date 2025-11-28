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
    element: <Navigate to="/home/agent" replace />,
  },
  // 首页
  {
    path: '/home/agent',
    element: <PageWrapper><PlaceholderPage title="虚拟人 Agent 首页" description="总览虚拟人 Agent 状态与快捷入口" /></PageWrapper>,
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
    path: '/playground/prompt/test',
    element: <PageWrapper><PlaceholderPage title="提示词测试" description="创建并运行提示词测试集" /></PageWrapper>,
  },
  {
    path: '/playground/fewshot/library',
    element: <PageWrapper><PlaceholderPage title="示例库管理" description="集中管理 Few-shot 示例库" /></PageWrapper>,
  },
  {
    path: '/playground/prompt/version',
    element: <PageWrapper><PlaceholderPage title="提示词版本管理" description="管理提示词版本与发布" /></PageWrapper>,
  },
  {
    path: '/playground/prompt/version/compare',
    element: <PageWrapper><PlaceholderPage title="版本对比" description="对比不同提示词版本差异" /></PageWrapper>,
  },
  {
    path: '/playground/prompt/version/publish',
    element: <PageWrapper><PlaceholderPage title="版本发布管理" description="发布与审核提示词版本" /></PageWrapper>,
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
    path: '/monitor/overview',
    element: <PageWrapper><PlaceholderPage title="会话总览仪表盘" description="总览关键会话指标" /></PageWrapper>,
  },
  {
    path: '/monitor/logs',
    element: <PageWrapper><PlaceholderPage title="会话日志查询" description="查询和分析会话日志" /></PageWrapper>,
  },
  {
    path: '/monitor/performance',
    element: <PageWrapper><PlaceholderPage title="性能监控" description="监控性能指标与资源使用" /></PageWrapper>,
  },
  // Agent 管理
  {
    path: '/agent/create',
    element: <PageWrapper><PlaceholderPage title="Agent 创建与配置" description="创建并配置 Agent 能力" /></PageWrapper>,
  },
  {
    path: '/agent/deploy',
    element: <PageWrapper><PlaceholderPage title="Agent 部署管理" description="部署并管理 Agent 运行环境" /></PageWrapper>,
  },
  {
    path: '/agent/monitor',
    element: <PageWrapper><PlaceholderPage title="Agent 监控" description="监控 Agent 状态与健康" /></PageWrapper>,
  },
  // 系统配置
  {
    path: '/system/llm',
    element: <PageWrapper><PlaceholderPage title="LLM 模型配置" description="配置与管理 LLM 模型" /></PageWrapper>,
  },
  {
    path: '/system/api',
    element: <PageWrapper><PlaceholderPage title="API 配置" description="管理 API 接入与凭证" /></PageWrapper>,
  },
  {
    path: '/system/alert',
    element: <PageWrapper><PlaceholderPage title="告警配置" description="配置告警策略与通知" /></PageWrapper>,
  },
  {
    path: '/system/tool',
    element: <PageWrapper><PlaceholderPage title="工具配置" description="配置系统可用的工具与插件" /></PageWrapper>,
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
