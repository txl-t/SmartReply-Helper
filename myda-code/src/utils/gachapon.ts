// 扭蛋机建议模板数据

export type SuggestionStyle = 'serious' | 'humorous' | 'empathetic' | 'master'

export interface SuggestionTemplate {
  id: string
  style: SuggestionStyle
  title: string
  icon: string
  color: string // HSL格式
  content: string[]
}

// 三种基础风格模板
export const suggestionTemplates: SuggestionTemplate[] = [
  {
    id: 'serious',
    style: 'serious',
    title: '万能建议模板·严肃版',
    icon: '📊',
    color: '205 40% 75%', // 云雾蓝（主色）
    content: [
      '尊敬的团队，关于[具体问题]，我有以下建议：',
      '1. 现状分析：[客观描述当前情况]',
      '2. 改进方案：[提出具体可行的解决方案]',
      '3. 预期效果：[说明改进后的预期成果]',
      '期待您的反馈，谢谢！'
    ]
  },
  {
    id: 'humorous',
    style: 'humorous',
    title: '万能建议模板·幽默版',
    icon: '😄',
    color: '28 60% 85%', // 杏花粉（辅色）
    content: [
      '嘿～发现了一个小bug，不过别担心，咱们一起搞定它！',
      '问题是这样的：[用轻松的语气描述问题]',
      '我有个小妙招：[提出建议，加点俏皮话]',
      '试试看？说不定会有惊喜哦！',
      '有问题随时找我，咱们一起加油💪'
    ]
  },
  {
    id: 'empathetic',
    style: 'empathetic',
    title: '万能建议模板·共情版',
    icon: '❤️',
    color: '270 25% 77%', // 薄雾紫（辅色）
    content: [
      '我理解大家最近都很辛苦，关于[问题]想和大家聊聊。',
      '我注意到：[从对方角度描述观察到的情况]',
      '或许我们可以：[温和地提出建议]',
      '这样做的好处是：[说明对大家的帮助]',
      '感谢大家的付出，一起努力让事情变得更好！'
    ]
  }
]

// 金色大师级模板（融合三种风格）
export const masterTemplate: SuggestionTemplate = {
  id: 'master',
  style: 'master',
  title: '万能建议模板·大师级',
  icon: '✨',
  color: '35 45% 72%', // 晨光金（强调色）
  content: [
    '【专业分析】关于[具体问题]，我进行了全面思考：',
    '现状：[客观描述] + 我理解这对大家的影响',
    '建议：[具体方案] + 这样做会让工作更轻松',
    '效果：[预期成果] + 相信我们能做得更好',
    '期待与大家一起创造更好的成果！💪✨'
  ]
}

// 获取随机模板（用于扭蛋掉落）
export function getRandomTemplate(excludeGolden = true): SuggestionTemplate {
  const templates = excludeGolden ? suggestionTemplates : [...suggestionTemplates, masterTemplate]
  const randomIndex = Math.floor(Math.random() * templates.length)
  return templates[randomIndex]
}

// 根据风格获取模板
export function getTemplateByStyle(style: SuggestionStyle): SuggestionTemplate | undefined {
  if (style === 'master') {
    return masterTemplate
  }
  return suggestionTemplates.find((t) => t.style === style)
}

// 获取扭蛋颜色（用于视觉展示）
export function getCapsuleColor(style: SuggestionStyle): string {
  const template = style === 'master' ? masterTemplate : suggestionTemplates.find((t) => t.style === style)
  return template ? template.color : '0 0% 50%'
}
