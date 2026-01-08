import {Button, Text, View} from '@tarojs/components'
import {useState} from 'react'
import type {HistoryItem} from '../types/reply'
import SceneTag from './SceneTag'

interface SwipeableCardProps {
  item: HistoryItem
  onDelete: () => void
  onFavorite: () => void
  onClick: () => void
}

export default function SwipeableCard({item, onDelete, onFavorite, onClick}: SwipeableCardProps) {
  const [startX, setStartX] = useState(0)
  const [moveX, setMoveX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)

  const handleTouchStart = (e: any) => {
    setStartX(e.touches[0].clientX)
    setIsSwiping(true)
  }

  const handleTouchMove = (e: any) => {
    if (!isSwiping) return
    const currentX = e.touches[0].clientX
    const diff = currentX - startX
    // 只允许向左滑动
    if (diff < 0) {
      setMoveX(Math.max(diff, -120))
    }
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)
    // 如果滑动超过60px，则保持展开状态
    if (moveX < -60) {
      setMoveX(-120)
    } else {
      setMoveX(0)
    }
  }

  const handleCardClick = () => {
    if (moveX < 0) {
      // 如果已展开，先收起
      setMoveX(0)
    } else {
      onClick()
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    } else if (days === 1) {
      return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }
  }

  return (
    <View className="relative overflow-hidden">
      {/* 操作按钮背景 */}
      <View className="absolute right-0 top-0 bottom-0 flex items-center">
        <Button
          className="h-full px-6 bg-warning text-warning-foreground rounded-none border-0 text-base"
          size="default"
          onClick={(e) => {
            e.stopPropagation()
            onFavorite()
            setMoveX(0)
          }}>
          {item.isFavorite ? '取消' : '收藏'}
        </Button>
        <Button
          className="h-full px-6 bg-destructive text-destructive-foreground rounded-none border-0 text-base"
          size="default"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}>
          删除
        </Button>
      </View>

      {/* 卡片内容 */}
      <View
        className="bg-card rounded-xl p-4 shadow-elegant-sm transition-transform"
        style={{transform: `translateX(${moveX}px)`}}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardClick}>
        {/* 头部 */}
        <View className="flex items-center justify-between mb-2">
          <View className="flex items-center gap-2">
            <SceneTag scene={item.scene} size="sm" />
            {item.isFavorite && <View className="i-mdi-star text-warning text-base" />}
          </View>
          <Text className="text-xs text-muted-foreground break-keep">{formatTime(item.timestamp)}</Text>
        </View>

        {/* 输入内容 */}
        <Text className="text-sm text-foreground line-clamp-2 block mb-2">{item.input}</Text>

        {/* 回复预览 */}
        {item.replies.length > 0 && (
          <View className="bg-secondary rounded-lg p-2">
            <Text className="text-xs text-muted-foreground line-clamp-1 block">{item.replies[0].content}</Text>
          </View>
        )}
      </View>
    </View>
  )
}
