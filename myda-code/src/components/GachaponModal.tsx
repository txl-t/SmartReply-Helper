import {View} from '@tarojs/components'
import Taro from '@tarojs/taro'
import {useCallback, useEffect, useState} from 'react'
import type {SuggestionTemplate} from '../utils/gachapon'
import {getCapsuleColor, getRandomTemplate, masterTemplate, suggestionTemplates} from '../utils/gachapon'
import {ParticleBurst} from './ClickEffects'
import SuggestionCard from './SuggestionCard'

interface GachaponModalProps {
  visible: boolean
  onClose: () => void
  onUseTemplate: (content: string) => void
}

type AnimationStage = 'drop' | 'bounce' | 'open' | 'card' | 'complete'

export default function GachaponModal({visible, onClose, onUseTemplate}: GachaponModalProps) {
  const [stage, setStage] = useState<AnimationStage>('drop')
  const [template, setTemplate] = useState<SuggestionTemplate | null>(null)
  const [isGolden, setIsGolden] = useState(false)
  const [particleBursts, setParticleBursts] = useState<{id: number; x: number; y: number}[]>([])
  const [fireworks, setFireworks] = useState<{id: number; x: number; y: number}[]>([])

  // 添加粒子爆炸
  const addParticleBurst = useCallback((x: number, y: number) => {
    const id = Date.now()
    setParticleBursts((prev) => [...prev, {id, x, y}])
    setTimeout(() => {
      setParticleBursts((prev) => prev.filter((b) => b.id !== id))
    }, 800)
  }, [])

  // 添加烟花特效
  const addFireworks = useCallback(() => {
    const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 187.5
    const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 333.5
    const newFireworks: {id: number; x: number; y: number}[] = []

    // 8个方向的烟花
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8
      const distance = 100
      const x = centerX + Math.cos(angle) * distance
      const y = centerY + Math.sin(angle) * distance
      newFireworks.push({id: Date.now() + i, x, y})
    }

    setFireworks(newFireworks)
    setTimeout(() => {
      setFireworks([])
    }, 800)
  }, [])

  // 检查是否触发金色扭蛋
  const checkGoldenCapsule = useCallback(() => {
    const count = Taro.getStorageSync('gachapon_usage_count') || 0
    const newCount = count + 1
    Taro.setStorageSync('gachapon_usage_count', newCount)

    // 每11次触发金色扭蛋
    return newCount % 11 === 0
  }, [])

  // 初始化动画流程
  useEffect(() => {
    if (!visible) return

    const golden = checkGoldenCapsule()
    setIsGolden(golden)

    // 选择模板
    const selectedTemplate = golden ? masterTemplate : getRandomTemplate()
    setTemplate(selectedTemplate)

    // 动画序列
    setStage('drop')

    // 1. 掉落阶段（0.8s）
    const dropTimer = setTimeout(() => {
      setStage('bounce')
      // 添加粒子爆炸效果
      const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 187.5
      const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 333.5
      addParticleBurst(centerX, centerY)
    }, 800)

    // 2. 弹跳阶段（1s）
    const bounceTimer = setTimeout(() => {
      setStage('open')
      if (golden) {
        // 金色扭蛋烟花特效
        addFireworks()
      }
    }, 1800)

    // 3. 展开阶段（0.6s）
    const openTimer = setTimeout(() => {
      setStage('card')
    }, 2400)

    return () => {
      clearTimeout(dropTimer)
      clearTimeout(bounceTimer)
      clearTimeout(openTimer)
    }
  }, [visible, checkGoldenCapsule, addParticleBurst, addFireworks])

  // 使用模板
  const handleUseTemplate = useCallback(
    (selectedTemplate: SuggestionTemplate) => {
      const content = selectedTemplate.content.join('\n')
      onUseTemplate(content)
      onClose()
    },
    [onUseTemplate, onClose]
  )

  if (!visible || !template) return null

  const capsuleColor = getCapsuleColor(template.style)

  return (
    <View className="fixed inset-0 z-50 bg-black bg-opacity-50">
      {/* 扭蛋掉落动画 */}
      {(stage === 'drop' || stage === 'bounce') && (
        <View className="absolute top-20 left-1/2 transform -translate-x-1/2">
          <View
            className={`w-20 h-20 rounded-full ${stage === 'drop' ? 'capsule-drop' : 'capsule-bounce'} ${
              isGolden ? 'golden-shine' : ''
            }`}
            style={{
              background: `linear-gradient(135deg, hsl(${capsuleColor}), hsl(${capsuleColor} / 0.8))`,
              boxShadow: `0 4px 12px hsl(${capsuleColor} / 0.4)`
            }}
          />
        </View>
      )}

      {/* 扭蛋展开动画 */}
      {stage === 'open' && (
        <View className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-4">
          {/* 左半边 */}
          <View
            className="w-10 h-20 rounded-l-full capsule-open-left"
            style={{
              background: `linear-gradient(135deg, hsl(${capsuleColor}), hsl(${capsuleColor} / 0.8))`
            }}
          />
          {/* 右半边 */}
          <View
            className="w-10 h-20 rounded-r-full capsule-open-right"
            style={{
              background: `linear-gradient(135deg, hsl(${capsuleColor}), hsl(${capsuleColor} / 0.8))`
            }}
          />
        </View>
      )}

      {/* 卡片展示 */}
      {stage === 'card' && (
        <SuggestionCard
          templates={isGolden ? [masterTemplate] : suggestionTemplates}
          initialIndex={isGolden ? 0 : suggestionTemplates.findIndex((t) => t.id === template.id)}
          onUse={handleUseTemplate}
          onClose={onClose}
        />
      )}

      {/* 粒子爆炸特效 */}
      {particleBursts.map((burst) => (
        <ParticleBurst key={burst.id} x={burst.x} y={burst.y} onComplete={() => {}} />
      ))}

      {/* 烟花特效 */}
      {fireworks.map((fw) => {
        const _centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 187.5
        const _centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 333.5
        return (
          <View
            key={fw.id}
            className="fixed w-4 h-4 rounded-full firework"
            style={
              {
                left: `${fw.x}px`,
                top: `${fw.y}px`,
                background: 'hsl(45 100% 60%)'
              } as any
            }
          />
        )
      })}
    </View>
  )
}
