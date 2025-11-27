# Agent Master Demo

> 用 AI 管理 AI 的元级平台 - 让 AI 的能力可见、可信、可控

📚 **[查看完整文档索引](./DOCUMENTATION_INDEX.md)** | 🚀 **[快速开始指南](./SETUP_GUIDE.md)** | 🎨 **[设计规范](./AGENT_MASTER_DESIGN_GUIDE%20(1).md)** | 🏗️ **[技术架构](./TECH_ARCHITECTURE.md)**

---

## 📖 项目简介

Agent Master 是一个专业的 AI 工作流管理平台，采用 ChatGPT 风格的极简设计，提供直观的人机协作界面。用户可以通过配置界面定义 AI Agent 的意图和能力，AI 助手会实时响应并执行任务。

### 核心特点

- 🎨 **ChatGPT 风格设计**：纯白背景、极淡边框、无阴影的专业简洁风格
- 🤖 **AI 交互可视化**：思考动画、打字机效果、进度实时反馈
- ⚡ **智能配置填充**：AI 自动填充配置项，带高亮动画
- 🎯 **三区域布局**：侧边导航 + 主工作区 + AI 聊天助手
- 🔧 **可拖拽面板**：灵活调整工作区布局
- 💬 **流式响应**：实时显示 AI 思考和执行过程

## 🛠️ 技术栈

### 核心框架
- **React 18** - 现代化的 UI 框架
- **TypeScript** - 类型安全的开发体验
- **Vite** - 快速的开发构建工具

### 样式方案
- **Tailwind CSS** - 实用优先的 CSS 框架
- **CSS Variables** - 主题定制和设计系统
- **Framer Motion** - 声明式动画库

### UI 组件
- **Radix UI** - 无障碍的 UI 原语
- **shadcn/ui** - 可定制的高质量组件
- **lucide-react** - 精美的图标库

### 状态管理与工具
- **Zustand** - 轻量级状态管理
- **Zod** - TypeScript 优先的模式验证
- **@anthropic-ai/sdk** - Claude API 集成

### 专用库
- **react-resizable-panels** - 可拖拽的面板布局
- **shiki** - 代码语法高亮
- **react-diff-viewer-continued** - 代码对比视图
- **date-fns** - 现代化的日期处理
- **lodash-es** - 实用工具函数库

## 📁 项目结构

```
agent-master-demo/
├── public/                      # 静态资源
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
│   ├── stores/                  # Zustand 状态管理
│   │   ├── agentStore.ts        # Agent 配置状态
│   │   └── chatStore.ts         # 聊天状态
│   ├── hooks/                   # 自定义 Hooks
│   │   ├── useAIStream.ts       # AI 流式响应
│   │   └── useTypingEffect.ts   # 打字机效果
│   ├── services/                # 服务层
│   │   └── anthropic.ts         # Anthropic API 调用
│   ├── lib/                     # 工具函数
│   ├── types/                   # TypeScript 类型定义
│   ├── styles/                  # 样式文件
│   │   └── globals.css          # 全局样式 + CSS Variables
│   ├── App.tsx                  # 根组件
│   └── main.tsx                 # 入口文件
├── index.html                   # HTML 模板
├── package.json                 # 依赖配置
├── tsconfig.json                # TypeScript 配置
├── vite.config.ts               # Vite 配置
├── tailwind.config.js           # Tailwind 配置
└── README.md                    # 项目说明
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env.local` 文件并添加你的 API 密钥：

```bash
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看应用。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 📚 设计文档

- [设计指南](./AGENT_MASTER_DESIGN_GUIDE%20(1).md) - 完整的视觉设计规范
- [技术栈指南](./# AI前端开发技术栈指南 v2.md) - 详细的技术实现指导

## 🎨 设计理念

### 视觉风格
- **ChatGPT 极简风格**：纯白背景、极淡边框、无阴影
- **专业克制**：避免过度装饰，突出功能性
- **信息层级清晰**：通过间距和字重区分重要性

### 交互原则
- **AI 可见性**：所有 AI 行为都有明确的视觉反馈
- **进度透明**：用户随时知道 AI 在做什么
- **控制感**：关键节点需要用户确认
- **状态连续性**：平滑的状态过渡动画

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

