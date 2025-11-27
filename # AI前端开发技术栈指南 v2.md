# Agent Master Demo - 技术栈指南 v3.0

## 🎯 核心技术栈定义

### 主技术栈（Agent Master Demo 专用）
```yaml
核心框架: React 18 + TypeScript + Vite
样式方案: Tailwind CSS + CSS Variables
UI组件库: Radix UI + shadcn/ui
动画库: Framer Motion
状态管理: Zustand
代码高亮: Shiki
代码Diff: react-diff-viewer-continued
拖拽面板: react-resizable-panels
图标库: lucide-react
AI调用: @anthropic-ai/sdk
表单验证: Zod
工具库: date-fns, lodash-es
```

### 技术栈选择理由
```markdown
✅ React 18 + Vite:
- 快速的开发体验和热更新
- 轻量级构建工具，适合单页应用
- 比 Next.js 更简单直接，适合 Demo 项目

✅ Tailwind CSS + CSS Variables:
- 快速原型开发
- 与 ChatGPT 风格的极简设计完美契合
- CSS Variables 用于主题定制

✅ Radix UI + shadcn/ui:
- 无障碍性好
- 可定制性强
- 组件可直接复制粘贴到项目中

✅ Framer Motion:
- 声明式动画 API
- 适合实现 AI 思考、打字机等复杂动效
- 性能优秀

✅ Zustand:
- 轻量级状态管理
- API 简单直观
- 适合中小型项目
```

## 📁 推荐的项目结构

```
agent-master-demo/
├── public/                      # 静态资源
│   └── fonts/                   # 字体文件
├── src/
│   ├── components/              # 组件目录
│   │   ├── layout/              # 布局组件
│   │   │   ├── Sidebar.tsx      # 侧边导航栏
│   │   │   ├── MainWorkspace.tsx # 主工作区
│   │   │   └── AIAssistant.tsx  # AI 聊天助手
│   │   ├── config/              # 配置界面组件
│   │   │   ├── IntentConfig.tsx # 意图配置
│   │   │   ├── UIConfig.tsx     # UI 配置
│   │   │   └── DebugConfig.tsx  # 调试配置
│   │   ├── chat/                # 聊天相关组件
│   │   │   ├── ChatMessage.tsx  # 聊天消息
│   │   │   ├── ThinkingDots.tsx # AI 思考动画
│   │   │   └── TypewriterText.tsx # 打字机效果
│   │   └── ui/                  # 基础 UI 组件 (shadcn/ui)
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── TagPill.tsx
│   │       └── CapabilityCard.tsx
│   ├── stores/                  # Zustand 状态管理
│   │   ├── agentStore.ts        # Agent 配置状态
│   │   └── chatStore.ts         # 聊天状态
│   ├── hooks/                   # 自定义 Hooks
│   │   ├── useAIStream.ts       # AI 流式响应
│   │   └── useTypingEffect.ts   # 打字机效果
│   ├── services/                # 服务层
│   │   └── anthropic.ts         # Anthropic API 调用
│   ├── lib/                     # 工具函数
│   │   └── utils.ts             # 通用工具
│   ├── types/                   # TypeScript 类型定义
│   │   └── index.ts
│   ├── styles/                  # 样式文件
│   │   └── globals.css          # 全局样式 + CSS Variables
│   ├── App.tsx                  # 根组件
│   ├── main.tsx                 # 入口文件
│   └── vite-env.d.ts            # Vite 类型声明
├── index.html                   # HTML 模板
├── package.json                 # 依赖配置
├── tsconfig.json                # TypeScript 配置
├── vite.config.ts               # Vite 配置
├── tailwind.config.js           # Tailwind 配置
├── postcss.config.js            # PostCSS 配置
└── README.md                    # 项目说明
```

## 📋 组件设计原则

### 1. 布局组件（Layout）
```markdown
职责: 定义应用的整体结构
特点:
- 三区域布局：侧边栏(240px) + 主工作区(自适应) + AI助手(400px)
- 使用 react-resizable-panels 实现可拖拽分隔
- 响应式适配：小屏幕时 AI 助手变为底部抽屉

关键组件:
- Sidebar: 导航菜单、项目切换
- MainWorkspace: 配置界面、内容展示
- AIAssistant: 聊天界面、AI 交互
```

### 2. 配置组件（Config）
```markdown
职责: 用户配置 Agent 的各项参数
特点:
- ChatGPT 风格的极简设计
- AI 智能填充 + 高亮动画
- 实时验证 + 错误提示

关键组件:
- IntentConfig: 意图描述、能力选择
- UIConfig: UI 偏好设置
- DebugConfig: 调试选项
```

### 3. 聊天组件（Chat）
```markdown
职责: AI 交互界面
特点:
- 打字机效果
- AI 思考状态动画
- 代码高亮 + Diff 对比

关键组件:
- ChatMessage: 消息气泡
- ThinkingDots: 脉冲点动画
- TypewriterText: 逐字显示效果
```

## 🔧 核心技术实现指导

### 1. UI 组件使用规范

```typescript
// ✅ 优先使用 shadcn/ui 组件
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

// ✅ 需要更底层控制时使用 Radix UI
import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

// ✅ 图标统一使用 lucide-react
import { Search, Menu, X, Sparkles } from 'lucide-react'
```

### 2. 状态管理模式

```typescript
// stores/agentStore.ts - Agent 配置状态
import { create } from 'zustand'

interface AgentState {
  intent: string
  capabilities: string[]
  uiPreferences: Record<string, any>
  setIntent: (intent: string) => void
  addCapability: (capability: string) => void
}

export const useAgentStore = create<AgentState>((set) => ({
  intent: '',
  capabilities: [],
  uiPreferences: {},
  setIntent: (intent) => set({ intent }),
  addCapability: (capability) =>
    set((state) => ({
      capabilities: [...state.capabilities, capability]
    })),
}))
```

### 3. AI 流式响应处理

```typescript
// hooks/useAIStream.ts
import { useState, useCallback } from 'react'
import Anthropic from '@anthropic-ai/sdk'

export function useAIStream() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [content, setContent] = useState('')

  const streamMessage = useCallback(async (prompt: string) => {
    setIsStreaming(true)
    setContent('')

    const client = new Anthropic({
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    })

    const stream = await client.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        setContent((prev) => prev + chunk.delta.text)
      }
    }

    setIsStreaming(false)
  }, [])

  return { isStreaming, content, streamMessage }
}
```

### 4. 打字机效果实现

```typescript
// hooks/useTypingEffect.ts
import { useState, useEffect } from 'react'

export function useTypingEffect(text: string, speed = 30) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1))
      }, speed)
      return () => clearTimeout(timeout)
    } else {
      setIsTyping(false)
    }
  }, [text, displayedText, speed])

  return { displayedText, isTyping }
}
```

## 📦 依赖包配置

### 核心依赖清单
```json
{
  "name": "agent-master-demo",
  "version": "0.1.0",
  "type": "module",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@anthropic-ai/sdk": "^0.32.1",
    "zustand": "^4.5.0",
    "zod": "^3.23.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.460.0",
    "date-fns": "^4.1.0",
    "lodash-es": "^4.17.21",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "react-resizable-panels": "^2.1.0",
    "shiki": "^1.22.0",
    "react-diff-viewer-continued": "^3.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/lodash-es": "^4.17.12",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.6.0",
    "vite": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^9.0.0",
    "prettier": "^3.3.0"
  }
}
```

### 依赖说明

| 依赖包 | 用途 | 版本要求 |
|--------|------|----------|
| `react` + `react-dom` | 核心框架 | ^18.3.1 |
| `@anthropic-ai/sdk` | Claude API 调用 | ^0.32.1 |
| `zustand` | 轻量级状态管理 | ^4.5.0 |
| `zod` | 表单验证和类型安全 | ^3.23.0 |
| `framer-motion` | 动画库 | ^11.0.0 |
| `lucide-react` | 图标库 | ^0.460.0 |
| `@radix-ui/*` | 无障碍 UI 原语 | ^1.0.0+ |
| `react-resizable-panels` | 可拖拽面板 | ^2.1.0 |
| `shiki` | 代码高亮 | ^1.22.0 |
| `react-diff-viewer-continued` | 代码对比 | ^3.4.0 |
| `tailwindcss` | CSS 框架 | ^3.4.0 |
| `vite` | 构建工具 | ^5.4.0 |
| `typescript` | 类型系统 | ^5.6.0 |

## 🎨 样式系统配置

### Tailwind 配置示例

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'thinking': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'typing': 'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
}
```

### CSS Variables 定义

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* 背景色 */
    --bg-base: #ffffff;
    --bg-elevated: #ffffff;
    --bg-hover: #f5f5f5;

    /* 边框色 */
    --border-subtle: rgba(0, 0, 0, 0.04);
    --border-default: rgba(0, 0, 0, 0.06);

    /* 文字色 */
    --text-primary: #1a1a1a;
    --text-secondary: #666666;
    --text-tertiary: #999999;

    /* 主色 */
    --color-primary: #3b82f6;
    --color-primary-hover: #2563eb;

    /* AI 专属色 */
    --color-ai-thinking: #8b5cf6;
    --color-ai-executing: #3b82f6;
    --color-ai-success: #22c55e;

    /* 动画时长 */
    --duration-fast: 150ms;
    --duration-normal: 250ms;
    --duration-slow: 400ms;
    --duration-typing: 30ms;
  }
}
```

## 🚀 开发工作流

### 1. 项目初始化

```bash
# 使用 Vite 创建项目
npm create vite@latest agent-master-demo -- --template react-ts

# 进入项目目录
cd agent-master-demo

# 安装依赖
npm install

# 安装 Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 安装核心依赖
npm install zustand framer-motion lucide-react @anthropic-ai/sdk
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install react-resizable-panels shiki react-diff-viewer-continued
npm install date-fns lodash-es zod clsx tailwind-merge

# 安装类型定义
npm install -D @types/lodash-es
```

### 2. 配置文件设置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3. 环境变量配置

```bash
# .env.local
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

## 📝 代码规范

### 文件命名规范
```
- 组件文件: PascalCase (Button.tsx, ChatMessage.tsx)
- 工具文件: camelCase (utils.ts, formatDate.ts)
- Store 文件: camelCase + Store (agentStore.ts, chatStore.ts)
- Hook 文件: camelCase + use 前缀 (useAIStream.ts)
- 类型文件: PascalCase + .types.ts (Agent.types.ts)
```

### 导入顺序
```typescript
// 1. React 核心
import { useState, useEffect } from 'react'

// 2. 第三方库
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'

// 3. 本地组件
import { Button } from '@/components/ui/button'
import { ChatMessage } from '@/components/chat/ChatMessage'

// 4. Hooks 和 Stores
import { useAgentStore } from '@/stores/agentStore'
import { useTypingEffect } from '@/hooks/useTypingEffect'

// 5. 工具函数和类型
import { cn } from '@/lib/utils'
import type { Agent } from '@/types'

// 6. 样式
import './styles.css'
```

### TypeScript 类型定义
```typescript
// types/index.ts
export interface Agent {
  id: string
  name: string
  intent: string
  capabilities: Capability[]
  status: AgentStatus
}

export type AgentStatus = 'idle' | 'thinking' | 'executing' | 'success' | 'error'

export interface Capability {
  id: string
  name: string
  description: string
  enabled: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}
```

## 🚀 性能优化建议

### 1. 组件懒加载
```typescript
// 对大型组件使用懒加载
import { lazy, Suspense } from 'react'

const CodeEditor = lazy(() => import('@/components/CodeEditor'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CodeEditor />
    </Suspense>
  )
}
```

### 2. 避免不必要的重渲染
```typescript
// 使用 React.memo 优化组件
import { memo } from 'react'

export const ChatMessage = memo(({ message }: { message: ChatMessage }) => {
  return <div>{message.content}</div>
})

// 使用 useCallback 缓存函数
const handleSubmit = useCallback((data: FormData) => {
  // 处理逻辑
}, [])
```

### 3. Tailwind CSS 优化
```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Tailwind 会自动移除未使用的样式
}
```

## 🎯 开发建议

### Agent Master Demo 专属建议
1. **优先实现核心交互**：AI 思考动画、打字机效果、配置填充
2. **保持视觉一致性**：严格遵循 ChatGPT 风格的极简设计
3. **注重动效细节**：所有状态变化都应有平滑过渡
4. **类型安全优先**：充分利用 TypeScript 的类型系统
5. **组件可复用性**：将通用逻辑抽取为 Hooks

### 技术栈使用原则
- ✅ **React 18 + Vite**：快速开发，适合单页应用
- ✅ **Tailwind CSS**：快速样式开发，与设计系统完美契合
- ✅ **Zustand**：轻量级状态管理，API 简单
- ✅ **Framer Motion**：声明式动画，性能优秀
- ✅ **shadcn/ui**：可定制的高质量组件

### 避免的做法
- ❌ 不要过度工程化（这是 Demo 项目）
- ❌ 不要引入不必要的依赖
- ❌ 不要偏离 ChatGPT 风格的设计规范
- ❌ 不要忽略 TypeScript 类型检查
- ❌ 不要在 Demo 阶段实现完整的后端功能