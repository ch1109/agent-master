import { OptionItem } from '@/components/ai-chat/types'

export const visualStyleOptions: OptionItem[] = [
  { id: 'anime', label: '二次元动漫', description: '日系/韩系/国漫', icon: '🎨' },
  { id: 'render3d', label: '3D 渲染', description: '皮克斯/游戏建模', icon: '🎮' },
  { id: 'photo', label: '写实照片', description: '超现实/拟真', icon: '📷' },
  { id: 'cyber', label: '赛博朋克', description: '霓虹/科技感', icon: '🌃' },
  { id: 'illustration', label: '手绘插画', description: '水彩/厚涂/线稿', icon: '🖌️' },
  { id: 'pixel', label: '像素艺术', description: '8bit/16bit', icon: '👾' },
]

export const characterFormOptions: OptionItem[] = [
  { id: 'pet', label: '萌宠动物', description: '猫咪/狗狗/小动物', icon: '🐱' },
  { id: 'humanoid', label: '人形伙伴', description: '人类/动漫/精灵', icon: '🧑' },
  { id: 'robot', label: '机械科技', description: '机器人/悬浮球体', icon: '🤖' },
  { id: 'fantasy', label: '魔法幻想', description: '龙族/精灵/神秘生物', icon: '🧚' },
  { id: 'pixel-retro', label: '像素复古', description: '8bit/16bit 角色', icon: '👾' },
  { id: 'abstract', label: '抽象创意', description: '几何/拟人/星球', icon: '🔮' },
  { id: 'classic-ip', label: '经典 IP', description: '宝可梦/三丽鸥等', icon: '⭐' },
]

export const bodyProportionOptions: OptionItem[] = [
  { id: 'chibi', label: 'Q 版/二头身', description: '大头小身，极度可爱', icon: '🥰' },
  { id: 'teen', label: '少年/少女感', description: '修长活力', icon: '✨' },
  { id: 'standard', label: '成年/标准比例', description: '稳重专业', icon: '👔' },
  { id: 'bulky', label: '壮硕/夸张', description: '力量感强', icon: '💪' },
  { id: 'tiny', label: '微缩/精灵体', description: '悬浮/精灵气质', icon: '🧚' },
]

export const actionPackages = {
  work: ['打字', '书写', '思考', '阅读'],
  idle: ['站立', '悬浮', '睡眠'],
  active: ['跑跳', '飞行', '舞蹈'],
  interact: ['挥手', '点头', '庆祝', '拥抱'],
}

export const toolOptions: OptionItem[] = [
  {
    id: 'web_search',
    label: '网络搜索',
    description: '查找最新信息和教程',
    icon: '🔍',
    recommended: true,
  },
  {
    id: 'code_execution',
    label: '代码执行',
    description: '运行和调试代码',
    icon: '💻',
    recommended: true,
  },
  {
    id: 'document_generation',
    label: '文档生成',
    description: '生成报告/文档/手册',
    icon: '📝',
    recommended: true,
  },
  {
    id: 'flow_chart',
    label: '流程图生成',
    description: '可视化工作流结构',
    icon: '📊',
    recommended: true,
  },
  {
    id: 'image_processing',
    label: '图像处理',
    description: '识别和编辑图片',
    icon: '🖼️',
    recommended: false,
  },
  {
    id: 'file_processing',
    label: '文件处理',
    description: '读取和解析文件',
    icon: '📁',
    recommended: false,
  },
  {
    id: 'api_testing',
    label: 'API 测试',
    description: '接口连通性调试',
    icon: '🔌',
    recommended: false,
  },
]

export const permissionOptions: OptionItem[] = [
  {
    id: 'L1',
    label: 'L1 实习生模式',
    description: '只读不写，所有动作需审批',
    icon: '🎓',
    features: ['只读权限', '全部需审批', '无主动发起权'],
  },
  {
    id: 'L2',
    label: 'L2 助理模式',
    description: '低风险自动执行，高风险需审批',
    icon: '👔',
    features: ['低风险自动', '高风险审批', '可写入记忆'],
    recommended: true,
  },
  {
    id: 'L3',
    label: 'L3 自动驾驶',
    description: '全自动执行，主动发起会话',
    icon: '🚀',
    features: ['全自动执行', '主动发起会话', '调用其他 Agent'],
  },
]

export const memoryOptions: OptionItem[] = [
  { id: 'disabled', label: '暂不开启', icon: '⏸️', description: '不保留对话记忆' },
  { id: '3months', label: '开启 + 3个月', icon: '📅', description: '保留 90 天记忆' },
  { id: '6months', label: '开启 + 6个月', icon: '📆', description: '保留 180 天记忆', recommended: true },
  { id: 'permanent', label: '开启 + 永久保留', icon: '♾️', description: '永久保留记忆' },
]

export const optimizationOptions: OptionItem[] = [
  { id: 'disabled', label: '暂不开启', icon: '⏸️', description: '不进行自动优化' },
  { id: 'manual', label: '需确认后应用', icon: '👆', description: '优化建议需要确认' },
  { id: 'auto', label: '自动应用', icon: '⚡', description: '自动学习和优化', recommended: true },
]

export const scenarioOptions: OptionItem[] = [
  {
    id: 'desktop_pet',
    label: '桌面宠物',
    icon: '🖥️',
    description: '常驻桌面，随时呼出',
    platforms: ['Windows', 'Mac'],
  },
  {
    id: 'platform_mascot',
    label: 'Agent Master 平台形象',
    icon: '🎨',
    description: '作为平台内的虚拟形象',
    platforms: ['网页端', '移动端'],
  },
  {
    id: 'feishu_integration',
    label: '导入飞书',
    icon: '💬',
    description: '集成到飞书工作台',
    platforms: ['飞书应用', '机器人'],
  },
  {
    id: 'sdk_integration',
    label: 'SDK 集成',
    icon: '🔧',
    description: '提供 API 接口集成',
    platforms: ['REST API', 'WebSocket'],
  },
]

export const placeholderImages = [
  {
    id: 'preset_1',
    name: '图1 - 科技蓝版',
    gradient: 'from-blue-500 via-cyan-400 to-sky-300',
    description: '科技蓝配色，屏幕头部，双天线',
  },
  {
    id: 'preset_2',
    name: '图2 - 暖橙版',
    gradient: 'from-orange-500 via-amber-400 to-yellow-300',
    description: '暖橙色系，圆润造型，发光效果',
  },
  {
    id: 'preset_3',
    name: '图3 - 渐变版',
    gradient: 'from-amber-400 via-pink-400 to-indigo-400',
    description: '橙蓝渐变，品牌标识位明显',
  },
  {
    id: 'preset_4',
    name: '图4 - 极简版',
    gradient: 'from-slate-700 via-slate-500 to-slate-300',
    description: '极简设计，Q版萌系，完美融合',
  },
]

export const generationModels = {
  image: ['即梦 4.0', 'FLUX.1 [dev]', 'Z-Image-Turbo', 'Stable Diffusion 3.5'],
  video: ['Wan 2.2', '可灵 2.5 tubro'],
}

// 记忆功能对比示例
export const memoryExamples = {
  withoutMemory: {
    user: '上次那个webhook配置，还是不懂',
    agent: '请问你说的是什么配置？',
  },
  withMemory: {
    user: '上次那个webhook配置，还是不懂',
    agent: '你说的是「飞书转发微信」那个流程吧？是鉴权不懂还是数据格式？',
  },
}

// 自优化能力列表
export const optimizationCapabilities = [
  { icon: '🎯', text: '发现用户喜好并调整回应风格' },
  { icon: '📚', text: '从错误中学习改进' },
  { icon: '🎓', text: '优化教学方式和节奏' },
  { icon: '💡', text: '主动提供个性化建议' },
]
