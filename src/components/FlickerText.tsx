// FlickerText.tsx
'use client'

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  type CSSProperties,
} from 'react'
import { motion, useInView, type Variants } from 'framer-motion'

interface FlickerTextProps {
  text: string
  textColor?: string
  glowColor?: string
  font?: CSSProperties
  animationSpeed?: number
  animationPattern?: 'sequential' | 'random' | 'sync'
  repeatBehavior?: 'once' | 'loop'
  animationStyle?: 'neon' | 'led' | 'retro' | 'electric'
  strokeWidth?: number
  glowIntensity?: number
  showBackground?: boolean
  autoPlay?: boolean
  style?: CSSProperties
}

export default function FlickerText({
                                      text = 'FLICKER TEXT',
                                      textColor = '#FFFFFF',
                                      glowColor = '#00FFFF',
                                      font,
                                      animationSpeed = 1,
                                      animationPattern = 'sequential',
                                      repeatBehavior = 'loop',
                                      animationStyle = 'neon',
                                      strokeWidth = 2,
                                      glowIntensity = 10,
                                      showBackground = true,
                                      autoPlay = true,
                                      style,
                                    }: FlickerTextProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: false, amount: 0.5 })

  const characters = useMemo(() => {
    return text
      .split('')
      .map((char, index) => ({
        char: char === ' ' ? '\u00A0' : char,
        index,
        id: `${char}-${index}`,
      }))
  }, [text])

  const baseDelay = 0.1 / animationSpeed
  const flickerDuration = 0.3 / animationSpeed
  const totalDuration = characters.length * baseDelay + flickerDuration

  const getAnimationDelay = (index: number) => {
    switch (animationPattern) {
      case 'sequential':
        return index * baseDelay
      case 'random':
        return Math.random() * (totalDuration * 0.7)
      case 'sync':
        return 0
      default:
        return index * baseDelay
    }
  }

  const getStyleVariation = () => {
    switch (animationStyle) {
      case 'neon':
        return {
          filter: `drop-shadow(0 0 ${glowIntensity}px ${glowColor})`,
          textShadow: `0 0 ${glowIntensity * 2}px ${glowColor}`,
        }
      case 'led':
        return {
          filter: `drop-shadow(0 0 ${glowIntensity * 0.5}px ${glowColor})`,
          textShadow: `0 0 ${glowIntensity}px ${glowColor}`,
        }
      case 'retro':
        return {
          filter: `drop-shadow(0 0 ${glowIntensity * 1.5}px ${glowColor}) contrast(1.2)`,
          textShadow: `0 0 ${glowIntensity * 3}px ${glowColor}`,
        }
      case 'electric':
        return {
          filter: `drop-shadow(0 0 ${glowIntensity * 2}px ${glowColor}) brightness(1.1)`,
          textShadow: `0 0 ${glowIntensity * 4}px ${glowColor}`,
        }
      default:
        return {}
    }
  }

  const styleVariation = getStyleVariation()

  useEffect(() => {
    if (autoPlay && isInView) {
      setIsPlaying(true)
    }
  }, [autoPlay, isInView])

  const characterVariants: Variants = {
    initial: {
      opacity: 1,
      color: textColor,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      WebkitTextStroke: `${strokeWidth}px transparent`,
      textShadow: "none",
      filter: "none",
    },
    flicker: (index: number) => ({
      // 깜빡이는 효과를 위한 키프레임 애니메이션
      opacity: [1, 0.3, 1, 0.1, 1, 0.7, 1],
      color: [textColor, "transparent", textColor, "transparent", textColor],
      WebkitTextStroke: [
        `${strokeWidth}px transparent`,
        `${strokeWidth}px ${textColor}`,
        `${strokeWidth}px transparent`,
        `${strokeWidth}px ${textColor}`,
        `${strokeWidth}px transparent`,
      ],
      // 💡 [수정됨] 애니메이션의 최종 목표 상태에 네온/글로우 효과를 포함시킵니다.
      ...styleVariation,
      transition: {
        duration: flickerDuration,
        delay: getAnimationDelay(index),
        ease: "easeInOut",
        // repeatBehavior가 'loop'가 아니면 0이 되어 한 번만 실행됩니다.
        repeat: repeatBehavior === "loop" ? Infinity : 0,
        repeatDelay: repeatBehavior === "loop" ? 5 : 0,
      },
    }),
  }


  return (
    <div
      ref={containerRef}
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: showBackground ? 'black' : 'transparent',
        padding: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          ...font,
          ...styleVariation,
        }}
      >
        {characters.map((character, index) => (
          <motion.span
            key={`${character.id}`}
            custom={index}
            variants={characterVariants}
            initial="initial"
            animate={isPlaying ? 'flicker' : 'initial'}
            style={{ display: 'inline-block', whiteSpace: 'pre' }}
          >
            {character.char}
          </motion.span>
        ))}
      </div>
    </div>
  )
}