# Agent Master Demo - Frontend Design Guide

> 这是一个"用 AI 管理 AI"的元级平台。设计的核心挑战是：让用户感受到 AI 的智能与专业，同时保持界面的克制与可控感。每一个视觉决策都应该服务于一个目标——**让 AI 的能力可见、可信、可控**。

---

## Part 1: 设计哲学与产品定位

### 1.1 这个产品的本质

Agent Master 不是普通的后台管理系统，它是：
- **AI 的控制中心**：用户通过它指挥 AI 完成复杂任务
- **人机协作界面**：右侧 AI 助手是"副驾驶"，中间区域是"仪表盘"
- **信任建立工具**：用户需要相信 AI 正在正确地执行任务

设计必须传达：**专业、智能、可控、高效**

### 1.2 视觉调性定位

```
❌ 避免的风格：
- 过度科幻（霓虹、赛博朋克）
- 消费级产品（圆润、彩色、可爱）
- 传统后台（灰暗、密集、无生气）
- 模板感（渐变紫蓝、卡片堆叠、装饰性插画）

✅ 追求的风格：
- Linear / Notion / Figma 的专业简洁
- 浅色主题为主（清爽、专业、易读性好）
- 精确的信息层级
- 有节制的动效（功能性 > 装饰性）
- 细节处的精致感（而非大面积的华丽）
```

### 1.3 核心设计原则

| 原则 | 在 Agent Master 中的体现 |
|------|------------------------|
| **AI 可见性** | AI 的思考、执行、结果都要有清晰的视觉反馈 |
| **进度透明** | 用户随时知道 AI 在做什么、做到哪一步 |
| **控制感** | 关键节点必须有用户确认，不能让 AI"失控" |
| **信息密度平衡** | 配置区信息密集但有序，聊天区轻松自然 |
| **状态连续性** | 从规划到执行到完成，视觉状态平滑过渡 |

---

## Part 2: 整体布局架构

### 2.1 三区域布局规范

```
┌─────────────┬──────────────────────────┬─────────────────┐
│  侧边导航    │      主工作区             │  AI 聊天助手     │
│  240px      │      flex-grow           │  400px          │
│  (固定)     │      (自适应填满)         │  (可拖拽调整)    │
│             │                          │                 │
│  白色背景    │      纯白背景             │   白色背景       │
│  #ffffff    │      #ffffff             │   #ffffff       │
│             │   (ChatGPT 极简风格)      │                 │
└─────────────┴──────────────────────────┴─────────────────┘
```

### 2.2 布局实现

```css
/* 根布局容器 */
.app-layout {
  display: flex;
  height: 100vh;
  background: var(--bg-base);
  overflow: hidden;
}

/* 侧边导航 */
.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: var(--bg-elevated);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
}

/* 主工作区 */
.main-workspace {
  flex: 1;
  min-width: 0; /* 防止内容撑开 */
  background: var(--bg-base);
  overflow-y: auto;
  overflow-x: hidden;
}

/* AI 助手面板 */
.ai-assistant {
  width: 400px;
  min-width: 350px;
  max-width: 600px;
  flex-shrink: 0;
  background: var(--bg-elevated);
  border-left: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
}

/* 可拖拽分隔线 */
.resize-handle {
  width: 4px;
  cursor: col-resize;
  background: transparent;
  transition: background var(--duration-fast);
  position: relative;
}

.resize-handle:hover,
.resize-handle:active {
  background: var(--color-primary);
}

.resize-handle::before {
  content: '';
  position: absolute;
  left: -4px;
  right: -4px;
  top: 0;
  bottom: 0;
}
```

### 2.3 区域职责划分

| 区域 | 职责 | 信息密度 | 交互频率 |
|------|------|----------|----------|
| **侧边导航** | 全局导航、项目切换 | 低 | 低 |
| **主工作区** | 配置展示、结果呈现 | 高 | 中（主要是查看） |
| **AI 助手** | 对话交互、任务驱动 | 中 | 高（主要交互入口） |

---

## Part 3: 色彩系统

### 3.1 浅色主题调色板

```css
:root {
  /* ===== 背景层级 ===== */
  --bg-base: #ffffff;           /* 纯白 - 主工作区背景（ChatGPT风格）*/
  --bg-elevated: #ffffff;        /* 纯白 - 侧边栏、AI面板、卡片 */
  --bg-surface: #ffffff;         /* 纯白 - 卡片、输入框 */
  --bg-secondary: #fafafa;       /* 次要背景 - 用于微妙区分 */
  --bg-overlay: #ffffff;         /* 覆盖 - 下拉菜单、弹窗 */
  --bg-hover: #f5f5f5;           /* 悬停状态 - 极浅灰 */
  --bg-active: #ebebeb;          /* 激活状态 */
  
  /* ===== 边框 ===== */
  --border-subtle: rgba(0, 0, 0, 0.04);  /* 极淡分割 - ChatGPT风格 */
  --border-default: rgba(0, 0, 0, 0.06); /* 默认边框 - 几乎看不见 */
  --border-strong: rgba(0, 0, 0, 0.1);   /* 强调边框 */
  
  /* ===== 文字 ===== */
  --text-primary: #1a1a1a;       /* 主要文字 - 深黑 */
  --text-secondary: #666666;     /* 次要文字 - 中灰 */
  --text-tertiary: #999999;      /* 辅助文字 - 浅灰（提示文字）*/
  --text-disabled: #c0c0c0;      /* 禁用文字 - 很浅灰 */
  --text-placeholder: #a3a3a3;   /* 占位符 - 浅灰 */
  
  /* ===== 主色 - 克制的蓝 ===== */
  --color-primary: #3b82f6;      /* 主色 */
  --color-primary-hover: #2563eb;
  --color-primary-muted: rgba(59, 130, 246, 0.1);   /* 主色背景 */
  --color-primary-border: rgba(59, 130, 246, 0.3);  /* 主色边框 */
  
  /* ===== 语义色 ===== */
  --color-success: #22c55e;
  --color-success-muted: rgba(34, 197, 94, 0.1);
  
  --color-warning: #eab308;
  --color-warning-muted: rgba(234, 179, 8, 0.1);
  
  --color-error: #ef4444;
  --color-error-muted: rgba(239, 68, 68, 0.1);
  
  --color-info: #3b82f6;
  --color-info-muted: rgba(59, 130, 246, 0.1);
  
  /* ===== AI 专属色 ===== */
  --color-ai-thinking: #8b5cf6;  /* AI思考状态 - 紫色 */
  --color-ai-executing: #3b82f6; /* AI执行状态 - 蓝色 */
  --color-ai-success: #22c55e;   /* AI完成状态 - 绿色 */
  --color-ai-highlight: rgba(59, 130, 246, 0.15); /* 填充高亮 */
}
```

### 3.2 色彩使用原则

**主色使用极度克制**：
- 仅用于：主要按钮、链接、选中状态、AI 高亮
- 避免大面积使用
- 任何使用主色的地方都应该有明确的交互意义

**语义色严格对应含义**：
- 绿色 = 成功、通过、完成
- 红色 = 错误、失败、删除
- 黄色 = 警告、待确认
- 蓝色 = 信息、进行中、AI 相关

### 3.3 ChatGPT 极简风格适用场景

**主工作区采用 ChatGPT 超扁平风格**：
- ✅ **配置界面**：意图配置、UI配置、参数设置
- ✅ **表单填写**：需要用户输入信息的场景
- ✅ **设置页面**：系统设置、偏好设置
- ✅ **内容展示**：配置结果预览、日志查看

**设计特点**：
- 纯白背景（#ffffff），减少视觉干扰
- 极淡边框（0.04-0.06 透明度），几乎看不见
- 无阴影或极轻阴影，保持扁平
- Pill 形标签，完全圆角（999px）
- 宽松留白，不拥挤

**侧边栏和 AI 面板可保持轻微区分**：
- 可使用浅灰背景（#fafafa）与主工作区区分
- 边框稍明显（0.06-0.08），突出边界
- 适度阴影，增强层次感

---

## Part 4: 字体排印

### 4.1 字体配置

```css
:root {
  /* 字体族 */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
  
  /* 字号层级 - 保持克制 */
  --text-xs: 0.75rem;     /* 12px - 时间戳、辅助信息 */
  --text-sm: 0.8125rem;   /* 13px - 次要内容、标签 */
  --text-base: 0.875rem;  /* 14px - 正文（后台系统主字号）*/
  --text-lg: 1rem;        /* 16px - 小标题 */
  --text-xl: 1.125rem;    /* 18px - 区域标题 */
  --text-2xl: 1.25rem;    /* 20px - 页面标题 */
  
  /* 字重 */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  
  /* 行高 */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}
```

### 4.2 文字层级应用

```css
/* 页面标题 */
.page-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  line-height: var(--leading-tight);
}

/* 区域标题 */
.section-title {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

/* 正文 */
.body-text {
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: var(--leading-normal);
}

/* 辅助文字 */
.helper-text {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

/* 代码/配置 */
.code-text {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}
```

---

## Part 5: 间距与网格

### 5.1 间距系统

```css
:root {
  /* 基于 4px 的间距系统 */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  
  /* 组件内边距 */
  --padding-card: var(--space-5);      /* 卡片内边距 */
  --padding-input: var(--space-2) var(--space-3);  /* 输入框 */
  --padding-button: var(--space-2) var(--space-4); /* 按钮 */
  
  /* 区域间距 */
  --gap-items: var(--space-2);         /* 列表项间距 */
  --gap-sections: var(--space-6);      /* 区块间距 */
  --gap-fields: var(--space-4);        /* 表单字段间距 */
}
```

### 5.2 圆角系统

```css
:root {
  --radius-sm: 4px;     /* 小元素：标签、徽章 */
  --radius-md: 6px;     /* 中元素：按钮、输入框 */
  --radius-lg: 8px;     /* 大元素：卡片、面板 */
  --radius-xl: 12px;    /* 特大：模态框、聊天气泡 */
  --radius-pill: 999px; /* Pill形状：标签按钮（ChatGPT风格）*/
}
```

---

## Part 6: AI 交互动效规范（核心）

### 6.1 动效时间系统

```css
:root {
  /* 基础时长 */
  --duration-instant: 50ms;    /* 即时反馈 */
  --duration-fast: 150ms;      /* 快速交互 */
  --duration-normal: 250ms;    /* 标准过渡 */
  --duration-slow: 400ms;      /* 较慢过渡 */
  --duration-slower: 600ms;    /* 强调性动画 */
  
  /* AI 专属时长 */
  --duration-typing: 30ms;     /* 打字机效果每字符 */
  --duration-highlight: 1000ms; /* 高亮持续时间 */
  --duration-thinking: 2000ms; /* 思考动画周期 */
  
  /* 缓动函数 */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);      /* 入场 */
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);       /* 退场 */
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);  /* 移动 */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* 弹性 */
}
```

### 6.2 AI 思考状态动画

```css
/* AI 思考中的脉冲点动画 */
.ai-thinking-dots {
  display: inline-flex;
  gap: 4px;
}

.ai-thinking-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-ai-thinking);
  animation: thinking-pulse 1.4s ease-in-out infinite;
}

.ai-thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
.ai-thinking-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes thinking-pulse {
  0%, 80%, 100% { 
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% { 
    opacity: 1;
    transform: scale(1);
  }
}

/* AI 思考卡片 */
.ai-thinking-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-left: 3px solid var(--color-ai-thinking);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  animation: fadeInUp var(--duration-normal) var(--ease-out);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 6.3 打字机效果

```javascript
// 打字机效果实现
function typeWriter(element, text, speed = 30) {
  let index = 0;
  element.textContent = '';
  
  function type() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// React Hook 版本
function useTypewriter(text, speed = 30, enabled = true) {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    if (!enabled) {
      setDisplayText(text);
      return;
    }
    
    let index = 0;
    setDisplayText('');
    
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(prev => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, speed, enabled]);
  
  return displayText;
}
```

### 6.4 字段填充高亮效果

```css
/* 字段被 AI 填充时的高亮动画 */
.field-ai-highlight {
  animation: aiHighlight var(--duration-highlight) var(--ease-out);
}

@keyframes aiHighlight {
  0% {
    box-shadow: 0 0 0 0 var(--color-ai-highlight),
                inset 0 0 0 1px var(--color-primary);
    background: var(--color-ai-highlight);
  }
  100% {
    box-shadow: 0 0 0 0 transparent,
                inset 0 0 0 1px var(--border-default);
    background: transparent;
  }
}

/* 值填充时的打字效果容器 */
.field-filling {
  position: relative;
}

.field-filling::after {
  content: '|';
  animation: blink 0.7s infinite;
  color: var(--color-primary);
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

### 6.5 进度条动画

```css
/* 阶段进度条 */
.progress-bar {
  height: 4px;
  background: var(--bg-hover);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 2px;
  transition: width var(--duration-slow) var(--ease-out);
  position: relative;
}

/* 进度条光泽动画 */
.progress-bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

### 6.6 列表项依次入场

```css
/* 测试用例结果依次入场 */
.test-result-item {
  animation: slideInFade var(--duration-normal) var(--ease-out) backwards;
}

/* 根据 index 自动延迟 */
.test-result-item:nth-child(1) { animation-delay: 0ms; }
.test-result-item:nth-child(2) { animation-delay: 50ms; }
.test-result-item:nth-child(3) { animation-delay: 100ms; }
.test-result-item:nth-child(4) { animation-delay: 150ms; }
/* ... 可通过 CSS-in-JS 动态生成 */

@keyframes slideInFade {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

---

## Part 7: 核心组件设计

### 7.1 侧边导航

```css
/* 导航容器 */
.sidebar {
  display: flex;
  flex-direction: column;
  padding: var(--space-4) 0;
}

/* Logo 区域 */
.sidebar-header {
  padding: 0 var(--space-4) var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: var(--space-4);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

/* 导航组 */
.nav-group {
  margin-bottom: var(--space-4);
}

.nav-group-title {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 导航项 */
.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  margin: 0 var(--space-2);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--color-primary-muted);
  color: var(--color-primary);
}

.nav-item-icon {
  width: 18px;
  height: 18px;
  opacity: 0.7;
}

.nav-item.active .nav-item-icon {
  opacity: 1;
}
```

### 7.2 AI 聊天助手面板

```css
/* 聊天面板结构 */
.ai-assistant {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 面板头部 */
.assistant-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.assistant-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.assistant-status {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
}

/* 消息区域 */
.assistant-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* 用户消息 */
.message-user {
  align-self: flex-end;
  max-width: 85%;
  background: var(--color-primary);
  color: white;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-xl);
}

/* AI 消息 */
.message-ai {
  align-self: flex-start;
  max-width: 90%;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  padding: var(--space-4);
  border-radius: var(--radius-sm) var(--radius-xl) var(--radius-xl) var(--radius-xl);
}

/* 输入区域 */
.assistant-input {
  padding: var(--space-4);
  border-top: 1px solid var(--border-subtle);
}

.input-container {
  display: flex;
  gap: var(--space-2);
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-2);
  transition: border-color var(--duration-fast);
}

.input-container:focus-within {
  border-color: var(--color-primary);
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: var(--text-base);
  padding: var(--space-2);
}

.chat-input::placeholder {
  color: var(--text-tertiary);
}
```

### 7.3 AI 消息内的选项卡片

```css
/* 选项卡片组 */
.ai-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

/* 单个选项卡片 */
.ai-option-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--bg-overlay);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.ai-option-card:hover {
  border-color: var(--color-primary-border);
  background: var(--color-primary-muted);
}

.ai-option-card.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-muted);
}

/* 选项图标 */
.option-icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary);
  flex-shrink: 0;
}

/* 选项内容 */
.option-content {
  flex: 1;
}

.option-title {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.option-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}

/* 推荐标签 */
.option-badge {
  font-size: var(--text-xs);
  padding: 2px 6px;
  background: var(--color-primary-muted);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
  margin-left: var(--space-2);
}
```

### 7.4 AI 进度指示器

```css
/* 执行阶段卡片 */
.execution-stage {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-top: var(--space-3);
}

/* 阶段标题 */
.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.stage-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.stage-icon {
  font-size: var(--text-lg);
}

.stage-progress-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* 进度条 */
.stage-progress-bar {
  height: 6px;
  background: var(--bg-hover);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: var(--space-3);
}

.stage-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-ai-thinking));
  border-radius: 3px;
  transition: width var(--duration-slow) var(--ease-out);
}

/* 阶段任务列表 */
.stage-tasks {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.stage-task {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.stage-task.completed {
  color: var(--color-success);
}

.stage-task.active {
  color: var(--color-primary);
}

.task-icon {
  width: 14px;
  height: 14px;
}
```

### 7.5 配置表单

```css
/* 表单区块 */
.form-section {
  margin-bottom: var(--space-6);
}

.form-section-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--border-subtle);
}

.section-status-icon {
  width: 18px;
  height: 18px;
}

.section-status-icon.completed {
  color: var(--color-success);
}

/* 表单字段 */
.form-field {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.form-label .required {
  color: var(--color-error);
  margin-left: 2px;
}

/* 输入框 */
.form-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all var(--duration-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-muted);
}

.form-input::placeholder {
  color: var(--text-tertiary);
}

/* AI 填充状态 */
.form-input.ai-filling {
  border-color: var(--color-primary);
  background: var(--color-ai-highlight);
}

/* 下拉选择框 */
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* 下拉箭头 */
  background-repeat: no-repeat;
  background-position: right var(--space-3) center;
  padding-right: var(--space-8);
}

/* 文本域 */
.form-textarea {
  min-height: 120px;
  resize: vertical;
  line-height: var(--leading-relaxed);
}
```

### 7.6 代码编辑器 / Diff 对比

```css
/* 代码容器 */
.code-editor {
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* 编辑器头部 */
.code-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-4);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
}

.code-editor-title {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

/* 代码内容 */
.code-content {
  padding: var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.7;
  color: var(--text-primary);
  overflow-x: auto;
}

/* Diff 对比视图 */
.diff-view {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.diff-panel {
  border-right: 1px solid var(--border-subtle);
}

.diff-panel:last-child {
  border-right: none;
}

.diff-panel-header {
  padding: var(--space-2) var(--space-4);
  background: var(--bg-surface);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.diff-panel-header.old {
  color: var(--color-error);
}

.diff-panel-header.new {
  color: var(--color-success);
}

/* Diff 行 */
.diff-line {
  display: flex;
  padding: 0 var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.diff-line.added {
  background: var(--color-success-muted);
}

.diff-line.removed {
  background: var(--color-error-muted);
}

.diff-line-number {
  width: 40px;
  flex-shrink: 0;
  color: var(--text-tertiary);
  text-align: right;
  padding-right: var(--space-3);
  user-select: none;
}

.diff-line-content {
  flex: 1;
  white-space: pre;
}
```

### 7.7 测试结果列表

```css
/* 测试结果容器 */
.test-results {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* 结果头部 */
.test-results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  background: var(--bg-overlay);
  border-bottom: 1px solid var(--border-subtle);
}

.test-summary {
  display: flex;
  gap: var(--space-4);
}

.test-stat {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
}

.test-stat.passed {
  color: var(--color-success);
}

.test-stat.failed {
  color: var(--color-error);
}

/* 结果列表 */
.test-results-list {
  max-height: 400px;
  overflow-y: auto;
}

/* 单个结果项 */
.test-result-item {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
  transition: background var(--duration-fast);
}

.test-result-item:hover {
  background: var(--bg-hover);
}

.test-result-item:last-child {
  border-bottom: none;
}

/* 结果状态图标 */
.result-status {
  width: 20px;
  height: 20px;
  margin-right: var(--space-3);
  flex-shrink: 0;
}

.result-status.passed {
  color: var(--color-success);
}

.result-status.failed {
  color: var(--color-error);
}

/* 结果内容 */
.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: var(--text-base);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-detail {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

/* 比较变化标签 */
.result-change {
  font-size: var(--text-xs);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.result-change.fixed {
  background: var(--color-success-muted);
  color: var(--color-success);
}

.result-change.regression {
  background: var(--color-error-muted);
  color: var(--color-error);
}
```

---

## Part 8: 按钮系统

### 8.1 按钮层级

```css
/* 主要按钮 - 用于核心操作 */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--color-primary);
  color: white;
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-primary:active {
  transform: scale(0.98);
}

/* 次要按钮 - 用于可选操作 */
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: transparent;
  color: var(--text-primary);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.btn-secondary:hover {
  background: var(--bg-hover);
  border-color: var(--border-strong);
}

/* 幽灵按钮 - 用于辅助操作 */
.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.btn-ghost:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* 危险按钮 - 用于破坏性操作 */
.btn-danger {
  background: var(--color-error);
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

/* 按钮尺寸 */
.btn-sm {
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
}

.btn-lg {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-lg);
}

/* 按钮加载状态 */
.btn-loading {
  position: relative;
  color: transparent;
  pointer-events: none;
}

.btn-loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## Part 8.5: 配置界面组件（ChatGPT 风格）

### 8.5.1 设计理念

主工作区的配置界面采用 ChatGPT 风格的极简设计：
- **超扁平化**：几乎无阴影，极淡边框
- **纯净背景**：纯白背景，减少视觉噪音
- **Pill 形标签**：完全圆角的标签按钮
- **留白充足**：宽松的间距，不拥挤

### 8.5.2 表单输入框（极简风格）

```css
/* 配置表单输入框 - ChatGPT 风格 */
.config-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-default); /* 极淡边框 */
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all var(--duration-fast);
}

.config-input:focus {
  outline: none;
  border-color: var(--border-strong); /* 不用主色，保持克制 */
}

.config-input::placeholder {
  color: var(--text-placeholder);
}

/* 表单标签 */
.config-label {
  display: block;
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-bottom: var(--space-2);
  font-weight: var(--font-normal);
}
```

### 8.5.3 Pill 形标签按钮

```css
/* Pill 形标签 - ChatGPT 的特性标签风格 */
.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-pill); /* 完全圆角 */
  cursor: pointer;
  transition: all var(--duration-fast);
}

.tag-pill:hover {
  background: var(--bg-hover);
  border-color: var(--border-default);
}

.tag-pill.active {
  background: var(--color-primary-muted);
  color: var(--color-primary);
  border-color: var(--color-primary-border);
}

/* 带加号的标签 */
.tag-pill::before {
  content: '+';
  font-size: var(--text-base);
  color: var(--text-secondary);
}

.tag-pill.active::before {
  content: '✓';
  color: var(--color-primary);
}
```

### 8.5.4 能力卡片

```css
/* 能力开关卡片 - ChatGPT capabilities 风格 */
.capability-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.capability-card:hover {
  background: var(--bg-secondary);
}

.capability-card.enabled {
  border-color: var(--color-primary);
}

.capability-icon {
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
}

.capability-name {
  flex: 1;
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.capability-check {
  width: 18px;
  height: 18px;
  background: var(--color-primary);
  border-radius: 4px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.capability-card:not(.enabled) .capability-check {
  background: transparent;
  border: 1.5px solid var(--border-default);
}
```

### 8.5.5 分隔线

```css
/* 极淡分隔线 - ChatGPT 风格 */
.divider {
  height: 1px;
  background: var(--border-subtle);
  margin: var(--space-6) 0;
  border: none;
}

/* 带文字的分隔线 */
.divider-with-text {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin: var(--space-6) 0;
}

.divider-with-text::before,
.divider-with-text::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-subtle);
}

.divider-text {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  font-weight: var(--font-medium);
}
```

### 8.5.6 Toggle 开关

```css
/* Toggle 开关 - ChatGPT 风格 */
.toggle {
  position: relative;
  width: 44px;
  height: 24px;
  background: var(--bg-active);
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: background var(--duration-fast);
}

.toggle.on {
  background: var(--text-primary);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform var(--duration-fast);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.toggle.on .toggle-thumb {
  transform: translateX(20px);
}
```

---

## Part 9: 状态与反馈

### 9.1 空状态

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  text-align: center;
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  color: var(--text-tertiary);
  margin-bottom: var(--space-4);
}

.empty-state-title {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.empty-state-description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  max-width: 360px;
  margin-bottom: var(--space-6);
}
```

### 9.2 成功/完成状态

```css
/* 成功完成的视觉反馈 */
.completion-celebration {
  animation: celebrate var(--duration-slower) var(--ease-out);
}

@keyframes celebrate {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 完成状态卡片 */
.success-card {
  background: var(--color-success-muted);
  border: 1px solid var(--color-success);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.success-card-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.success-icon {
  width: 24px;
  height: 24px;
  color: var(--color-success);
}

.success-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-success);
}
```

### 9.3 Toast 提示

```css
.toast {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
  animation: toastIn var(--duration-normal) var(--ease-out);
  z-index: 1000;
}

@keyframes toastIn {
  from {
    transform: translateY(16px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.toast.success {
  border-left: 3px solid var(--color-success);
}

.toast.error {
  border-left: 3px solid var(--color-error);
}

.toast.info {
  border-left: 3px solid var(--color-info);
}
```

---

## Part 10: 响应式适配

### 10.1 断点定义

```css
/* 断点定义 */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### 10.2 响应式布局策略

```css
/* 小屏幕：AI 助手变为底部抽屉 */
@media (max-width: 1024px) {
  .app-layout {
    flex-direction: column;
  }
  
  .ai-assistant {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 60vh;
    max-height: 60vh;
    border-left: none;
    border-top: 1px solid var(--border-subtle);
    transform: translateY(calc(100% - 60px));
    transition: transform var(--duration-slow) var(--ease-out);
  }
  
  .ai-assistant.expanded {
    transform: translateY(0);
  }
  
  .sidebar {
    width: 60px;
    /* 只显示图标 */
  }
}

/* 超宽屏：限制最大宽度 */
@media (min-width: 1920px) {
  .main-workspace {
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

---

## Part 11: 实现优先级指南

### 11.1 Demo 必须实现的视觉效果

| 优先级 | 效果 | 实现复杂度 | 用户感知价值 |
|--------|------|-----------|-------------|
| P0 | 三区域基础布局 | 低 | 高 |
| P0 | AI 思考动画（脉冲点） | 低 | 高 |
| P0 | 打字机效果 | 中 | 很高 |
| P0 | 字段填充高亮 | 中 | 很高 |
| P0 | 进度条动画 | 低 | 高 |
| P1 | 列表项依次入场 | 低 | 中 |
| P1 | 可拖拽分隔线 | 中 | 中 |
| P1 | Diff 代码对比 | 中 | 高 |
| P2 | 成功庆祝动画 | 低 | 中 |
| P2 | Toast 提示 | 低 | 中 |

### 11.2 可以简化的部分

- 复杂表单验证 → 使用基础 HTML5 验证
- 复杂图表 → 使用简单的 CSS 进度条代替
- 完整键盘导航 → Demo 阶段可省略
- 完整无障碍支持 → Demo 阶段可省略

---

## Part 12: 最终检查清单

### 开发前确认

- [ ] 是否理解三区域布局的职责划分？
- [ ] 是否理解 AI 交互的核心动效？
- [ ] 是否理解色彩系统的使用规则？
- [ ] 是否理解组件的层级关系？

### 开发中检查

- [ ] AI 思考状态是否有明确的视觉反馈？
- [ ] 配置填充过程是否有高亮动画？
- [ ] 进度是否实时可见？
- [ ] 用户确认节点是否清晰？
- [ ] 成功/失败状态是否有明确区分？

### 开发后验证

- [ ] 看起来像真正的 AI 产品吗？
- [ ] 能让用户感受到 AI 正在工作吗？
- [ ] 预制数据的交互是否自然？
- [ ] 动效是否流畅不卡顿？
- [ ] 整体视觉是否专业、克制、高级？

---

## 附录：完整 CSS 变量清单

```css
:root {
  /* ===== 背景 ===== */
  --bg-base: #ffffff;
  --bg-elevated: #ffffff;
  --bg-surface: #ffffff;
  --bg-secondary: #fafafa;
  --bg-overlay: #ffffff;
  --bg-hover: #f5f5f5;
  --bg-active: #ebebeb;
  
  /* ===== 边框 ===== */
  --border-subtle: rgba(0, 0, 0, 0.04);
  --border-default: rgba(0, 0, 0, 0.06);
  --border-strong: rgba(0, 0, 0, 0.1);
  
  /* ===== 文字 ===== */
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --text-tertiary: #999999;
  --text-disabled: #c0c0c0;
  --text-placeholder: #a3a3a3;
  
  /* ===== 主色 ===== */
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-primary-muted: rgba(59, 130, 246, 0.1);
  --color-primary-border: rgba(59, 130, 246, 0.3);
  
  /* ===== 语义色 ===== */
  --color-success: #22c55e;
  --color-success-muted: rgba(34, 197, 94, 0.1);
  --color-warning: #eab308;
  --color-warning-muted: rgba(234, 179, 8, 0.1);
  --color-error: #ef4444;
  --color-error-muted: rgba(239, 68, 68, 0.1);
  --color-info: #3b82f6;
  --color-info-muted: rgba(59, 130, 246, 0.1);
  
  /* ===== AI 专属 ===== */
  --color-ai-thinking: #8b5cf6;
  --color-ai-executing: #3b82f6;
  --color-ai-success: #22c55e;
  --color-ai-highlight: rgba(59, 130, 246, 0.15);
  
  /* ===== 字体 ===== */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* ===== 字号 ===== */
  --text-xs: 0.75rem;
  --text-sm: 0.8125rem;
  --text-base: 0.875rem;
  --text-lg: 1rem;
  --text-xl: 1.125rem;
  --text-2xl: 1.25rem;
  
  /* ===== 字重 ===== */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  
  /* ===== 间距 ===== */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  
  /* ===== 圆角 ===== */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-pill: 999px;
  
  /* ===== 时长 ===== */
  --duration-instant: 50ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  --duration-slower: 600ms;
  --duration-typing: 30ms;
  --duration-highlight: 1000ms;
  
  /* ===== 缓动 ===== */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

*本指南专为 Agent Master Demo 定制。核心目标是让 AI 的能力可见、可信、可控，同时保持专业克制的视觉风格。*
