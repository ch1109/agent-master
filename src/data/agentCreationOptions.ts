import { OptionItem } from '@/components/ai-chat/types'

export const visualStyleOptions: OptionItem[] = [
  { id: 'anime', label: '二次元动漫', description: '日系/韩系/国漫' },
  { id: 'render3d', label: '3D 渲染', description: '皮克斯/游戏建模' },
  { id: 'photo', label: '写实照片', description: '超现实/拟真' },
  { id: 'cyber', label: '赛博朋克', description: '霓虹/科技感' },
  { id: 'illustration', label: '手绘插画', description: '水彩/厚涂/线稿' },
  { id: 'pixel', label: '像素艺术', description: '8bit/16bit' },
]

export const characterFormOptions: OptionItem[] = [
  { id: 'pet', label: '萌宠动物', description: '猫咪/狗狗/小动物' },
  { id: 'humanoid', label: '人形伙伴', description: '人类/动漫/精灵' },
  { id: 'robot', label: '机械科技', description: '机器人/悬浮球体' },
  { id: 'fantasy', label: '魔法幻想', description: '龙族/精灵/神秘生物' },
  { id: 'pixel-retro', label: '像素复古', description: '8bit/16bit 角色' },
  { id: 'abstract', label: '抽象创意', description: '几何/拟人/星球' },
  { id: 'classic-ip', label: '经典 IP', description: '宝可梦/三丽鸥等' },
]

export const bodyProportionOptions: OptionItem[] = [
  { id: 'chibi', label: 'Q 版/二头身', description: '大头小身，极度可爱' },
  { id: 'teen', label: '少年/少女感', description: '修长活力' },
  { id: 'standard', label: '成年/标准比例', description: '稳重专业' },
  { id: 'bulky', label: '壮硕/夸张', description: '力量感强' },
  { id: 'tiny', label: '微缩/精灵体', description: '悬浮/精灵气质' },
]

export const actionPackages = {
  work: ['打字', '书写', '思考', '阅读'],
  idle: ['站立', '悬浮', '睡眠'],
  active: ['跑跳', '飞行', '舞蹈'],
  interact: ['挥手', '点头', '庆祝', '拥抱'],
}

export const toolOptions: OptionItem[] = [
  { id: 'web_search', label: '网络搜索', description: '查找最新信息' },
  { id: 'code_execution', label: '代码执行', description: '运行/调试代码' },
  { id: 'document_generation', label: '文档生成', description: '生成文档/手册' },
  { id: 'flow_chart', label: '流程图生成', description: '可视化工作流' },
  { id: 'image_processing', label: '图像处理', description: '识别/编辑图片' },
  { id: 'file_processing', label: '文件处理', description: '解析文件' },
  { id: 'api_testing', label: 'API 测试', description: '连通性调试' },
]

export const permissionOptions: OptionItem[] = [
  { id: 'L1', label: 'L1 实习生模式', description: '只读，全部需审批' },
  { id: 'L2', label: 'L2 助理模式', description: '低风险自动，高风险审批' },
  { id: 'L3', label: 'L3 自动驾驶', description: '全自动执行' },
]

export const memoryOptions: OptionItem[] = [
  { id: 'disabled', label: '暂不开启' },
  { id: '3months', label: '开启 + 3个月' },
  { id: '6months', label: '开启 + 6个月' },
  { id: 'permanent', label: '开启 + 永久保留' },
]

export const optimizationOptions: OptionItem[] = [
  { id: 'disabled', label: '暂不开启' },
  { id: 'manual', label: '开启（需确认后应用）' },
  { id: 'auto', label: '开启（自动应用）' },
]

export const scenarioOptions: OptionItem[] = [
  { id: 'desktop_pet', label: '桌面宠物' },
  { id: 'platform_mascot', label: 'Agent Master 平台形象' },
  { id: 'feishu_integration', label: '导入飞书' },
  { id: 'sdk_integration', label: 'SDK 集成' },
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
