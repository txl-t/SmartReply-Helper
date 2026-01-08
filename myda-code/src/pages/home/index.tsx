import {Button, ScrollView, Text, Textarea, View} from '@tarojs/components'
import Taro, {useDidShow} from '@tarojs/taro'
import {useCallback, useMemo, useState} from 'react'
import {ClickEffect, ParticleBurst} from '../../components/ClickEffects'
import GachaponMachine from '../../components/GachaponMachine'
import GachaponModal from '../../components/GachaponModal'
import QuickTagGrid from '../../components/QuickTagGrid'
import ReplyCard from '../../components/ReplyCard'
import SceneTag from '../../components/SceneTag'
import type {DailyRecommendation, QuickTag, ReplyItem, ReplyStyle, SceneType} from '../../types/reply'
import {generateReplies, getDefaultReplies} from '../../utils/ai'
import {detectScene, getQuickTags} from '../../utils/scene'
import {saveHistory} from '../../utils/storage'

interface ClickEffectState {
  id: number
  x: number
  y: number
  type: 'heart' | 'star' | 'sparkle'
}

export default function Home() {
  const [input, setInput] = useState('')
  const [scene, setScene] = useState<SceneType>('social')
  const [replies, setReplies] = useState<ReplyItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [clickEffects, setClickEffects] = useState<ClickEffectState[]>([])
  const [particleBursts, setParticleBursts] = useState<{id: number; x: number; y: number}[]>([])

  // 扭蛋机状态
  const [showGachaponModal, setShowGachaponModal] = useState(false)
  const [gachaponUsageCount, setGachaponUsageCount] = useState(0)

  // 加载扭蛋机使用次数
  useDidShow(() => {
    const count = Taro.getStorageSync('gachapon_usage_count') || 0
    setGachaponUsageCount(count)
  })

  // 每日推荐
  const dailyRecommendations: DailyRecommendation[] = useMemo(
    () => [
      {
        id: '1',
        title: '职场沟通技巧',
        content: '在职场中，及时反馈和清晰表达是建立良好沟通的关键。',
        scene: 'work'
      },
      {
        id: '2',
        title: '情感表达要点',
        content: '真诚和共情是情感沟通的基础，学会倾听比表达更重要。',
        scene: 'emotion'
      },
      {
        id: '3',
        title: '社交礼仪提醒',
        content: '礼貌和尊重是社交的基本原则，适当的赞美能拉近距离。',
        scene: 'social'
      }
    ],
    []
  )

  // 快捷标签
  const quickTags = useMemo(() => getQuickTags(), [])

  // 添加点击特效
  const addClickEffect = useCallback((e: any, type: 'heart' | 'star' | 'sparkle' = 'heart') => {
    const {clientX, clientY} = e.detail || e.touches?.[0] || {clientX: 0, clientY: 0}
    const id = Date.now()
    setClickEffects((prev) => [...prev, {id, x: clientX, y: clientY, type}])
  }, [])

  // 添加粒子爆炸效果
  const addParticleBurst = useCallback((e: any) => {
    const {clientX, clientY} = e.detail || e.touches?.[0] || {clientX: 0, clientY: 0}
    const id = Date.now()
    setParticleBursts((prev) => [...prev, {id, x: clientX, y: clientY}])
  }, [])

  // 移除特效
  const removeClickEffect = useCallback((id: number) => {
    setClickEffects((prev) => prev.filter((effect) => effect.id !== id))
  }, [])

  const removeParticleBurst = useCallback((id: number) => {
    setParticleBursts((prev) => prev.filter((burst) => burst.id !== id))
  }, [])

  // 检测场景
  const handleInputChange = useCallback((value: string) => {
    setInput(value)
    if (value.trim()) {
      const detectedScene = detectScene(value)
      setScene(detectedScene)
    }
  }, [])

  // 生成回复
  const handleGenerate = useCallback(
    async (e: any) => {
      if (!input.trim()) {
        Taro.showToast({
          title: '请输入内容',
          icon: 'none'
        })
        return
      }

      // 添加粒子爆炸效果
      addParticleBurst(e)

      setLoading(true)
      setShowReplies(false)
      setReplies([])

      try {
        const generatedReplies = await generateReplies(
          input,
          scene,
          undefined,
          undefined,
          (style: ReplyStyle, content: string) => {
            // 实时更新回复内容
            setReplies((prev) => {
              const existing = prev.find((r) => r.style === style)
              if (existing) {
                return prev.map((r) => (r.style === style ? {...r, content} : r))
              } else {
                return [...prev, {id: `${style}_${Date.now()}`, style, content}]
              }
            })
            setShowReplies(true)
          }
        )

        setReplies(generatedReplies)
        setShowReplies(true)

        // 保存到历史记录
        saveHistory({
          id: `history_${Date.now()}`,
          input,
          scene,
          replies: generatedReplies,
          timestamp: Date.now(),
          isFavorite: false
        })

        Taro.showToast({
          title: '生成成功',
          icon: 'success',
          duration: 1500
        })
      } catch (error) {
        console.error('生成失败:', error)

        // 使用兜底回复
        const defaultReplies = getDefaultReplies(scene)
        setReplies(defaultReplies)
        setShowReplies(true)

        Taro.showToast({
          title: '网络开小差了，已使用默认回复',
          icon: 'none',
          duration: 2000
        })
      } finally {
        setLoading(false)
      }
    },
    [input, scene, addParticleBurst]
  )

  // 快捷标签点击
  const handleTagClick = useCallback((tag: QuickTag) => {
    setInput(tag.prompt)
    setScene(tag.scene)
  }, [])

  // 扭蛋机点击
  const handleGachaponPress = useCallback(() => {
    setShowGachaponModal(true)
  }, [])

  // 使用扭蛋模板
  const handleUseGachaponTemplate = useCallback((content: string) => {
    setInput(content)
    // 更新使用次数
    const count = Taro.getStorageSync('gachapon_usage_count') || 0
    setGachaponUsageCount(count)

    Taro.showToast({
      title: '建议已填入',
      icon: 'success',
      duration: 1500
    })
  }, [])

  // 关闭扭蛋机弹窗
  const handleCloseGachaponModal = useCallback(() => {
    setShowGachaponModal(false)
  }, [])

  return (
    <View className="min-h-screen bg-gradient-bg relative overflow-hidden">
      {/* 云朵视差背景 */}
      <View className="absolute top-10 left-0 text-4xl opacity-10 cloud-parallax-1">☁️</View>
      <View className="absolute top-32 right-0 text-5xl opacity-10 cloud-parallax-2">☁️</View>

      <ScrollView scrollY className="h-screen" style={{background: 'transparent'}}>
        <View className="pb-24">
          {/* 顶部品牌区 - 晨雾感渐变背景 */}
          <View className="bg-gradient-morning px-6 pt-8 pb-6 mb-6 relative">
            <Text className="text-3xl font-extralight gradient-text block mb-1 hand-drawn-line">智能回复助手</Text>
            <Text className="text-xs handwriting text-foreground block mt-4 opacity-70">让沟通更轻松...</Text>
          </View>

          <View className="px-6">
            {/* 每日推荐 - 圆角菱形卡片 */}
            <View className="mb-8">
              <View className="flex items-center gap-2 mb-4">
                <View className="i-mdi-leaf text-lg text-accent pulse" />
                <Text className="text-base font-medium text-foreground break-keep">每日推荐</Text>
              </View>
              <ScrollView scrollX className="whitespace-nowrap -mx-6 px-6">
                <View className="flex gap-4">
                  {dailyRecommendations.map((rec, index) => (
                    <View
                      key={rec.id}
                      className={`inline-block bg-gradient-watercolor diamond-card p-5 shadow-elegant-md relative ${
                        index === 0 ? 'bounce-in' : index === 1 ? 'rotate-in' : 'jelly'
                      }`}
                      style={{width: '280px', animationDelay: `${index * 0.1}s`}}
                      onClick={(e) => addClickEffect(e, 'sparkle')}>
                      {/* 小手帐贴纸 */}
                      <View className="absolute -top-2 -left-2 w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-elegant-sm breathe">
                        <Text className="text-xs text-white font-medium break-keep">今日</Text>
                      </View>
                      {/* 竖排标题 */}
                      <View className="flex items-start gap-3 mt-2">
                        <View className="flex flex-col gap-1">
                          {rec.title.split('').map((char, idx) => (
                            <Text key={idx} className="text-sm font-medium text-foreground block text-center">
                              {char}
                            </Text>
                          ))}
                        </View>
                        <View className="i-mdi-feather text-2xl text-accent opacity-30" />
                      </View>
                      {/* 内容 - 首字下沉 */}
                      <Text className="text-xs text-foreground block mt-4 leading-relaxed drop-cap">{rec.content}</Text>
                      <View className="mt-2">
                        <SceneTag scene={rec.scene} size="sm" />
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* 输入区域 - 磨砂玻璃效果 + 流动边框 */}
            <View className="mb-8">
              <View className="flex items-center gap-2 mb-4">
                <View className="i-mdi-pencil text-lg text-primary" />
                <Text className="text-base font-medium text-foreground break-keep">输入内容</Text>
              </View>
              <View
                className={`glass-effect rounded-2xl p-4 mb-3 shadow-elegant-sm transition-all ${
                  inputFocused ? 'candy-shadow' : 'border-dashed-gold'
                }`}>
                <Textarea
                  className="w-full text-foreground text-base"
                  style={{padding: 0, border: 'none', background: 'transparent', minHeight: '120px'}}
                  placeholder="输入你想回复的内容..."
                  placeholderStyle="color: hsl(205 40% 75% / 0.5)"
                  value={input}
                  onInput={(e) => handleInputChange(e.detail.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  maxlength={500}
                />
              </View>
              {input.trim() && (
                <View className="flex items-center gap-2 bounce-in">
                  <View className="i-mdi-briefcase text-base text-lavender" />
                  <Text className="text-sm text-muted-foreground break-keep mr-2">识别场景：</Text>
                  <View className="cloud-shape px-3 py-1 bg-lavender">
                    <Text className="text-xs text-white font-medium break-keep">
                      {scene === 'work' ? '职场' : scene === 'emotion' ? '情感' : '社交'}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* 快捷标签 - 手帐胶带样式 */}
            <View className="mb-8">
              <View className="flex items-center gap-2 mb-4">
                <View className="i-mdi-tag-multiple text-lg text-accent" />
                <Text className="text-base font-medium text-foreground break-keep">快捷标签</Text>
              </View>

              {/* 扭蛋机 + 快捷标签 */}
              <View className="flex flex-col gap-4">
                {/* 扭蛋机入口 */}
                <View className="flex justify-center">
                  <GachaponMachine
                    onPress={handleGachaponPress}
                    usageCount={gachaponUsageCount}
                    showBadge={gachaponUsageCount > 0}
                  />
                </View>

                {/* 快捷标签网格 */}
                <QuickTagGrid tags={quickTags} onTagClick={handleTagClick} />
              </View>

              {/* 手绘藤蔓装饰线 */}
              <View className="mt-4 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30" />
            </View>

            {/* 生成按钮 */}
            <View className="mb-6">
              <Button
                className={`w-full py-5 rounded-2xl break-keep text-base font-medium shadow-elegant-md transition-all ${
                  loading ? 'bg-gradient-primary text-white' : 'bg-background border-2 border-accent text-foreground'
                }`}
                size="default"
                onClick={loading ? undefined : handleGenerate}>
                {loading ? (
                  <View className="flex items-center justify-center gap-2">
                    <View className="loading-dots">
                      <View />
                      <View />
                      <View />
                    </View>
                  </View>
                ) : (
                  <View className="flex items-center justify-center gap-2">
                    <Text className="break-keep">生成智能回复</Text>
                    <View className="i-mdi-arrow-right text-lg" />
                  </View>
                )}
              </Button>
              {!loading && (
                <Text className="text-xs handwriting text-muted-foreground block text-center mt-2">
                  轻轻触碰，灵感浮现
                </Text>
              )}
            </View>

            {/* 回复结果 */}
            {showReplies && replies.length > 0 && (
              <View className="mt-8">
                <View className="flex items-center gap-2 mb-4">
                  <View className="i-mdi-sparkles text-lg text-accent" />
                  <Text className="text-base font-medium text-foreground break-keep">生成结果</Text>
                </View>
                <View className="flex flex-col gap-4">
                  {replies.map((reply, index) => (
                    <View key={reply.id} style={{animationDelay: `${index * 0.1}s`}} className="bounce-in">
                      <ReplyCard reply={reply} showCopy />
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 点击特效 */}
      {clickEffects.map((effect) => (
        <ClickEffect
          key={effect.id}
          x={effect.x}
          y={effect.y}
          type={effect.type}
          onComplete={() => removeClickEffect(effect.id)}
        />
      ))}

      {/* 粒子爆炸特效 */}
      {particleBursts.map((burst) => (
        <ParticleBurst key={burst.id} x={burst.x} y={burst.y} onComplete={() => removeParticleBurst(burst.id)} />
      ))}

      {/* 扭蛋机弹窗 */}
      <GachaponModal
        visible={showGachaponModal}
        onClose={handleCloseGachaponModal}
        onUseTemplate={handleUseGachaponTemplate}
      />
    </View>
  )
}
