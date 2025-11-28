/**
 * 提示词优化相关的预制数据
 */

// 提示词列表
export const mockPrompts = [
  { 
    id: '1', 
    name: '查询余额意图', 
    intent: '查询账户余额', 
    version: 'v1.3', 
    passRate: 92, 
    badcaseCount: 5, 
    updatedAt: '2024-01-15',
    status: 'published' as const,
  },
  { 
    id: '2', 
    name: '转账意图', 
    intent: '转账汇款', 
    version: 'v2.1', 
    passRate: 88, 
    badcaseCount: 12, 
    updatedAt: '2024-01-14',
    status: 'published' as const,
  },
  { 
    id: '3', 
    name: '贷款咨询意图', 
    intent: '咨询贷款产品', 
    version: 'v1.0', 
    passRate: 75, 
    badcaseCount: 23, 
    updatedAt: '2024-01-13',
    status: 'draft' as const,
  },
  { 
    id: '4', 
    name: '投诉处理意图', 
    intent: '投诉建议', 
    version: 'v1.5', 
    passRate: 95, 
    badcaseCount: 3, 
    updatedAt: '2024-01-12',
    status: 'published' as const,
  },
]

// Badcase 列表
export const mockBadcases = [
  {
    id: 'bc1',
    userInput: '我要看看上个月花了多少钱',
    expectedOutput: '调用账单查询接口，展示上月消费明细',
    actualOutput: '抱歉，我不太理解您的意思，请问您是要查询余额吗？',
    category: '意图识别错误',
    severity: 'high' as const,
  },
  {
    id: 'bc2',
    userInput: '帮我转500给老王',
    expectedOutput: '确认转账金额500元，询问收款人信息',
    actualOutput: '请问您要转账多少钱？',
    category: '参数提取遗漏',
    severity: 'medium' as const,
  },
  {
    id: 'bc3',
    userInput: '余额不够了怎么办',
    expectedOutput: '提供充值入口或理财建议',
    actualOutput: '您的账户余额为xxx元',
    category: '回复不完整',
    severity: 'low' as const,
  },
]

// 测试用例
export const mockTestCases = [
  { id: 't1', input: '查一下余额', expected: '触发余额查询意图', status: 'passed' as const },
  { id: 't2', input: '我想看看账户里还有多少钱', expected: '触发余额查询意图', status: 'passed' as const },
  { id: 't3', input: '余额多少', expected: '触发余额查询意图', status: 'passed' as const },
  { id: 't4', input: '钱还够吗', expected: '触发余额查询意图', status: 'failed' as const },
  { id: 't5', input: '账户有钱没', expected: '触发余额查询意图', status: 'passed' as const },
]

// 优化前后的提示词对比
export const promptDiff = {
  oldPrompt: `你是一个银行智能助手，帮助用户查询账户信息。

## 任务
识别用户查询余额的意图，调用接口返回余额信息。

## 回复要求
- 简洁明了
- 包含具体金额`,
  
  newPrompt: `你是一个专业的银行智能助手，帮助用户查询账户信息。

## 角色定位
- 身份：银行客服专员
- 风格：专业、耐心、友好

## 核心任务
1. 识别用户查询余额的意图
2. 支持多种表达方式（余额、还有多少钱、账户情况等）
3. 调用接口返回余额信息

## 回复要求
- 简洁明了，包含具体金额
- 金额超过10000元时，提示理财建议
- 余额不足时，提供充值入口

## 特殊处理
- 用户表达不清时，主动确认意图
- 涉及敏感信息时，提示安全须知`,
}

// AI 对话脚本 - 场景C（提示词优化）
// 严格按照产品需求文档实现
export const promptOptimizeScript = [
  {
    // 【第1轮】分析结果与优化方式选择
    response: {
      type: 'text' as const,
      text: `小渝收到！我来帮您优化提示词~

📊 我先看了下当前的情况：

当前版本: v2.3
最近更新: 2025-01-15
当前通过率: 85.2% (⚠️ 低于目标90%)
待修复Badcase: 23个

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 您想要怎么优化呢？`,
      options: [
        {
          id: 'badcase',
          label: '1️⃣ 修复具体的Badcase（问题驱动）',
          description: '适合：发现了明确的问题案例\n我会针对性地分析和修复',
          selected: true
        },
        {
          id: 'scan',
          label: '2️⃣ 让AI自动诊断优化（系统扫描）',
          description: '适合：想全面提升提示词质量\n我会扫描潜在问题并优化',
          selected: false
        },
        {
          id: 'feature',
          label: '3️⃣ 根据新需求优化（功能增强）',
          description: '适合：要新增功能或调整策略\n我会根据您的需求生成优化方案',
          selected: false
        },
      ],
      actions: [
        { id: 'confirm', label: '确认选择', variant: 'primary' as const },
      ],
    },
    delay: 1500,
    thinkingText: '整理分析结果',
  },
  {
    // 【第2轮】问题深度诊断与根因分析
    response: {
      type: 'text' as const,
      text: `🔍 正在分析Badcase #0127...

✅ 对话记录已加载
✅ 上下文信息已提取
✅ 提示词执行日志已分析
🤖 正在诊断根本原因...`,
    },
    delay: 3000,
    thinkingText: '诊断问题中',
  },
  {
    // 【第2轮续】诊断报告
    response: {
      type: 'text' as const,
      text: `好的，我仔细分析了这个Badcase~

🐛 问题案例: Badcase #0127
发生时间: 2025-01-14 10:23
问题类型: 业务歧义识别失败

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 当时的对话：

👤 用户说: "我要修改密码"

🤖 AI回复: "小渝收到，马上为您跳转办理修改密码业务" (action: VChangePassword)

😕 结果: 用户点了返回，说进入了错误页面

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 问题根因：

我发现了核心问题！提示词里的"业务歧义检测"规则放的位置不对 ❌

• 现在的流程：
  用户说"修改密码"
  → Step1第二步直接匹配到"修改密码"业务
  → 立即跳转 VChangePassword
  → 歧义检测规则根本没执行到！

• 问题在于：
  business_info里其实有2个"修改密码"：
  ① 账户管理 > 修改密码 (VChangePassword)
  ② 信用卡业务 > 修改查询密码 (VChangeInqPassword)

  但是歧义检测规则在Step1之后，永远执行不到！

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 影响范围：

这个问题会影响所有类似的歧义业务：
• "修改密码"相关的3个场景 ⚠️
• "重置密码"等相关场景
• 其他可能存在歧义的8个业务

严重程度: 🔴 高（影响核心交互逻辑）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 我已经想好怎么修复了：

🔧 修复方案：

1. 调整规则执行顺序（最关键）
   • 把"业务歧义检测"移到最前面
   • 在任何业务匹配之前强制执行
   • 这样"修改密码"就会被检测到有2个匹配

2. 增强歧义词库
   • 明确标注"修改密码"的2个业务
   • 补充更多歧义案例

3. 补充示例对话
   • 添加"修改密码"的正确处理示例
   • 让AI学会区分和确认

预计效果：
✓ 完全解决"修改密码"歧义问题
✓ 覆盖所有类似场景
✓ 预计通过率提升5-8%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

我要开始优化吗？
（回复"开始"或"确认"我就帮您执行~）`,
      actions: [
        { id: 'start', label: '开始优化', variant: 'primary' as const },
        { id: 'detail', label: '查看更多细节', variant: 'secondary' as const },
        { id: 'modify', label: '调整方案', variant: 'ghost' as const },
      ],
    },
    delay: 2000,
    thinkingText: '生成诊断报告',
  },
  {
    // 【第3轮】优化方案确认与测试准备
    response: {
      type: 'text' as const,
      text: `🛠️ 收到！我开始优化~

正在生成优化方案...`,
    },
    delay: 1000,
    thinkingText: '生成优化方案',
  },
  {
    // 【第3轮续】方案预览
    response: {
      type: 'text' as const,
      text: `✅ 优化方案已生成！

📝 我会这样修改提示词：

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 修改位置: 提示词第230-280行

🔴 修改前：
  Step1: 业务意图识别
    • 第一步-跳转确认
    • 第二步-完整业务名检测 ← 这里会匹配"修改密码"
    ...
  【上下文感知】
    3. 业务歧义强制检测 ← 执行不到！

🟢 修改后：
  【上下文感知】
    3. 业务歧义强制检测 ← 提到最前面！
       (在任何匹配前强制执行)
  Step1: 业务意图识别
    • 第一步-跳转确认
    • 第二步-完整业务名检测
    ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 修改统计：
• 新增: 15行
• 删除: 3行
• 修改: 8行

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 接下来我要测试验证：

阶段1: 基准测试（当前版本v2.3）
• 用24个测试用例跑一遍
• 看看现在的通过率
• 预计2分钟

阶段2: 回归测试（优化后v2.4）
• 用新提示词再跑一遍
• 验证是否修复了问题
• 预计2分钟

阶段3: 对比分析
• 看看通过率提升了多少
• 确认没有新的问题
• 生成完整报告

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 测试配置：
• 测试用例: 24个（含Badcase + 密码相关场景）
• 测试模型: claude-sonnet-4-20250514
• 测试策略: 严格匹配

总耗时: 约4-5分钟

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ 注意：
测试会在模拟环境进行，不影响生产~
测试过程中，结果会实时显示在中间区域

我现在开始测试吗？
（回复"开始测试"我就执行~）`,
      actions: [
        { id: 'test', label: '开始测试', variant: 'primary' as const },
        { id: 'viewDiff', label: '查看完整Diff', variant: 'secondary' as const },
        { id: 'cancel', label: '取消', variant: 'ghost' as const },
      ],
    },
    delay: 1500,
    thinkingText: '整理优化方案',
  },
  {
    // 【第4轮】执行测试与实时反馈 - 阶段1
    response: {
      type: 'text' as const,
      text: `🚀 收到！开始执行测试~

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 阶段1/3: 基准测试 (v2.3)`,
      stages: [
        { id: '1', label: '基准测试 (v2.3)', status: 'running' as const, description: '进度: 12/24 完成\n✅ 通过: 7个 | ❌ 失败: 5个\n⏳ 测试中: 用例#13' },
        { id: '2', label: '回归测试 (v2.4)', status: 'pending' as const },
        { id: '3', label: '对比分析', status: 'pending' as const },
      ],
    },
    delay: 3000,
    thinkingText: '执行基准测试',
  },
  {
    // 【第4轮续】阶段1完成，开始阶段2
    response: {
      type: 'text' as const,
      text: `✅ 阶段1/3: 基准测试完成！

📊 测试结果：

版本: v2.3（优化前）
通过: 16/24 (66.7%)
失败: 8/24 (33.3%)

失败案例：
• 歧义识别失败: 5个 ← 核心问题
• 上下文理解错误: 2个
• 其他: 1个

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 开始阶段2: 回归测试 (v2.4)

现在用优化后的提示词重新测试...`,
      stages: [
        { id: '1', label: '基准测试 (v2.3)', status: 'completed' as const, description: '通过: 16/24 (66.7%)' },
        { id: '2', label: '回归测试 (v2.4)', status: 'running' as const, description: '进度: 8/24 完成\n✅ 通过: 7个 (↑比基准+3个!)\n❌ 失败: 1个 (↓比基准-4个!)' },
        { id: '3', label: '对比分析', status: 'pending' as const },
      ],
    },
    delay: 4000,
    thinkingText: '执行回归测试',
  },
  {
    // 【第4轮续】阶段2完成，开始阶段3
    response: {
      type: 'text' as const,
      text: `✅ 阶段2/3: 回归测试完成！

📊 测试结果：

版本: v2.4（优化后）
通过: 22/24 (91.7%)
失败: 2/24 (8.3%)

🎉 太棒了！
• 通过率提升: 66.7% → 91.7% (+25%)
• 成功修复: 6个用例
• 无回归问题！

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 开始阶段3: 对比分析

正在生成详细报告...`,
      stages: [
        { id: '1', label: '基准测试 (v2.3)', status: 'completed' as const, description: '通过: 16/24 (66.7%)' },
        { id: '2', label: '回归测试 (v2.4)', status: 'completed' as const, description: '通过: 22/24 (91.7%) ✅' },
        { id: '3', label: '对比分析', status: 'running' as const, description: '正在生成报告...' },
      ],
    },
    delay: 2000,
    thinkingText: '生成对比报告',
  },
  {
    // 【第5轮】对比分析与优化总结
    response: {
      type: 'text' as const,
      text: `🎉 测试全部完成！给您看看效果~

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 整体表现对比

             优化前(v2.3)  优化后(v2.4)  变化
─────────────────────────────────────────
通过率        66.7%        91.7%      +25.0% ✅
通过数        16个         22个       +6个 ✅
失败数        8个          2个        -6个 ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ 修复效果

✅ 成功修复了6个用例：

1. "我要修改密码" → 完美修复！✅
   现在会列出两种密码选项让用户选

2. "修改信用卡密码" → 完美修复！✅
   现在正确识别为完整业务名，直接跳转

3. "我想改个密码" → 完美修复！✅
   现在触发歧义检测，列出选项

4. "密码忘了" → 完美修复！✅
   现在会列出修改/重置选项

5. "重置密码" → 完美修复！✅
   现在会确认"您是要重置查询密码吗？"

6. "帮我搞一下密码" → 完美修复！✅
   现在能理解并列出密码相关选项

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ 仍需优化(2个)：

• "查积分还要查交易" - 多需求拦截问题
• "上次说的那个业务" - 上下文记忆问题

（这2个不在本次修复范围，可以后续优化）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 回归检测

✅ 完美！无回归问题

所有原本通过的16个用例，在新版本中都还是通过的！
没有引入任何新问题~

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 成本分析

响应时间: +0.1秒 (1.2s → 1.3s)
• 增加了歧义检测步骤
• 影响很小，完全可接受 ✅

Token消耗: +23 tokens (245 → 268)
• 提示词长度略增
• 成本增加不到10%，值得！✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 综合评估

⭐⭐⭐⭐⭐ 优化效果：非常好！

✓ 通过率从66.7%提升到91.7%，超过目标90%
✓ 核心问题完全修复
✓ 无回归问题
✓ 成本增加可接受
✓ 显著提升用户体验

💡 建议：可以发布到生产环境~

完整的测试报告已经同步到中间区域了，
您可以看看详细的对比数据和代码变更~

您要保存这个优化版本吗？
（回复"保存"或"发布"都可以~）`,
      actions: [
        { id: 'publish', label: '保存并发布', variant: 'primary' as const },
        { id: 'viewReport', label: '查看详细报告', variant: 'secondary' as const },
        { id: 'cancel', label: '放弃更改', variant: 'ghost' as const },
      ],
    },
    delay: 500,
    thinkingText: '整理分析结果',
  },
  {
    // 【第6轮】版本保存与后续建议
    response: {
      type: 'text' as const,
      text: `🚀 好的！我来帮您保存和发布~

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 需要您填写一些版本信息：

版本号: v2.4 [已自动生成]

版本名称: (请输入)
建议: "修复密码业务歧义识别问题"

您想用建议的名称吗？
（直接回复"确认"使用建议，或输入自定义名称）`,
      actions: [
        { id: 'confirmName', label: '确认使用建议名称', variant: 'primary' as const },
        { id: 'customName', label: '自定义名称', variant: 'secondary' as const },
      ],
    },
    delay: 1500,
    thinkingText: '准备发布',
  },
  {
    // 【第6轮续】发布完成
    response: {
      type: 'text' as const,
      text: `🎉 发布成功！新版本已上线~

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 发布详情：

• 版本号: v2.4
• 版本名称: 修复密码业务歧义识别问题
• 发布时间: 2025-01-16 14:38:22
• 发布策略: 灰度发布(10%→100%)
• 当前状态: ✅ 已发布到10%流量

预计24小时后自动全量发布~

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 您可以：

• 查看实时监控数据
• 手动扩大灰度流量
• 如有问题可以紧急回滚

完整的版本信息已经保存在中间区域了~

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 后续建议：

🔍 继续优化其他问题
  还有2个失败用例可以优化哦~
  （多需求拦截 + 上下文记忆）
  要不要我继续帮您优化？

📝 补充测试用例
  当前测试覆盖率72%，建议补充一些
  边缘场景的测试用例

📊 查看优化历史
  看看提示词的版本演进和通过率变化趋势

您还需要什么帮助吗？
（可以说"继续优化"/"查看历史"/"暂时不用"~）`,
      options: [
        {
          id: 'continue',
          label: '🔍 继续优化其他问题',
          description: '修复剩余的2个失败用例',
          selected: false
        },
        {
          id: 'addTest',
          label: '📝 补充测试用例',
          description: '提高测试覆盖率',
          selected: false
        },
        {
          id: 'history',
          label: '📊 查看优化历史',
          description: '版本演进和通过率趋势',
          selected: false
        },
      ],
      actions: [
        { id: 'continueOptimize', label: '继续优化', variant: 'primary' as const },
        { id: 'viewMonitor', label: '查看监控', variant: 'secondary' as const },
        { id: 'done', label: '暂时不用', variant: 'ghost' as const },
      ],
    },
    delay: 500,
    thinkingText: '完成发布',
  },
]

