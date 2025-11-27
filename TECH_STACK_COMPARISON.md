# 技术栈选择对比

本文档说明了 Agent Master Demo 为什么选择当前的技术栈，以及与其他方案的对比。

## 🎯 核心决策：React + Vite vs Next.js

### 为什么选择 React + Vite？

| 维度 | React + Vite | Next.js | 选择理由 |
|------|-------------|---------|---------|
| **项目类型** | 单页应用 (SPA) | 全栈框架 | Agent Master 是纯前端 Demo，不需要 SSR |
| **开发速度** | ⚡ 极快的 HMR | 🔄 较快 | Vite 的开发体验更好 |
| **构建复杂度** | 🟢 简单 | 🟡 中等 | Demo 项目不需要复杂配置 |
| **学习曲线** | 🟢 平缓 | 🟡 陡峭 | React + Vite 更容易上手 |
| **打包大小** | 🟢 小 | 🟡 较大 | SPA 更轻量 |
| **部署方式** | 静态托管 | 需要 Node 服务器 | 静态托管更简单 |

### 结论
对于 Agent Master Demo 这样的纯前端项目，React + Vite 是更合适的选择。

---

## 🎨 样式方案：Tailwind CSS vs CSS-in-JS

### 为什么选择 Tailwind CSS？

| 维度 | Tailwind CSS | Styled Components | Emotion | 选择理由 |
|------|-------------|------------------|---------|---------|
| **开发速度** | ⚡ 非常快 | 🔄 中等 | 🔄 中等 | 实用类快速开发 |
| **与设计系统契合** | ✅ 完美 | ⚠️ 需要额外配置 | ⚠️ 需要额外配置 | ChatGPT 风格易实现 |
| **打包大小** | 🟢 小（PurgeCSS） | 🟡 中等 | 🟡 中等 | 自动移除未使用样式 |
| **运行时性能** | ✅ 无运行时 | ⚠️ 有运行时开销 | ⚠️ 有运行时开销 | 纯 CSS，性能最优 |
| **可维护性** | ✅ 高 | ✅ 高 | ✅ 高 | 统一的设计语言 |

### 结论
Tailwind CSS 与 ChatGPT 风格的极简设计完美契合，开发效率高。

---

## 🔄 状态管理：Zustand vs Redux vs Jotai

### 为什么选择 Zustand？

| 维度 | Zustand | Redux Toolkit | Jotai | Recoil | 选择理由 |
|------|---------|--------------|-------|--------|---------|
| **学习曲线** | 🟢 简单 | 🟡 中等 | 🟢 简单 | 🟡 中等 | API 直观易懂 |
| **代码量** | 🟢 少 | 🟡 中等 | 🟢 少 | 🟡 中等 | 无需 Provider |
| **TypeScript 支持** | ✅ 优秀 | ✅ 优秀 | ✅ 优秀 | ✅ 优秀 | 类型推导完善 |
| **DevTools** | ✅ 支持 | ✅ 强大 | ⚠️ 基础 | ✅ 支持 | 满足 Demo 需求 |
| **包大小** | 🟢 1.2KB | 🟡 11KB | 🟢 2.9KB | 🟡 14KB | 最轻量 |
| **适用场景** | 中小型项目 | 大型项目 | 原子化状态 | 复杂依赖 | Demo 项目最佳 |

### 结论
Zustand 轻量、简单、够用，是 Demo 项目的最佳选择。

---

## 🎬 动画库：Framer Motion vs React Spring vs GSAP

### 为什么选择 Framer Motion？

| 维度 | Framer Motion | React Spring | GSAP | 选择理由 |
|------|--------------|-------------|------|---------|
| **API 风格** | 声明式 | 声明式 | 命令式 | 声明式更符合 React |
| **学习曲线** | 🟢 简单 | 🟡 中等 | 🔴 陡峭 | 易于上手 |
| **功能丰富度** | ✅ 丰富 | ✅ 丰富 | ✅ 非常丰富 | 满足需求 |
| **性能** | ✅ 优秀 | ✅ 优秀 | ✅ 优秀 | 都很好 |
| **包大小** | 🟡 52KB | 🟢 28KB | 🔴 80KB+ | 可接受 |
| **TypeScript** | ✅ 完善 | ✅ 完善 | ⚠️ 基础 | 类型支持好 |

### 结论
Framer Motion 的声明式 API 最适合实现 AI 思考、打字机等动效。

---

## 🧩 UI 组件：Radix UI + shadcn/ui vs Ant Design vs MUI

### 为什么选择 Radix UI + shadcn/ui？

| 维度 | Radix + shadcn | Ant Design | MUI | Chakra UI | 选择理由 |
|------|---------------|-----------|-----|-----------|---------|
| **定制性** | ✅ 完全可控 | ⚠️ 有限 | ⚠️ 有限 | ✅ 高 | 可完全定制 |
| **设计风格** | 🎨 自定义 | 🏢 企业级 | 🎨 Material | 🎨 现代 | 符合 ChatGPT 风格 |
| **无障碍性** | ✅ 优秀 | ✅ 良好 | ✅ 优秀 | ✅ 优秀 | WAI-ARIA 标准 |
| **包大小** | 🟢 按需引入 | 🔴 大 | 🔴 大 | 🟡 中等 | 最小化 |
| **集成方式** | 复制代码 | npm 安装 | npm 安装 | npm 安装 | 完全掌控 |
| **学习成本** | 🟢 低 | 🟡 中等 | 🟡 中等 | 🟢 低 | 简单直观 |

### 结论
Radix UI + shadcn/ui 提供了最大的定制自由度，完美契合 ChatGPT 极简风格。

---

## 🔧 工具库对比

### 日期处理：date-fns vs moment.js vs dayjs

| 维度 | date-fns | moment.js | dayjs | 选择理由 |
|------|---------|-----------|-------|---------|
| **包大小** | 🟢 13KB | 🔴 67KB | 🟢 7KB | 轻量 |
| **Tree Shaking** | ✅ 支持 | ❌ 不支持 | ✅ 支持 | 按需引入 |
| **不可变性** | ✅ 是 | ❌ 否 | ✅ 是 | 函数式编程 |
| **TypeScript** | ✅ 完善 | ⚠️ 基础 | ✅ 完善 | 类型支持好 |

**选择**：date-fns（现代化、轻量、函数式）

### 工具函数：lodash-es vs ramda vs just

| 维度 | lodash-es | ramda | just | 选择理由 |
|------|----------|-------|------|---------|
| **功能丰富度** | ✅ 非常丰富 | ✅ 丰富 | ⚠️ 基础 | 功能全面 |
| **Tree Shaking** | ✅ 支持 | ✅ 支持 | ✅ 支持 | 都支持 |
| **学习曲线** | 🟢 简单 | 🔴 陡峭 | 🟢 简单 | 易于使用 |
| **社区支持** | ✅ 强大 | ✅ 良好 | ⚠️ 一般 | 生态成熟 |

**选择**：lodash-es（功能全面、易用、生态好）

---

## 📊 总结

### 最终技术栈

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

### 选择原则

1. **适合项目规模**：Demo 项目不需要过度工程化
2. **开发效率优先**：快速迭代、快速验证
3. **性能优秀**：轻量、快速、流畅
4. **易于维护**：代码清晰、结构简单
5. **符合设计**：完美契合 ChatGPT 极简风格

### 不选择的理由

- ❌ **Next.js**：过于复杂，Demo 不需要 SSR
- ❌ **Redux**：过于重量级，Zustand 够用
- ❌ **Ant Design**：设计风格不符合，定制困难
- ❌ **GSAP**：命令式 API 不符合 React 风格
- ❌ **moment.js**：包太大，已停止维护

---

*本文档帮助理解技术栈选择的理由，为未来的技术决策提供参考。*

