import {View} from '@tarojs/components'
import {useEffect, useState} from 'react'

interface ClickEffectProps {
  x: number
  y: number
  type?: 'heart' | 'star' | 'sparkle'
  onComplete?: () => void
}

export function ClickEffect({x, y, type = 'heart', onComplete}: ClickEffectProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete()
    }, 600)
    return () => clearTimeout(timer)
  }, [onComplete])

  const emoji = type === 'heart' ? '❤️' : type === 'star' ? '⭐' : '✨'

  return (
    <View
      className="fixed pointer-events-none z-50"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)'
      }}>
      <View className="text-2xl animate-[heartBurst_0.6s_ease-out]">{emoji}</View>
    </View>
  )
}

interface ParticleProps {
  x: number
  y: number
  color: string
  angle: number
  distance: number
}

export function Particle({x, y, color, angle, distance}: ParticleProps) {
  const tx = Math.cos(angle) * distance
  const ty = Math.sin(angle) * distance

  return (
    <View
      className="particle fixed pointer-events-none z-50"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        backgroundColor: color,
        // @ts-expect-error
        '--tx': `${tx}px`,
        '--ty': `${ty}px`
      }}
    />
  )
}

interface ParticleBurstProps {
  x: number
  y: number
  count?: number
  colors?: string[]
  onComplete?: () => void
}

export function ParticleBurst({
  x,
  y,
  count = 8,
  colors = ['#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD'],
  onComplete
}: ParticleBurstProps) {
  const [particles, setParticles] = useState<ParticleProps[]>([])

  useEffect(() => {
    const newParticles: ParticleProps[] = []
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count
      const distance = 50 + Math.random() * 30
      const color = colors[Math.floor(Math.random() * colors.length)]
      newParticles.push({x, y, color, angle, distance})
    }
    setParticles(newParticles)

    const timer = setTimeout(() => {
      if (onComplete) onComplete()
    }, 800)
    return () => clearTimeout(timer)
  }, [x, y, count, colors, onComplete])

  return (
    <>
      {particles.map((particle, index) => (
        <Particle key={index} {...particle} />
      ))}
    </>
  )
}

interface RippleEffectProps {
  x: number
  y: number
  onComplete?: () => void
}

export function RippleEffect({x, y, onComplete}: RippleEffectProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete()
    }, 600)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <View
      className="ripple-effect fixed pointer-events-none z-50"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: '40px',
        height: '40px',
        marginLeft: '-20px',
        marginTop: '-20px'
      }}
    />
  )
}
