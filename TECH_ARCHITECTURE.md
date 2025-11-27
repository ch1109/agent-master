# Agent Master Demo - 技术架构文档

## 📐 架构概览

Agent Master Demo 采用现代化的前端技术栈，基于 React 18 + Vite 构建，使用 Zustand 进行状态管理，Tailwind CSS 实现样式系统。

### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户界面层                             │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────┐       │
│  │  Sidebar │  │ MainWorkspace│  │  AIAssistant    │       │
│  │  (导航)  │  │  (配置界面)   │  │  (AI聊天)       │       │
│  └──────────┘  └──────────────┘  └─────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                      组件层 (Components)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Config 组件  │  │  Chat 组件   │  │  UI 组件     │      │
│  │ (配置表单)   │  │ (消息/动画)  │  │ (shadcn/ui)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    状态管理层 (Zustand)                       │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ agentStore   │  │  chatStore   │                         │
│  │ (Agent配置)  │  │  (聊天状态)  │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    服务层 (Services)                          │
│  ┌──────────────────────────────────────────────┐           │
│  │         Anthropic API Service                │           │
│  │  (Claude API 调用、流式响应处理)              │           │
│  └──────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    外部服务 (External)                        │
│                   Anthropic Claude API                       │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ 技术栈详解

### 1. 核心框架

#### React 18
- **选择理由**：成熟稳定、生态丰富、并发特性
- **使用场景**：整个应用的 UI 构建
- **关键特性**：
  - Concurrent Rendering（并发渲染）
  - Automatic Batching（自动批处理）
  - Suspense（异步组件加载）

#### TypeScript 5.6
- **选择理由**：类型安全、开发体验好、减少运行时错误
- **配置要点**：
  - 严格模式（strict: true）
  - 路径别名（@/* 映射到 src/*）
  - 未使用变量检查

#### Vite 5.4
- **选择理由**：快速的开发服务器、高效的 HMR、优化的构建
- **优势**：
  - 基于 ESM 的开发服务器
  - 开箱即用的 TypeScript 支持
  - 快速的冷启动和热更新

### 2. 样式系统

#### Tailwind CSS 3.4
- **选择理由**：快速开发、一致性好、与 ChatGPT 风格契合
- **配置策略**：
  - 自定义颜色系统（基于 CSS Variables）
  - 扩展动画（thinking、typing 等）
  - 自定义字体（Inter、JetBrains Mono）

#### CSS Variables
- **用途**：主题定制、设计系统
- **优势**：
  - 运行时可修改
  - 语义化命名
  - 易于维护

#### Framer Motion 11
- **选择理由**：声明式 API、性能优秀、功能强大
- **使用场景**：
  - AI 思考动画（脉冲效果）
  - 打字机效果
  - 页面过渡动画
  - 配置填充高亮

### 3. UI 组件库

#### Radix UI
- **选择理由**：无障碍性好、无样式、可定制
- **使用组件**：
  - Dialog（对话框）
  - Dropdown Menu（下拉菜单）
  - Select（选择器）
  - Switch（开关）
  - Tabs（标签页）
  - Tooltip（提示）

#### shadcn/ui
- **选择理由**：基于 Radix UI、可直接复制、样式统一
- **集成方式**：组件代码直接放在 `src/components/ui/`
- **定制性**：完全可控，可根据需求修改

### 4. 状态管理

#### Zustand 4.5
- **选择理由**：轻量级、API 简单、无需 Provider
- **Store 设计**：
  ```typescript
  // agentStore - Agent 配置状态
  - intent: string
  - capabilities: Capability[]
  - uiPreferences: Record<string, any>
  
  // chatStore - 聊天状态
  - messages: ChatMessage[]
  - isStreaming: boolean
  - currentThinking: string
  ```

### 5. 专用库

#### @anthropic-ai/sdk
- **用途**：Claude API 调用
- **功能**：
  - 流式响应处理
  - 消息管理
  - 错误处理

#### react-resizable-panels
- **用途**：可拖拽的面板布局
- **应用场景**：三区域布局的分隔线拖拽

#### shiki
- **用途**：代码语法高亮
- **优势**：
  - 支持多种语言
  - 主题丰富
  - 服务端渲染友好

#### react-diff-viewer-continued
- **用途**：代码对比视图
- **应用场景**：显示 AI 生成的代码变更

## 📂 目录结构设计

### 组件分层

```
components/
├── layout/          # 布局组件（页面级）
├── config/          # 配置组件（业务级）
├── chat/            # 聊天组件（业务级）
└── ui/              # 基础组件（通用级）
```

### 职责划分

- **layout/**：定义应用整体结构，不包含业务逻辑
- **config/**：处理 Agent 配置相关的业务逻辑
- **chat/**：处理 AI 交互相关的业务逻辑
- **ui/**：可复用的基础 UI 组件（shadcn/ui）

### Hooks 设计

```
hooks/
├── useAIStream.ts       # AI 流式响应
├── useTypingEffect.ts   # 打字机效果
├── useHighlight.ts      # 配置填充高亮
└── useDebounce.ts       # 防抖处理
```

### Store 设计

```
stores/
├── agentStore.ts        # Agent 配置状态
│   ├── intent
│   ├── capabilities
│   └── uiPreferences
└── chatStore.ts         # 聊天状态
    ├── messages
    ├── isStreaming
    └── currentThinking
```

## 🔄 数据流设计

### 1. Agent 配置流程

```
用户输入 → agentStore 更新 → UI 重新渲染 → AI 分析 → 自动填充
```

### 2. AI 交互流程

```
用户发送消息 → chatStore 添加消息 → 调用 Anthropic API → 
流式接收响应 → 实时更新 UI → 完成后保存到 chatStore
```

### 3. 状态同步

- 使用 Zustand 的订阅机制
- 组件通过 `useStore` Hook 获取状态
- 状态变更自动触发组件重渲染

## 🎨 样式系统设计

### CSS Variables 层级

```css
:root {
  /* 背景层级 */
  --bg-base
  --bg-elevated
  --bg-surface
  
  /* 边框层级 */
  --border-subtle
  --border-default
  --border-strong
  
  /* 文字层级 */
  --text-primary
  --text-secondary
  --text-tertiary
  
  /* AI 专属色 */
  --color-ai-thinking
  --color-ai-executing
  --color-ai-success
}
```

### Tailwind 扩展

- 自定义颜色（映射到 CSS Variables）
- 自定义动画（thinking、typing）
- 自定义字体（Inter、JetBrains Mono）

## 🚀 性能优化策略

### 1. 代码分割
- 使用 `React.lazy` 懒加载大型组件
- 路由级别的代码分割

### 2. 渲染优化
- 使用 `React.memo` 避免不必要的重渲染
- 使用 `useCallback` 和 `useMemo` 缓存函数和值

### 3. 资源优化
- Tailwind CSS 自动移除未使用的样式
- Vite 自动进行 Tree Shaking

### 4. 状态优化
- Zustand 的选择器避免不必要的订阅
- 合理拆分 Store，避免全局状态过大

## 🔐 安全考虑

### 1. API 密钥管理
- 使用环境变量存储 API 密钥
- 不在代码中硬编码敏感信息

### 2. 类型安全
- 使用 TypeScript 严格模式
- 使用 Zod 进行运行时验证

### 3. 错误处理
- 统一的错误边界
- API 调用的错误处理和重试机制

## 📝 开发规范

### 1. 命名规范
- 组件：PascalCase
- 函数：camelCase
- 常量：UPPER_SNAKE_CASE
- 文件：PascalCase（组件）、camelCase（工具）

### 2. 导入顺序
1. React 核心
2. 第三方库
3. 本地组件
4. Hooks 和 Stores
5. 工具函数和类型
6. 样式

### 3. 类型定义
- 所有组件都有明确的 Props 类型
- 使用 `interface` 定义对象类型
- 使用 `type` 定义联合类型和工具类型

## 🎯 未来扩展

### 可能的优化方向
1. 添加单元测试（Vitest）
2. 添加 E2E 测试（Playwright）
3. 实现主题切换（暗色模式）
4. 添加国际化支持（i18n）
5. 实现离线缓存（Service Worker）

---

*本文档描述了 Agent Master Demo 的完整技术架构，为开发提供指导。*

