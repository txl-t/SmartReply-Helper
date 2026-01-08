// 场景类型
export type SceneType = 'work' | 'emotion' | 'social' | 'all'

// 回复风格
export type ReplyStyle = 'formal' | 'friendly' | 'humorous'

// 回复强度
export type ReplyIntensity = 'gentle' | 'moderate' | 'direct'

// 关系类型
export type RelationType = 'superior' | 'peer' | 'subordinate'

// 回复项
export interface ReplyItem {
  id: string
  style: ReplyStyle
  content: string
}

// 历史记录项
export interface HistoryItem {
  id: string
  input: string
  scene: SceneType
  replies: ReplyItem[]
  timestamp: number
  isFavorite: boolean
}

// 快捷标签
export interface QuickTag {
  id: string
  label: string
  scene: SceneType
  prompt: string
}

// 每日推荐
export interface DailyRecommendation {
  id: string
  title: string
  content: string
  scene: SceneType
}

// 场景标签配置
export const SCENE_LABELS: Record<SceneType, string> = {
  work: '职场',
  emotion: '情感',
  social: '社交',
  all: '全部'
}

// 场景颜色配置 - 使用莫兰迪辅色系统
export const SCENE_COLORS: Record<SceneType, string> = {
  work: 'text-primary', // 云雾蓝 - 职场
  emotion: 'text-apricot', // 杏花粉 - 情感
  social: 'text-sage', // 青草绿 - 社交
  all: 'text-muted-foreground'
}

// 场景背景颜色配置
export const SCENE_BG_COLORS: Record<SceneType, string> = {
  work: 'bg-gradient-primary', // 云雾蓝渐变
  emotion: 'bg-gradient-apricot', // 杏花粉渐变
  social: 'bg-gradient-sage', // 青草绿渐变
  all: 'bg-secondary'
}

// 回复风格标签
export const STYLE_LABELS: Record<ReplyStyle, string> = {
  formal: '正式',
  friendly: '友好',
  humorous: '幽默'
}
