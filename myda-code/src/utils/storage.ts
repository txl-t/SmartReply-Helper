import Taro from '@tarojs/taro'
import type {HistoryItem} from '../types/reply'

const HISTORY_KEY = 'reply_history'
const _FAVORITES_KEY = 'reply_favorites'
const MAX_HISTORY = 50

/**
 * 获取历史记录
 */
export function getHistory(): HistoryItem[] {
  try {
    const data = Taro.getStorageSync(HISTORY_KEY)
    return data || []
  } catch (error) {
    console.error('获取历史记录失败:', error)
    return []
  }
}

/**
 * 保存历史记录
 */
export function saveHistory(item: HistoryItem): void {
  try {
    const history = getHistory()
    // 添加到开头
    history.unshift(item)
    // 限制最大数量
    if (history.length > MAX_HISTORY) {
      history.splice(MAX_HISTORY)
    }
    Taro.setStorageSync(HISTORY_KEY, history)
  } catch (error) {
    console.error('保存历史记录失败:', error)
    Taro.showToast({
      title: '保存失败',
      icon: 'none'
    })
  }
}

/**
 * 删除历史记录
 */
export function deleteHistory(id: string): void {
  try {
    const history = getHistory()
    const filtered = history.filter((item) => item.id !== id)
    Taro.setStorageSync(HISTORY_KEY, filtered)
  } catch (error) {
    console.error('删除历史记录失败:', error)
    Taro.showToast({
      title: '删除失败',
      icon: 'none'
    })
  }
}

/**
 * 切换收藏状态
 */
export function toggleFavorite(id: string): boolean {
  try {
    const history = getHistory()
    const item = history.find((h) => h.id === id)
    if (item) {
      item.isFavorite = !item.isFavorite
      Taro.setStorageSync(HISTORY_KEY, history)
      return item.isFavorite
    }
    return false
  } catch (error) {
    console.error('切换收藏状态失败:', error)
    Taro.showToast({
      title: '操作失败',
      icon: 'none'
    })
    return false
  }
}

/**
 * 获取收藏列表
 */
export function getFavorites(): HistoryItem[] {
  const history = getHistory()
  return history.filter((item) => item.isFavorite)
}

/**
 * 清空历史记录
 */
export function clearHistory(): void {
  try {
    Taro.setStorageSync(HISTORY_KEY, [])
    Taro.showToast({
      title: '已清空',
      icon: 'success'
    })
  } catch (error) {
    console.error('清空历史记录失败:', error)
    Taro.showToast({
      title: '清空失败',
      icon: 'none'
    })
  }
}
