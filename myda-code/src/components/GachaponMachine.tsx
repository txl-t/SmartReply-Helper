import {View} from '@tarojs/components'
import Taro from '@tarojs/taro'
import {useCallback, useEffect, useState} from 'react'

interface GachaponMachineProps {
  onPress: () => void
  usageCount: number
  showBadge: boolean
}

export default function GachaponMachine({onPress, usageCount, showBadge}: GachaponMachineProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [showGesture, setShowGesture] = useState(false)

  // 检查是否首次使用
  useEffect(() => {
    const hasUsed = Taro.getStorageSync('gachapon_has_used')
    if (!hasUsed) {
      setShowGesture(true)
    }
  }, [])

  const handlePress = useCallback(() => {
    setIsPressed(true)
    setShowGesture(false)

    // 标记已使用
    Taro.setStorageSync('gachapon_has_used', true)

    // 触发摇杆动画
    setTimeout(() => {
      setIsPressed(false)
      onPress()
    }, 600)
  }, [onPress])

  return (
    <View className="relative inline-block">
      {/* 扭蛋机主体 */}
      <View className="gachapon-machine machine-glow" onClick={handlePress}>
        {/* 玻璃罩 */}
        <View className="glass-dome">
          {/* 扭蛋（3颗莫兰迪色系） */}
          <View className="capsule-mini" style={{background: 'hsl(205 40% 75%)', top: '10px', left: '15px'}} />
          <View className="capsule-mini" style={{background: 'hsl(28 60% 85%)', top: '15px', left: '30px'}} />
          <View className="capsule-mini" style={{background: 'hsl(270 25% 77%)', top: '20px', left: '20px'}} />
        </View>

        {/* 投币口 */}
        <View className={`coin-slot ${isPressed ? 'coin-slot-glow' : ''}`} />

        {/* 摇杆 */}
        <View className={`lever ${isPressed ? 'lever-press' : ''}`} />

        {/* 底部文字 */}
        <View className="absolute bottom-2 left-0 right-0 text-center">
          <View className="text-xs text-white font-medium break-keep">提意见</View>
        </View>
      </View>

      {/* 首次使用手势提示 */}
      {showGesture && (
        <View className="absolute -top-8 left-1/2 transform -translate-x-1/2 hand-gesture">
          <View className="text-2xl">👆</View>
        </View>
      )}

      {/* 使用计数徽章 */}
      {showBadge && usageCount > 0 && (
        <View className="absolute -top-2 -right-2 badge-pop">
          <View className="bg-accent text-white text-xs px-2 py-1 rounded-full shadow-elegant-sm break-keep">
            {usageCount}
          </View>
        </View>
      )}
    </View>
  )
}
