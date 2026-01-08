import {createChatDataHandler, sendChatStream} from 'miaoda-taro-utils/chatStream'
import type {RelationType, ReplyIntensity, ReplyItem, ReplyStyle, SceneType} from '../types/reply'

// @ts-expect-error
const APP_ID = process.env.TARO_APP_APP_ID || ''
const API_ENDPOINT = 'https://api-integrations.appmiaoda.com/app-8q45es7vhxq9/api-Xa6JZMByJlDa/v2/chat/completions'

/**
 * 生成系统提示词
 */
function generateSystemPrompt(
  style: ReplyStyle,
  scene: SceneType,
  intensity?: ReplyIntensity,
  relation?: RelationType
): string {
  let basePrompt = '你是一个专业的沟通助手，帮助用户生成合适的回复内容。'

  // 场景提示
  const scenePrompts: Record<SceneType, string> = {
    work: '这是一个职场沟通场景，请注意职业礼仪和专业性。',
    emotion: '这是一个情感沟通场景，请注意情感表达和共情能力。',
    social: '这是一个社交沟通场景，请注意礼貌和友好。',
    all: ''
  }

  // 风格提示
  const stylePrompts: Record<ReplyStyle, string> = {
    formal: '请使用正式、专业的语言风格，措辞严谨。',
    friendly: '请使用友好、亲切的语言风格，让人感到温暖。',
    humorous: '请使用幽默、轻松的语言风格，但不要过于随意。'
  }

  // 强度提示
  const intensityPrompts: Record<ReplyIntensity, string> = {
    gentle: '请使用委婉、温和的表达方式。',
    moderate: '请使用适中、平衡的表达方式。',
    direct: '请使用直接、明确的表达方式。'
  }

  // 关系提示
  const relationPrompts: Record<RelationType, string> = {
    superior: '对方是你的上级，请注意尊重和礼貌。',
    peer: '对方是你的平级同事或朋友，可以平等交流。',
    subordinate: '对方是你的下级，请注意引导和鼓励。'
  }

  basePrompt += scenePrompts[scene]
  basePrompt += stylePrompts[style]

  if (intensity) {
    basePrompt += intensityPrompts[intensity]
  }

  if (relation) {
    basePrompt += relationPrompts[relation]
  }

  basePrompt += '请直接给出回复内容，不要添加额外的解释或说明。回复内容应该简洁明了，字数控制在50-100字之间。'

  return basePrompt
}

/**
 * 生成单个风格的回复
 */
export async function generateSingleReply(
  input: string,
  style: ReplyStyle,
  scene: SceneType,
  intensity?: ReplyIntensity,
  relation?: RelationType,
  onUpdate?: (content: string) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    let fullContent = ''

    const handleData = createChatDataHandler((content) => {
      fullContent = content
      if (onUpdate) {
        onUpdate(content)
      }
    })

    const {abort} = sendChatStream({
      endpoint: API_ENDPOINT,
      appId: APP_ID,
      messages: [
        {
          role: 'system',
          content: generateSystemPrompt(style, scene, intensity, relation)
        },
        {
          role: 'user',
          content: input
        }
      ],
      onUpdate: handleData,
      onComplete: () => {
        resolve(fullContent)
      },
      onError: (error: Error) => {
        console.error('AI回复生成失败:', error)
        reject(error)
      }
    })

    // 3秒超时处理
    setTimeout(() => {
      if (!fullContent) {
        abort()
        reject(new Error('生成超时'))
      }
    }, 30000)
  })
}

/**
 * 生成三种风格的回复
 */
export async function generateReplies(
  input: string,
  scene: SceneType,
  intensity?: ReplyIntensity,
  relation?: RelationType,
  onProgress?: (style: ReplyStyle, content: string) => void
): Promise<ReplyItem[]> {
  const styles: ReplyStyle[] = ['formal', 'friendly', 'humorous']
  const replies: ReplyItem[] = []

  try {
    // 串行生成三种风格的回复
    for (const style of styles) {
      const content = await generateSingleReply(input, style, scene, intensity, relation, (partialContent) => {
        if (onProgress) {
          onProgress(style, partialContent)
        }
      })

      replies.push({
        id: `${style}_${Date.now()}`,
        style,
        content
      })
    }

    return replies
  } catch (error) {
    console.error('生成回复失败:', error)
    throw error
  }
}

/**
 * 获取默认兜底回复
 */
export function getDefaultReplies(scene: SceneType): ReplyItem[] {
  const defaults: Record<SceneType, ReplyItem[]> = {
    work: [
      {
        id: 'default_formal',
        style: 'formal',
        content: '收到，我会认真处理这件事，稍后向您汇报进展。'
      },
      {
        id: 'default_friendly',
        style: 'friendly',
        content: '好的，我明白了，会尽快完成的！'
      },
      {
        id: 'default_humorous',
        style: 'humorous',
        content: '收到！马上安排，保证完成任务！'
      }
    ],
    emotion: [
      {
        id: 'default_formal',
        style: 'formal',
        content: '我理解你的感受，如果需要帮助请随时告诉我。'
      },
      {
        id: 'default_friendly',
        style: 'friendly',
        content: '别担心，一切都会好起来的，我会一直陪着你。'
      },
      {
        id: 'default_humorous',
        style: 'humorous',
        content: '没事的，天塌下来还有我呢！'
      }
    ],
    social: [
      {
        id: 'default_formal',
        style: 'formal',
        content: '感谢您的邀请，我会认真考虑的。'
      },
      {
        id: 'default_friendly',
        style: 'friendly',
        content: '谢谢你的邀请，我很开心！'
      },
      {
        id: 'default_humorous',
        style: 'humorous',
        content: '哈哈，必须的！算我一个！'
      }
    ],
    all: [
      {
        id: 'default_formal',
        style: 'formal',
        content: '好的，我知道了。'
      },
      {
        id: 'default_friendly',
        style: 'friendly',
        content: '好的，明白了！'
      },
      {
        id: 'default_humorous',
        style: 'humorous',
        content: '收到！'
      }
    ]
  }

  return defaults[scene] || defaults.all
}
