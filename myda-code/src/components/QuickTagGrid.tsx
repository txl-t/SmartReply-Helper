import {Text, View} from '@tarojs/components'
import {useState} from 'react'
import type {QuickTag} from '../types/reply'
import {SCENE_COLORS} from '../types/reply'

interface QuickTagGridProps {
  tags: QuickTag[]
  onTagClick: (tag: QuickTag) => void
}

export default function QuickTagGrid({tags, onTagClick}: QuickTagGridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleClick = (tag: QuickTag) => {
    setSelectedId(tag.id)
    setTimeout(() => setSelectedId(null), 300)
    onTagClick(tag)
  }

  return (
    <View className="grid grid-cols-3 gap-3">
      {tags.map((tag) => {
        const isSelected = selectedId === tag.id
        return (
          <View
            key={tag.id}
            className={`tape-style p-3 shadow-elegant-sm transition-all ${
              isSelected ? 'scale-105 shadow-elegant-md' : 'scale-100'
            }`}
            onClick={() => handleClick(tag)}>
            <View className="flex flex-col items-center gap-2">
              <View className={`i-mdi-tag text-xl ${SCENE_COLORS[tag.scene]}`} />
              <Text className="text-xs text-foreground text-center break-keep font-extralight tracking-wider">
                {tag.label}
              </Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}
