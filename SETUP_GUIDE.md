# Agent Master Demo - 项目初始化指南

本指南将帮助你从零开始搭建 Agent Master Demo 项目。

## 📋 前置要求

确保你的开发环境满足以下要求：

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **操作系统**: macOS, Windows, Linux

检查版本：
```bash
node --version
npm --version
```

## 🚀 快速开始

### 方法一：使用现有配置（推荐）

如果你已经有了本项目的所有配置文件，直接执行：

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量文件
cp .env.example .env.local

# 3. 编辑 .env.local，添加你的 Anthropic API Key
# VITE_ANTHROPIC_API_KEY=your_api_key_here

# 4. 启动开发服务器
npm run dev
```

### 方法二：从零开始创建

如果你想从头创建项目：

```bash
# 1. 使用 Vite 创建 React + TypeScript 项目
npm create vite@latest agent-master-demo -- --template react-ts

# 2. 进入项目目录
cd agent-master-demo

# 3. 安装基础依赖
npm install

# 4. 安装 Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 5. 安装核心依赖
npm install zustand framer-motion lucide-react @anthropic-ai/sdk zod
npm install date-fns lodash-es clsx tailwind-merge

# 6. 安装 Radix UI 组件
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-switch
npm install @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-slot

# 7. 安装专用库
npm install react-resizable-panels shiki react-diff-viewer-continued

# 8. 安装类型定义
npm install -D @types/lodash-es

# 9. 安装开发工具
npm install -D prettier prettier-plugin-tailwindcss
npm install -D eslint typescript-eslint globals
npm install -D eslint-plugin-react-hooks eslint-plugin-react-refresh

# 10. 复制本项目的配置文件
# - vite.config.ts
# - tsconfig.json
# - tsconfig.node.json
# - tailwind.config.js
# - postcss.config.js
# - eslint.config.js
# - .prettierrc
# - .gitignore

# 11. 创建环境变量文件
cp .env.example .env.local
# 编辑 .env.local，添加你的 API Key

# 12. 启动开发服务器
npm run dev
```

## 📁 创建项目结构

创建以下目录结构：

```bash
mkdir -p src/components/{layout,config,chat,ui}
mkdir -p src/{stores,hooks,services,lib,types,styles}
```

## 🎨 配置全局样式

创建 `src/styles/globals.css`：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* 背景色 */
    --bg-base: #ffffff;
    --bg-elevated: #ffffff;
    --bg-surface: #ffffff;
    --bg-secondary: #fafafa;
    --bg-hover: #f5f5f5;
    --bg-active: #ebebeb;
    
    /* 边框色 */
    --border-subtle: rgba(0, 0, 0, 0.04);
    --border-default: rgba(0, 0, 0, 0.06);
    --border-strong: rgba(0, 0, 0, 0.1);
    
    /* 文字色 */
    --text-primary: #1a1a1a;
    --text-secondary: #666666;
    --text-tertiary: #999999;
    --text-disabled: #c0c0c0;
    --text-placeholder: #a3a3a3;
    
    /* 主色 */
    --color-primary: #3b82f6;
    --color-primary-hover: #2563eb;
    --color-primary-muted: rgba(59, 130, 246, 0.1);
    
    /* AI 专属色 */
    --color-ai-thinking: #8b5cf6;
    --color-ai-executing: #3b82f6;
    --color-ai-success: #22c55e;
    --color-ai-highlight: rgba(59, 130, 246, 0.15);
    
    /* 动画时长 */
    --duration-fast: 150ms;
    --duration-normal: 250ms;
    --duration-slow: 400ms;
    --duration-typing: 30ms;
  }
  
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
}
```

## 🔑 获取 Anthropic API Key

1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 注册或登录账号
3. 进入 API Keys 页面
4. 创建新的 API Key
5. 复制 API Key 到 `.env.local` 文件

## ✅ 验证安装

运行以下命令验证项目配置：

```bash
# 检查 TypeScript 配置
npx tsc --noEmit

# 检查 ESLint 配置
npm run lint

# 格式化代码
npm run format

# 启动开发服务器
npm run dev
```

如果一切正常，你应该能在浏览器中看到 Vite 的欢迎页面。

## 🎯 下一步

1. 阅读 [README.md](./README.md) 了解项目概览
2. 阅读 [TECH_ARCHITECTURE.md](./TECH_ARCHITECTURE.md) 了解技术架构
3. 阅读 [AGENT_MASTER_DESIGN_GUIDE (1).md](./AGENT_MASTER_DESIGN_GUIDE%20(1).md) 了解设计规范
4. 开始开发你的第一个组件！

## 🐛 常见问题

### 问题：npm install 失败

**解决方案**：
```bash
# 清除 npm 缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 问题：TypeScript 报错找不到模块

**解决方案**：
确保 `tsconfig.json` 中配置了路径别名：
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 问题：Tailwind CSS 样式不生效

**解决方案**：
1. 确保 `tailwind.config.js` 的 `content` 配置正确
2. 确保在 `main.tsx` 中导入了 `globals.css`
3. 重启开发服务器

## 📞 获取帮助

如果遇到问题，可以：
1. 查看项目文档
2. 检查 GitHub Issues
3. 联系项目维护者

---

祝你开发愉快！🎉

