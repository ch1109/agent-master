# Agent Master 项目交接文档 - P2 至 P5 阶段

## 📋 项目概述

**项目名称**: Agent Master - AI Agent 配置与管理平台  
**技术栈**: React 18 + TypeScript + Vite + TailwindCSS + Zustand + Anthropic SDK  
**设计风格**: ChatGPT 极简风格  
**当前状态**: P0 和 P1 阶段已完成，P2-P5 待开发

---

## ✅ 已完成工作（P0 + P1）

### P0: 核心 AI 集成与服务层

1. **Anthropic 服务层** (`src/services/anthropic.ts`)
   - 封装了 Anthropic API 调用
   - 支持流式和非流式响应
   - 提供场景化系统提示词构建
   - **默认使用模拟模式**（`useMockResponse: true`）

2. **useAIStream Hook** (`src/hooks/useAIStream.ts`)
   - 管理 AI 流式响应状态
   - 支持取消和重置
   - 提供完整的生命周期回调

3. **agentStore 状态管理** (`src/stores/agentStore.ts`)
   - 管理意图配置、能力、UI 偏好、调试选项
   - 使用 Zustand + persist 持久化
   - 默认启用模拟响应模式

4. **聊天组件集成**
   - `AIAssistant.tsx` - 通用 AI 助手
   - `ScenarioAIAssistant.tsx` - 场景化 AI 助手（支持脚本模式和真实 AI 模式切换）

### P1: 核心组件开发

#### 配置界面组件 (`src/components/config/`)
- `TagPill.tsx` - Pill 形标签按钮
- `CapabilityCard.tsx` - 能力开关卡片
- `ConfigInput.tsx` / `ConfigTextarea.tsx` - 配置输入框（支持 AI 填充高亮）
- `ConfigLabel.tsx` / `ConfigField.tsx` - 配置标签和字段容器

#### AI 消息组件 (`src/components/ai-chat/`)
- `OptionCard.tsx` - AI 选项卡片
- `ExecutionStage.tsx` - AI 执行阶段显示

#### UI 组件 (`src/components/ui/`)
- `divider.tsx` - 分隔线
- `code-editor.tsx` - 代码编辑器（Shiki 语法高亮）
- `diff-viewer.tsx` - 代码对比（react-diff-viewer-continued）

#### Hooks (`src/hooks/`)
- `useHighlight.ts` - 字段高亮管理
- `useDebounce.ts` - 防抖处理

---

## 🎯 待完成工作（P2-P5）

### P2: 功能页面完善

#### 1. 完善 IntentDetailPage 的 AI 辅助功能
**文件**: `src/pages/config/IntentDetailPage.tsx`

**当前状态**:
- 基础表单已存在
- 有 `highlightFields` 状态但未使用
- 缺少 AI 辅助填写功能

**需要实现**:
```typescript
import { useHighlight } from '@/hooks/useHighlight'
import { useAIStream } from '@/hooks/useAIStream'
import { ConfigInput, ConfigLabel, ConfigField } from '@/components/config'

// 1. 集成 useHighlight Hook
const { highlightedFields, highlight, isHighlighted } = useHighlight()

// 2. 添加 AI 辅助按钮
<Button onClick={handleAIAssist}>
  <Sparkles className="w-4 h-4" />
  让 AI 帮我填写
</Button>

// 3. 使用 ConfigInput 替换普通 Input，支持高亮
<ConfigInput
  value={formData.name}
  onChange={...}
  aiFilling={isHighlighted('name')}
/>

// 4. 实现 AI 填充逻辑
const handleAIAssist = async () => {
  // 调用 AI 获取建议
  // 逐字段填充，带打字机效果
  // 高亮正在填充的字段
}
```

**参考文档**:
- 《设计指南》AI 填充动效部分
- `useHighlight` Hook 文档

---

#### 2. 完善 UIDetailPage 的截图处理
**文件**: `src/pages/config/UIDetailPage.tsx`

**当前状态**:
- 有截图上传 UI
- `showImagePreview` 状态未使用
- 缺少 AI 分析功能

**需要实现**:
```typescript
// 1. 截图预览模态框
const [showImagePreview, setShowImagePreview] = useState(false)

<Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
  <img src={formData.screenshot} alt="预览" />
</Dialog>

// 2. AI 分析截图
const handleAnalyzeScreenshot = async () => {
  // 将截图转为 base64
  // 发送给 Anthropic Vision API
  // 解析返回的页面元素
  // 自动填充 supportedIntents 和 buttons
}

// 3. 显示分析结果
<ExecutionStage
  title="分析页面截图"
  progress={progress}
  tasks={analysisTasks}
/>
```

**注意**: Anthropic Claude 支持图片分析，需要使用 Vision API

---

#### 3. 创建 DebugConfigPage
**文件**: `src/pages/config/DebugConfigPage.tsx`（新建）

**功能需求**:
- 调试模式开关
- 日志级别设置（info/debug/error）
- 模拟 AI 响应延迟设置
- 显示请求/响应详情开关
- 使用模拟响应开关

**实现要点**:
```typescript
import { useAgentStore } from '@/stores/agentStore'
import { Switch } from '@/components/ui/switch'
import { Select } from '@/components/ui/select'

const { debugOptions, updateDebugOptions } = useAgentStore()

<Switch
  checked={debugOptions.useMockResponse}
  onCheckedChange={(checked) => 
    updateDebugOptions({ useMockResponse: checked })
  }
/>
```

**路由配置**: 在 `src/App.tsx` 添加路由 `/config/debug`

---

#### 4. 完善 PromptOptimizePage
**文件**: `src/pages/playground/PromptOptimizePage.tsx`

**当前状态**: 基础框架存在

**需要实现**:
```typescript
// 1. 输入原始提示词
<ConfigTextarea
  value={originalPrompt}
  onChange={...}
  placeholder="输入需要优化的提示词..."
/>

// 2. AI 分析按钮
<Button onClick={handleOptimize}>
  <Sparkles /> 优化提示词
</Button>

// 3. 显示优化建议
<OptionCardGroup>
  {suggestions.map(suggestion => (
    <OptionCard
      title={suggestion.title}
      description={suggestion.description}
      recommended={suggestion.recommended}
      onClick={() => applySuggestion(suggestion)}
    />
  ))}
</OptionCardGroup>

// 4. 对比显示
<DiffViewer
  oldCode={originalPrompt}
  newCode={optimizedPrompt}
  oldTitle="原始版本"
  newTitle="优化版本"
/>
```

---

#### 5. 完善 PromptDetailPage
**文件**: `src/pages/playground/PromptDetailPage.tsx`

**需要集成**:
```typescript
import { CodeEditor } from '@/components/ui/code-editor'
import { DiffViewer } from '@/components/ui/diff-viewer'

// 1. 使用 CodeEditor 编辑提示词
<CodeEditor
  code={promptContent}
  language="markdown"
  onChange={setPromptContent}
  readOnly={false}
/>

// 2. 显示优化对比
<Tabs>
  <TabsContent value="editor">
    <CodeEditor ... />
  </TabsContent>
  <TabsContent value="diff">
    <DiffViewer
      oldCode={promptDiff.before}
      newCode={promptDiff.after}
    />
  </TabsContent>
</Tabs>
```

---

### P3: Playground 与测试功能

#### 1. 实现测试用例管理页面
**文件**: `src/pages/playground/TestCasePage.tsx`（新建）

**功能需求**:
- 测试用例列表（使用 `mockTestCases` 数据）
- 创建/编辑测试用例表单
- 批量运行测试
- 测试结果显示（成功/失败/耗时）
- 导入/导出测试集

**数据结构**:
```typescript
interface TestCase {
  id: string
  name: string
  input: string
  expectedOutput: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  actualOutput?: string
  duration?: number
}
```

**组件使用**:
- `EmptyState` - 空状态
- `Badge` - 状态标识
- `Button` - 操作按钮
- `Dialog` - 编辑对话框

---

#### 2. 实现 Badcase 管理页面
**文件**: `src/pages/playground/BadcasePage.tsx`（新建）

**功能需求**:
- Badcase 列表（使用 `mockBadcases` 数据）
- 标注失败原因
- AI 分析失败原因
- 生成优化建议
- 转为测试用例

**AI 分析流程**:
```typescript
const analyzeBadcase = async (badcase: Badcase) => {
  // 1. 发送给 AI 分析
  const analysis = await streamMessage(
    `分析这个失败案例：${badcase.description}`,
    []
  )
  
  // 2. 显示分析结果
  // 3. 生成优化建议
  // 4. 可选：转为测试用例
}
```

---

#### 3. 创建 TestResultList 组件
**文件**: `src/components/playground/TestResultList.tsx`（新建）

**Props**:
```typescript
interface TestResultListProps {
  results: TestResult[]
  onRetry?: (id: string) => void
  onViewDetail?: (id: string) => void
}
```

**UI 设计**:
- 列表形式显示
- 成功/失败状态图标
- 可展开显示详细信息
- 支持筛选和排序

---

### P4: 监控与系统设置

#### 1. 实现会话监控页面
**文件**: `src/pages/monitor/DashboardPage.tsx`（新建）

**功能需求**:
- 实时会话列表
- 会话状态（进行中/已完成/异常）
- 关键指标卡片（响应时间、成功率、总会话数）
- 会话详情查看

**数据模拟**:
```typescript
const mockSessions = [
  {
    id: '1',
    status: 'active',
    startTime: new Date(),
    messageCount: 5,
    avgResponseTime: 1200,
  },
  // ...
]
```

**组件使用**:
- `Card` - 指标卡片
- `Badge` - 状态标识
- `AnimatedList` - 会话列表动画

---

#### 2. 实现日志查询页面
**文件**: `src/pages/monitor/LogsPage.tsx`（新建）

**功能需求**:
- 日志搜索和筛选
- 日志级别筛选（info/debug/error）
- 时间范围选择
- 日志内容高亮显示
- 导出日志

**实现要点**:
```typescript
import { useDebounce } from '@/hooks/useDebounce'

const [searchTerm, setSearchTerm] = useState('')
const debouncedSearch = useDebounce(searchTerm, 300)

useEffect(() => {
  // 执行搜索
  filterLogs(debouncedSearch)
}, [debouncedSearch])
```

---

#### 3. 实现系统设置页面
**文件**: `src/pages/settings/SettingsPage.tsx`（新建）

**功能需求**:
- API Key 配置（Anthropic）
- 模型选择和参数设置
- 系统偏好设置（主题、语言）
- 数据导入/导出
- 版本信息显示

**实现要点**:
```typescript
import { useAgentStore } from '@/stores/agentStore'

const {
  uiPreferences,
  updateUIPreferences,
  debugOptions,
  updateDebugOptions,
} = useAgentStore()

// API Key 配置
<ConfigInput
  type="password"
  value={apiKey}
  onChange={...}
  placeholder="sk-ant-..."
/>

// 主题切换
<Select
  value={uiPreferences.theme}
  onValueChange={(theme) => 
    updateUIPreferences({ theme })
  }
>
  <SelectItem value="light">浅色</SelectItem>
  <SelectItem value="dark">深色</SelectItem>
</Select>
```

---

### P5: 设计规范与优化

#### 1. 审查和优化所有组件的 ChatGPT 风格

**检查清单**:
- [ ] 超扁平化：几乎无阴影
- [ ] 极淡边框：`border-color: var(--border-default)`
- [ ] 纯净背景：纯白背景
- [ ] 留白充足：宽松的间距

**需要优化的组件**:
- `Button` - 确保无阴影
- `Input` - 极淡边框
- `Card` - 扁平化设计
- `Dialog` - 简洁样式

**参考**: 《设计指南》第 1346-1556 行

---

#### 2. 实现完整的 CSS Variables 系统

**检查项**:
- [ ] 色彩系统完整性
- [ ] 间距系统完整性
- [ ] 字体排印完整性
- [ ] 圆角系统完整性
- [ ] 动画时间和缓动函数

**文件**: `src/index.css`

**补充变量示例**:
```css
:root {
  /* 动画时间 */
  --duration-instant: 0.1s;
  --duration-fast: 0.15s;
  --duration-normal: 0.3s;
  --duration-slow: 0.5s;
  
  /* 缓动函数 */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

#### 3. 优化动画效果的一致性

**检查项**:
- [ ] 思考动画：1.4s ease-in-out
- [ ] 打字机效果：30ms/字符
- [ ] 列表入场：0.3s + stagger 0.05s
- [ ] 高亮动画：1s ease-out
- [ ] 进度条：0.5s ease-out

**需要检查的文件**:
- `src/components/ai-chat/ThinkingIndicator.tsx`
- `src/hooks/useTypewriter.ts`
- `src/components/ui/animated-list.tsx`
- `src/components/ui/progress.tsx`

---

#### 4. 代码质量优化

**优化项**:
- [ ] 添加缺失的 TypeScript 类型定义
- [ ] 统一错误处理机制
- [ ] 添加必要的注释和 JSDoc
- [ ] 优化组件性能（React.memo, useMemo）
- [ ] 清理未使用的代码

**工具**:
```bash
# 类型检查
npm run build

# 代码格式化（如果配置了）
npm run lint
```

---

#### 5. 充分利用已安装的库

**检查项**:
- [ ] `date-fns` - 用于日期格式化
- [ ] `lodash-es` - 用于工具函数
- [ ] `zod` - 用于表单验证
- [ ] `shiki` - 已用于代码高亮 ✅
- [ ] `react-diff-viewer-continued` - 已用于 Diff 对比 ✅

**建议**:
```typescript
// 使用 date-fns 格式化日期
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const formattedDate = format(new Date(), 'PPP', { locale: zhCN })

// 使用 zod 验证表单
import { z } from 'zod'

const intentSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  description: z.string().optional(),
})

// 使用 lodash-es 工具函数
import { debounce, throttle, cloneDeep } from 'lodash-es'
```

---

## 📁 项目结构

```
src/
├── components/
│   ├── ai-chat/          # AI 聊天组件 ✅
│   │   ├── MessageBubble.tsx
│   │   ├── ThinkingIndicator.tsx
│   │   ├── ChatInput.tsx
│   │   ├── OptionCard.tsx ✅
│   │   └── ExecutionStage.tsx ✅
│   ├── config/           # 配置组件 ✅
│   │   ├── TagPill.tsx ✅
│   │   ├── CapabilityCard.tsx ✅
│   │   ├── ConfigInput.tsx ✅
│   │   └── ConfigLabel.tsx ✅
│   ├── layout/           # 布局组件
│   │   ├── AIAssistant.tsx ✅
│   │   └── ScenarioAIAssistant.tsx ✅
│   ├── playground/       # Playground 组件 ⏳
│   │   └── TestResultList.tsx (待创建)
│   └── ui/               # UI 组件 ✅
│       ├── code-editor.tsx ✅
│       ├── diff-viewer.tsx ✅
│       └── divider.tsx ✅
├── hooks/                # Hooks ✅
│   ├── useAIStream.ts ✅
│   ├── useHighlight.ts ✅
│   └── useDebounce.ts ✅
├── pages/                # 页面 ⏳
│   ├── config/
│   │   ├── IntentDetailPage.tsx (待完善)
│   │   ├── UIDetailPage.tsx (待完善)
│   │   └── DebugConfigPage.tsx (待创建)
│   ├── playground/
│   │   ├── PromptOptimizePage.tsx (待完善)
│   │   ├── PromptDetailPage.tsx (待完善)
│   │   ├── TestCasePage.tsx (待创建)
│   │   └── BadcasePage.tsx (待创建)
│   ├── monitor/
│   │   ├── DashboardPage.tsx (待创建)
│   │   └── LogsPage.tsx (待创建)
│   └── settings/
│       └── SettingsPage.tsx (待创建)
├── services/             # 服务层 ✅
│   └── anthropic.ts ✅
└── stores/               # 状态管理 ✅
    ├── agentStore.ts ✅
    └── chatStore.ts
```

---

## 🔑 关键技术点

### 1. AI 流式响应集成

```typescript
import { useAIStream } from '@/hooks/useAIStream'

const { isStreaming, content, streamMessage } = useAIStream({
  onComplete: (fullContent) => {
    // 处理完成
  },
})

// 发送消息
await streamMessage('用户输入', messageHistory)
```

### 2. 字段高亮效果

```typescript
import { useHighlight } from '@/hooks/useHighlight'

const { highlight, isHighlighted } = useHighlight()

// 高亮字段 1 秒
highlight('fieldName', 1000)

// 在输入框中使用
<ConfigInput aiFilling={isHighlighted('fieldName')} />
```

### 3. 模拟模式 vs 真实 AI

```typescript
import { useAgentStore } from '@/stores/agentStore'

const { debugOptions } = useAgentStore()

if (debugOptions.useMockResponse) {
  // 使用模拟数据
  setTimeout(() => {
    setResponse('模拟响应')
  }, debugOptions.mockDelay)
} else {
  // 使用真实 AI
  await streamMessage(...)
}
```

---

## 📚 重要文档

1. **设计指南**: `AGENT_MASTER_DESIGN_GUIDE (1).md`
   - ChatGPT 风格规范
   - 组件样式定义
   - 动画效果规范

2. **技术架构**: `AGENT_MASTER_TECH_ARCHITECTURE.md`
   - 技术栈说明
   - 状态管理结构
   - Hook 使用指南

3. **AI 技术栈**: `AI前端开发技术栈指南.md`
   - Anthropic SDK 使用
   - 流式响应处理
   - 代码示例

4. **产品需求**: `AGENT_MASTER_PRD.md`
   - 功能需求
   - 用户故事
   - 验收标准

---

## 🚀 开发流程

### 1. 启动开发服务器

```bash
npm run dev
# 访问 http://localhost:5173
```

### 2. 构建检查

```bash
npm run build
# 确保无类型错误
```

### 3. 开发新页面的步骤

1. 在 `src/pages/` 创建页面组件
2. 在 `src/App.tsx` 添加路由
3. 使用已有的组件和 Hook
4. 遵循 ChatGPT 设计风格
5. 运行构建检查

### 4. 组件开发规范

```typescript
/**
 * 组件说明
 * 功能描述
 */
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ComponentProps {
  /** 属性说明 */
  prop: string
  className?: string
}

export function Component({ prop, className }: ComponentProps) {
  return (
    <div className={cn('基础样式', className)}>
      {/* 内容 */}
    </div>
  )
}
```

---

## ⚠️ 注意事项

1. **默认使用模拟模式**
   - `agentStore` 中 `useMockResponse` 默认为 `true`
   - 不需要真实的 Anthropic API Key 即可开发
   - 可在 DebugConfigPage 切换模式

2. **ChatGPT 风格要点**
   - 极淡边框：`border-[var(--border-default)]`
   - 无阴影或极淡阴影
   - 纯净背景：`bg-[var(--bg-surface)]`
   - 宽松间距：`p-4` `gap-3`

3. **性能优化**
   - 大列表使用虚拟滚动
   - 复杂计算使用 `useMemo`
   - 避免不必要的重渲染

4. **类型安全**
   - 所有组件都有 TypeScript 类型定义
   - Props 使用 interface 定义
   - 避免使用 `any`

---

## 📞 联系方式

如有问题，请参考：
- 设计指南文档
- 已完成的组件代码
- TypeScript 类型定义

祝开发顺利！🎉

