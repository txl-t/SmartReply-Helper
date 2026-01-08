import {Button, Swiper, SwiperItem, Text, View} from '@tarojs/components'
import {useCallback, useState} from 'react'
import type {SuggestionTemplate} from '../utils/gachapon'

interface SuggestionCardProps {
  templates: SuggestionTemplate[]
  initialIndex?: number
  onUse: (template: SuggestionTemplate) => void
  onClose: () => void
}

export default function SuggestionCard({templates, initialIndex = 0, onUse, onClose}: SuggestionCardProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isFlipping, setIsFlipping] = useState(false)

  const currentTemplate = templates[currentIndex]

  const handleSwiperChange = useCallback(
    (e: any) => {
      const newIndex = e.detail.current
      if (newIndex !== currentIndex) {
        setIsFlipping(true)
        setTimeout(() => {
          setCurrentIndex(newIndex)
          setIsFlipping(false)
        }, 200)
      }
    },
    [currentIndex]
  )

  const handleUse = useCallback(() => {
    onUse(currentTemplate)
  }, [currentTemplate, onUse])

  return (
    <View className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <View className="w-11/12 max-w-md" onClick={(e) => e.stopPropagation()}>
        {/* 卡片容器 */}
        <View className={`card-rise ${isFlipping ? 'card-flip' : ''}`}>
          <Swiper
            className="h-96"
            current={currentIndex}
            onChange={handleSwiperChange}
            circular
            indicatorDots={false}
            style={{background: 'transparent'}}>
            {templates.map((template) => (
              <SwiperItem key={template.id}>
                <View
                  className="frosted-card rounded-3xl p-6 h-full flex flex-col"
                  style={{'--card-color': template.color} as any}>
                  {/* 顶部标题 */}
                  <View className="flex items-center gap-2 mb-4">
                    <Text className="text-2xl">{template.icon}</Text>
                    <Text className="text-lg font-medium text-foreground break-keep">{template.title}</Text>
                  </View>

                  {/* 中部文案 */}
                  <View className="flex-1 overflow-auto">
                    {template.content.map((line, index) => (
                      <View key={index} className="mb-3">
                        <Text className="text-sm text-foreground leading-relaxed block">{line}</Text>
                      </View>
                    ))}
                  </View>

                  {/* 底部提示 */}
                  <View className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
                    <View className="i-mdi-chevron-left text-xl" />
                    <Text className="text-xs break-keep">滑动切换风格</Text>
                    <View className="i-mdi-chevron-right text-xl" />
                  </View>

                  {/* 使用按钮 */}
                  <Button
                    className="w-full mt-4 py-3 rounded-xl break-keep text-base font-medium"
                    style={{
                      background: `linear-gradient(135deg, hsl(${template.color}), hsl(${template.color} / 0.8))`,
                      color: 'white',
                      border: 'none'
                    }}
                    size="default"
                    onClick={handleUse}>
                    使用此建议
                  </Button>
                </View>
              </SwiperItem>
            ))}
          </Swiper>
        </View>

        {/* 关闭按钮 */}
        <View className="flex justify-center mt-4">
          <View
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-elegant-md"
            onClick={onClose}>
            <View className="i-mdi-close text-xl text-foreground" />
          </View>
        </View>
      </View>
    </View>
  )
}
