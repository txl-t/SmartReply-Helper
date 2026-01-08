import {Button, Text, View} from '@tarojs/components'
import Taro from '@tarojs/taro'
import {useState} from 'react'
import type {ReplyItem} from '../types/reply'

interface ReplyCardProps {
  reply: ReplyItem
  showCopy?: boolean
  showFavorite?: boolean
  isFavorite?: boolean
  onFavorite?: () => void
}

export default function ReplyCard({
  reply,
  showCopy = true,
  showFavorite = false,
  isFavorite = false,
  onFavorite
}: ReplyCardProps) {
  const [copied, setCopied] = useState(false)
  const [showGlow, setShowGlow] = useState(false)

  const handleCopy = () => {
    Taro.setClipboardData({
      data: reply.content,
      success: () => {
        setCopied(true)
        setShowGlow(true)
        setTimeout(() => {
          setCopied(false)
          setShowGlow(false)
        }, 2000)
        Taro.showToast({
          title: '已复制',
          icon: 'success',
          duration: 1500
        })
      }
    })
  }

  const handleFavorite = () => {
    if (onFavorite) {
      onFavorite()
    }
  }

  // 根据风格选择装饰图标和颜色
  const getStyleDecoration = () => {
    switch (reply.style) {
      case 'formal':
        return {
          icon: 'i-mdi-flower-tulip',
          color: 'text-lavender',
          bg: 'bg-gradient-lavender',
          label: '高情商版',
          emoji: '💜'
        }
      case 'friendly':
        return {
          icon: 'i-mdi-flower',
          color: 'text-apricot',
          bg: 'bg-gradient-apricot',
          label: '友好版',
          emoji: '😊'
        }
      case 'humorous':
        return {
          icon: 'i-mdi-clover',
          color: 'text-sage',
          bg: 'bg-gradient-sage',
          label: '简洁版',
          emoji: '✓'
        }
    }
  }

  const decoration = getStyleDecoration()

  return (
    <View className={`bg-card rounded-2xl p-5 shadow-paper relative ${showGlow ? 'glow-effect' : ''}`}>
      {/* 翻页书效果 - 顶部金色分页线 */}
      <View className="absolute top-0 left-8 right-8 h-px bg-accent opacity-30" />

      {/* 左侧手绘植物装饰 */}
      <View
        className={`absolute left-2 top-1/2 -translate-y-1/2 ${decoration.icon} text-4xl ${decoration.color} opacity-20`}
      />

      <View className="relative">
        {/* 标题栏 - 印章样式标签 */}
        <View className="flex items-center justify-between mb-4">
          <View className="flex items-center gap-2">
            <View className={`stamp-style px-3 py-1 ${decoration.color}`}>
              <Text className="text-xs font-medium break-keep">{decoration.label}</Text>
            </View>
            <Text className="text-lg">{decoration.emoji}</Text>
          </View>
          <View className="flex items-center gap-2">
            {showFavorite && (
              <Button className="p-0 bg-transparent border-0" size="mini" onClick={handleFavorite}>
                <View
                  className={`${isFavorite ? 'i-mdi-star text-warning' : 'i-mdi-star-outline text-muted-foreground'} text-xl`}
                />
              </Button>
            )}
          </View>
        </View>

        {/* 回复内容 - 首行缩进 */}
        <Text className="text-base text-foreground leading-relaxed block pl-8">{reply.content}</Text>

        {/* 复制按钮 - 印章样式 */}
        {showCopy && (
          <View className="flex justify-end mt-4">
            <Button
              className={`stamp-style px-4 py-2 ${decoration.bg} border-0 ${copied ? 'shrink-rotate' : ''}`}
              size="mini"
              onClick={handleCopy}>
              <View className="flex items-center gap-1">
                <View className={`${copied ? 'i-mdi-check' : 'i-mdi-content-copy'} text-sm text-white`} />
                <Text className="text-xs text-white font-medium break-keep">{copied ? '✓ 已复制' : '复制'}</Text>
              </View>
            </Button>
          </View>
        )}
      </View>
    </View>
  )
}
