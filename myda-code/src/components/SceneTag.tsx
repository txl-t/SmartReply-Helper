import {Text, View} from '@tarojs/components'
import type {SceneType} from '../types/reply'
import {SCENE_BG_COLORS, SCENE_LABELS} from '../types/reply'

interface SceneTagProps {
  scene: SceneType
  size?: 'sm' | 'md'
}

export default function SceneTag({scene, size = 'md'}: SceneTagProps) {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3.5 py-1.5'
  }

  return (
    <View
      className={`inline-flex items-center rounded-full ${SCENE_BG_COLORS[scene]} ${sizeClasses[size]} shadow-elegant-sm`}>
      <Text className="text-white break-keep font-medium">{SCENE_LABELS[scene]}</Text>
    </View>
  )
}
