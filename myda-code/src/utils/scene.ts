import type {QuickTag, SceneType} from '../types/reply'

/**
 * 识别场景类型
 */
export function detectScene(input: string): SceneType {
  const workKeywords = [
    '领导',
    '上级',
    '同事',
    '会议',
    '汇报',
    '工作',
    '项目',
    '任务',
    '批评',
    '表扬',
    '加班',
    '请假',
    '辞职',
    '面试'
  ]
  const emotionKeywords = [
    '朋友',
    '爱',
    '喜欢',
    '难过',
    '开心',
    '安慰',
    '表白',
    '分手',
    '恋爱',
    '感情',
    '心情',
    '伤心',
    '快乐'
  ]
  const socialKeywords = ['群聊', '聚会', '邀请', '拒绝', '感谢', '道歉', '祝福', '问候', '闲聊', '活跃', '礼貌']

  let workScore = 0
  let emotionScore = 0
  let socialScore = 0

  workKeywords.forEach((keyword) => {
    if (input.includes(keyword)) workScore++
  })

  emotionKeywords.forEach((keyword) => {
    if (input.includes(keyword)) emotionScore++
  })

  socialKeywords.forEach((keyword) => {
    if (input.includes(keyword)) socialScore++
  })

  if (workScore > emotionScore && workScore > socialScore) {
    return 'work'
  }
  if (emotionScore > workScore && emotionScore > socialScore) {
    return 'emotion'
  }
  if (socialScore > 0) {
    return 'social'
  }

  // 默认返回社交场景
  return 'social'
}

/**
 * 获取快捷标签列表
 */
export function getQuickTags(): QuickTag[] {
  return [
    // 职场类
    {
      id: 'work_1',
      label: '被批评了',
      scene: 'work',
      prompt: '领导批评了我的工作，我该如何回复'
    },
    {
      id: 'work_2',
      label: '向上级汇报',
      scene: 'work',
      prompt: '需要向上级汇报工作进展'
    },
    {
      id: 'work_3',
      label: '会议发言',
      scene: 'work',
      prompt: '在会议上需要发表意见'
    },
    {
      id: 'work_4',
      label: '请假申请',
      scene: 'work',
      prompt: '需要向领导请假'
    },
    // 情感类
    {
      id: 'emotion_1',
      label: '安慰朋友',
      scene: 'emotion',
      prompt: '朋友心情不好，需要安慰'
    },
    {
      id: 'emotion_2',
      label: '表达爱意',
      scene: 'emotion',
      prompt: '想向喜欢的人表达爱意'
    },
    {
      id: 'emotion_3',
      label: '拒绝示好',
      scene: 'emotion',
      prompt: '需要委婉拒绝别人的示好'
    },
    {
      id: 'emotion_4',
      label: '道歉和解',
      scene: 'emotion',
      prompt: '和朋友发生矛盾，想要道歉和解'
    },
    // 社交类
    {
      id: 'social_1',
      label: '群聊活跃',
      scene: 'social',
      prompt: '在群聊中活跃气氛'
    },
    {
      id: 'social_2',
      label: '礼貌回应',
      scene: 'social',
      prompt: '需要礼貌地回应别人'
    },
    {
      id: 'social_3',
      label: '委婉拒绝',
      scene: 'social',
      prompt: '需要委婉拒绝别人的邀请'
    },
    {
      id: 'social_4',
      label: '表达感谢',
      scene: 'social',
      prompt: '想要表达感谢'
    }
  ]
}

/**
 * 根据场景筛选快捷标签
 */
export function filterTagsByScene(tags: QuickTag[], scene: SceneType): QuickTag[] {
  if (scene === 'all') {
    return tags
  }
  return tags.filter((tag) => tag.scene === scene)
}
