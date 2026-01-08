import {Button, ScrollView, Text, View} from '@tarojs/components'
import Taro, {useDidShow} from '@tarojs/taro'
import {useCallback, useMemo, useState} from 'react'
import SwipeableCard from '../../components/SwipeableCard'
import type {HistoryItem, SceneType} from '../../types/reply'
import {SCENE_LABELS} from '../../types/reply'
import {clearHistory, deleteHistory, getHistory, toggleFavorite} from '../../utils/storage'

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [selectedScene, setSelectedScene] = useState<SceneType>('all')

  // 加载历史记录
  const loadHistory = useCallback(() => {
    const data = getHistory()
    setHistory(data)
  }, [])

  useDidShow(() => {
    loadHistory()
  })

  // 按场景筛选
  const filteredHistory = useMemo(() => {
    if (selectedScene === 'all') {
      return history
    }
    return history.filter((item) => item.scene === selectedScene)
  }, [history, selectedScene])

  // 按时间分组
  const groupedHistory = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const yesterday = today - 24 * 60 * 60 * 1000
    const thisWeek = today - 7 * 24 * 60 * 60 * 1000

    const groups = {
      today: [] as HistoryItem[],
      yesterday: [] as HistoryItem[],
      thisWeek: [] as HistoryItem[],
      earlier: [] as HistoryItem[]
    }

    filteredHistory.forEach((item) => {
      if (item.timestamp >= today) {
        groups.today.push(item)
      } else if (item.timestamp >= yesterday) {
        groups.yesterday.push(item)
      } else if (item.timestamp >= thisWeek) {
        groups.thisWeek.push(item)
      } else {
        groups.earlier.push(item)
      }
    })

    return groups
  }, [filteredHistory])

  // 删除记录
  const handleDelete = useCallback(
    (id: string) => {
      Taro.showModal({
        title: '确认删除',
        content: '确定要删除这条记录吗？',
        success: (res) => {
          if (res.confirm) {
            deleteHistory(id)
            loadHistory()
            Taro.showToast({
              title: '已删除',
              icon: 'success'
            })
          }
        }
      })
    },
    [loadHistory]
  )

  // 切换收藏
  const handleFavorite = useCallback(
    (id: string) => {
      const isFavorite = toggleFavorite(id)
      loadHistory()
      Taro.showToast({
        title: isFavorite ? '已收藏' : '已取消收藏',
        icon: 'success',
        duration: 1500
      })
    },
    [loadHistory]
  )

  // 查看详情
  const handleCardClick = useCallback((item: HistoryItem) => {
    // 可以跳转到详情页或显示弹窗
    Taro.showModal({
      title: '回复详情',
      content: item.replies.map((r) => `${r.style}: ${r.content}`).join('\n\n'),
      showCancel: false
    })
  }, [])

  // 清空历史
  const handleClearAll = useCallback(() => {
    Taro.showModal({
      title: '确认清空',
      content: '确定要清空所有历史记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          clearHistory()
          loadHistory()
        }
      }
    })
  }, [loadHistory])

  // 场景筛选按钮
  const sceneFilters: SceneType[] = ['all', 'work', 'emotion', 'social']

  // 渲染分组
  const renderGroup = (title: string, items: HistoryItem[]) => {
    if (items.length === 0) return null

    return (
      <View className="mb-6">
        <Text className="text-sm font-semibold text-muted-foreground block mb-3 break-keep">{title}</Text>
        <View className="flex flex-col gap-3">
          {items.map((item) => (
            <SwipeableCard
              key={item.id}
              item={item}
              onDelete={() => handleDelete(item.id)}
              onFavorite={() => handleFavorite(item.id)}
              onClick={() => handleCardClick(item)}
            />
          ))}
        </View>
      </View>
    )
  }

  return (
    <View className="min-h-screen bg-gradient-bg">
      <ScrollView scrollY className="h-screen" style={{background: 'transparent'}}>
        <View className="p-4 pb-24">
          {/* 头部 */}
          <View className="flex items-center justify-between mb-6">
            <View>
              <Text className="text-2xl font-bold text-foreground block mb-1">历史记录</Text>
              <Text className="text-sm text-muted-foreground block">共 {history.length} 条记录</Text>
            </View>
            {history.length > 0 && (
              <Button
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg border-0 text-sm"
                size="mini"
                onClick={handleClearAll}>
                清空
              </Button>
            )}
          </View>

          {/* 场景筛选 */}
          <View className="mb-6">
            <ScrollView scrollX className="whitespace-nowrap">
              <View className="flex gap-2">
                {sceneFilters.map((scene) => (
                  <View
                    key={scene}
                    className={`inline-flex items-center px-4 py-2 rounded-full transition-all ${
                      selectedScene === scene
                        ? 'bg-gradient-primary text-primary-foreground shadow-elegant-sm'
                        : 'bg-card text-foreground'
                    }`}
                    onClick={() => setSelectedScene(scene)}>
                    <Text className="text-sm font-medium break-keep">{SCENE_LABELS[scene]}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* 历史记录列表 */}
          {filteredHistory.length === 0 ? (
            <View className="flex flex-col items-center justify-center py-20">
              <View className="i-mdi-history text-6xl text-muted-foreground mb-4" />
              <Text className="text-base text-muted-foreground block">暂无历史记录</Text>
            </View>
          ) : (
            <View>
              {renderGroup('今天', groupedHistory.today)}
              {renderGroup('昨天', groupedHistory.yesterday)}
              {renderGroup('本周', groupedHistory.thisWeek)}
              {renderGroup('更早', groupedHistory.earlier)}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
