# Agent Master 快速参考卡片

## 🎯 待完成任务清单

### P2: 功能页面完善（5 个任务）
- [ ] IntentDetailPage - 添加 AI 辅助填写
- [ ] UIDetailPage - 添加截图 AI 分析
- [ ] DebugConfigPage - 新建调试配置页
- [ ] PromptOptimizePage - 完善优化功能
- [ ] PromptDetailPage - 集成代码编辑器

### P3: Playground 与测试（3 个任务）
- [ ] TestCasePage - 新建测试用例管理
- [ ] BadcasePage - 新建 Badcase 分析
- [ ] TestResultList - 新建测试结果组件

### P4: 监控与设置（3 个任务）
- [ ] DashboardPage - 新建会话监控
- [ ] LogsPage - 新建日志查询
- [ ] SettingsPage - 新建系统设置

### P5: 优化（4 个任务）
- [ ] ChatGPT 风格审查
- [ ] CSS Variables 完善
- [ ] 动画效果统一
- [ ] 代码质量优化

---

## 📦 已完成组件速查

### 配置组件
```typescript
import { TagPill, CapabilityCard, ConfigInput, ConfigLabel } from '@/components/config'

<TagPill label="标签" active={true} onClick={...} />
<CapabilityCard icon={<Icon />} name="能力" enabled={true} onToggle={...} />
<ConfigInput value={...} aiFilling={true} />
<ConfigLabel required>标签</ConfigLabel>
```

### AI 消息组件
```typescript
import { OptionCard, ExecutionStage } from '@/components/ai-chat'

<OptionCard title="选项" description="描述" selected={true} />
<ExecutionStage title="阶段" progress={50} tasks={[...]} />
```

### UI 组件
```typescript
import { CodeEditor, DiffViewer, Divider } from '@/components/ui'

<CodeEditor code="..." language="typescript" />
<DiffViewer oldCode="..." newCode="..." />
<Divider text="分隔" />
```

### Hooks
```typescript
import { useHighlight, useDebounce, useAIStream } from '@/hooks'

const { highlight, isHighlighted } = useHighlight()
const debouncedValue = useDebounce(value, 300)
const { isStreaming, content, streamMessage } = useAIStream()
```

---

## 🎨 ChatGPT 风格速查

### 颜色变量
```css
--bg-surface: 纯白背景
--bg-secondary: 次要背景
--bg-hover: 悬停背景
--border-default: 极淡边框
--border-subtle: 更淡边框
--text-primary: 主要文本
--text-secondary: 次要文本
--text-tertiary: 三级文本
--color-primary: 主色
--color-primary-muted: 主色淡化
--color-ai-thinking: AI 思考色
```

### 间距
```css
--space-1: 0.25rem (4px)
--space-2: 0.5rem (8px)
--space-3: 0.75rem (12px)
--space-4: 1rem (16px)
--space-6: 1.5rem (24px)
```

### 圆角
```css
--radius-sm: 0.375rem (6px)
--radius-md: 0.5rem (8px)
--radius-lg: 0.75rem (12px)
--radius-pill: 9999px (完全圆角)
```

### 动画时间
```css
--duration-fast: 0.15s
--duration-normal: 0.3s
--duration-slow: 0.5s
```

---

## 🔧 常用代码片段

### 1. 创建新页面
```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function NewPage() {
  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>页面标题</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 内容 */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

### 2. 添加路由
```typescript
// src/App.tsx
import { NewPage } from '@/pages/path/NewPage'

<Route path="/path/new" element={<NewPage />} />
```

### 3. AI 辅助填写
```typescript
import { useHighlight } from '@/hooks/useHighlight'
import { ConfigInput } from '@/components/config'

const { highlight, isHighlighted } = useHighlight()

const handleAIFill = async () => {
  const fields = ['name', 'description', 'type']
  
  for (const field of fields) {
    highlight(field, 1000)
    await delay(500)
    // 填充字段
    setFormData(prev => ({ ...prev, [field]: aiValue }))
  }
}

<ConfigInput
  value={formData.name}
  aiFilling={isHighlighted('name')}
/>
```

### 4. 使用 AI 流式响应
```typescript
import { useAIStream } from '@/hooks/useAIStream'

const { isStreaming, content, streamMessage } = useAIStream({
  onComplete: (fullContent) => {
    console.log('完成:', fullContent)
  },
})

const handleSend = async () => {
  await streamMessage('用户输入', [])
}
```

### 5. 状态管理
```typescript
import { useAgentStore } from '@/stores/agentStore'

const {
  debugOptions,
  updateDebugOptions,
  uiPreferences,
  updateUIPreferences,
} = useAgentStore()

// 更新调试选项
updateDebugOptions({ useMockResponse: true })

// 更新 UI 偏好
updateUIPreferences({ theme: 'dark' })
```

---

## 📋 开发检查清单

### 新建页面时
- [ ] 创建页面组件文件
- [ ] 添加路由配置
- [ ] 使用 Card 布局
- [ ] 遵循 ChatGPT 风格
- [ ] 添加 TypeScript 类型
- [ ] 运行 `npm run build` 检查

### 新建组件时
- [ ] 定义 Props interface
- [ ] 添加 JSDoc 注释
- [ ] 使用 CSS Variables
- [ ] 支持 className 扩展
- [ ] 导出到 index.ts

### 集成 AI 功能时
- [ ] 检查 `useMockResponse` 状态
- [ ] 提供模拟数据备选
- [ ] 添加加载状态
- [ ] 添加错误处理
- [ ] 显示思考动画

---

## 🐛 常见问题

### Q: 如何切换模拟模式和真实 AI？
A: 在 `agentStore` 中修改 `debugOptions.useMockResponse`，或在 DebugConfigPage 中切换。

### Q: 如何添加新的 CSS 变量？
A: 在 `src/index.css` 的 `:root` 中添加。

### Q: 组件样式不符合 ChatGPT 风格？
A: 检查是否使用了 CSS Variables，是否有阴影，边框是否够淡。

### Q: TypeScript 报错？
A: 运行 `npm run build` 查看详细错误，确保所有 Props 都有类型定义。

### Q: 如何使用已有的模拟数据？
A: 查看 `src/data/` 目录，导入对应的 mock 数据。

---

## 📞 资源链接

- **主交接文档**: `HANDOVER_P2_TO_P5.md`
- **设计指南**: `AGENT_MASTER_DESIGN_GUIDE (1).md`
- **技术架构**: `AGENT_MASTER_TECH_ARCHITECTURE.md`
- **产品需求**: `AGENT_MASTER_PRD.md`

---

## 🚀 快速开始

```bash
# 启动开发服务器
npm run dev

# 构建检查
npm run build

# 查看已完成的组件
ls src/components/config/
ls src/components/ai-chat/
ls src/hooks/
```

祝开发顺利！🎉

