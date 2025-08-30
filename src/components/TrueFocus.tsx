// src/components/TrueFocus.tsx

import * as React from "react"
import { useEffect, useRef, useState, useMemo } from "react"
import { motion } from "framer-motion"

type TrueFocusProps = {
  text: string
  manualMode?: boolean
  randomOrder?: boolean
  blurAmount?: number
  borderColor?: string
  glowColor?: string
  animationDuration?: number
  pauseBetweenAnimations?: number
  textColor?: string
  textAlign?: "left" | "center" | "right"
  font?: any
}

type FocusRect = {
  x: number
  y: number
  width: number
  height: number
}

// 배열을 무작위로 섞는 헬퍼 함수
const shuffleArray = (array: number[]) => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export default function TrueFocus(props: TrueFocusProps) {
  const {
    text,
    manualMode = false,
    randomOrder = false,
    blurAmount = 2,
    borderColor = "#FFFFFF",
    glowColor = "rgba(255, 255, 255, 0.5)",
    animationDuration = 0.8,
    pauseBetweenAnimations = 1,
    textColor = "#FFFFFF",
    textAlign = "center",
    font = {
      fontSize: "36px",
      fontWeight: "bold",
      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
    },
  } = props

  const lines = useMemo(() => text.split("|").map((line) => line.trim().split(" ")), [text])
  const flatWords = useMemo(() => lines.flat(), [lines])
  const [animationStep, setAnimationStep] = useState(0)
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [focusRect, setFocusRect] = useState<FocusRect>({ x: 0, y: 0, width: 0, height: 0 })

  const animationOrder = useMemo(() => {
    const indices = Array.from({ length: flatWords.length }, (_, i) => i)
    return randomOrder ? shuffleArray(indices) : indices
  }, [flatWords.length, randomOrder])

  const currentIndex = animationOrder[animationStep]

  useEffect(() => {
    if (!manualMode) {
      const interval = setInterval(
        () => setAnimationStep((prev) => (prev + 1) % flatWords.length),
        (animationDuration + pauseBetweenAnimations) * 1000
      )
      return () => clearInterval(interval)
    }
  }, [manualMode, animationDuration, pauseBetweenAnimations, flatWords.length])

  useEffect(() => {
    const updateFocusRect = () => {
      if (!containerRef.current || !wordRefs.current[currentIndex]) return
      const parent = containerRef.current.getBoundingClientRect()
      const active = wordRefs.current[currentIndex]!.getBoundingClientRect()
      setFocusRect({
        x: active.left - parent.left,
        y: active.top - parent.top,
        width: active.width,
        height: active.height,
      })
    }
    updateFocusRect()
    window.addEventListener("resize", updateFocusRect)
    return () => window.removeEventListener("resize", updateFocusRect)
  }, [currentIndex, flatWords])

  const handleMouseEnter = (index: number) => {
    if (manualMode) {
      setLastActiveIndex(index)
      const step = animationOrder.findIndex((i) => i === index)
      setAnimationStep(step)
    }
  }

  const handleMouseLeave = () => {
    if (manualMode && lastActiveIndex !== null) {
      const step = animationOrder.findIndex((i) => i === lastActiveIndex)
      setAnimationStep(step)
    }
  }

  let wordCounter = -1

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "1.5em",
        justifyContent: "center",
        alignItems:
          textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center",
        width: "100%",
        height: "auto",
        color: textColor,
        padding: "20px 0",
        ...font,
      }}
    >
      {lines.map((words, lineIndex) => (
        <div key={lineIndex} style={{ display: "flex", gap: "1.5em", flexWrap: "wrap", justifyContent: "center" }}>
          {words.map((word) => {
            wordCounter++
            const wordIndex = wordCounter
            const isActive = wordIndex === currentIndex
            return (
              <span
                key={wordIndex}
                ref={(el) => {
                  wordRefs.current[wordIndex] = el
                }}
                onMouseEnter={() => handleMouseEnter(wordIndex)}
                onMouseLeave={handleMouseLeave}
                style={{
                  position: "relative",
                  cursor: manualMode ? "pointer" : "default",
                  filter: `blur(${isActive ? 0 : blurAmount}px)`,
                  transition: `filter ${animationDuration}s ease`,
                }}
              >
                                {word}
                            </span>
            )
          })}
        </div>
      ))}

      <motion.div
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", boxSizing: "content-box", border: "none" }}
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: currentIndex >= 0 ? 1 : 0,
        }}
        transition={{ duration: animationDuration }}
      >
        {/* 👇 여기에 테두리/빛 효과 코드가 다시 추가되었습니다! */}
        {["top-left", "top-right", "bottom-left", "bottom-right"].map(
          (corner, i) => {
            const baseStyle: React.CSSProperties = {
              position: "absolute",
              width: "1rem",
              height: "1rem",
              border: `3px solid ${borderColor}`,
              filter: `drop-shadow(0px 0px 4px ${glowColor})`,
              borderRadius: 3,
              transition: "none",
            }

            const cornerStyles: Record<string, React.CSSProperties> = {
              "top-left": { top: "-10px", left: "-10px", borderRight: "none", borderBottom: "none" },
              "top-right": { top: "-10px", right: "-10px", borderLeft: "none", borderBottom: "none" },
              "bottom-left": { bottom: "-10px", left: "-10px", borderRight: "none", borderTop: "none" },
              "bottom-right": { bottom: "-10px", right: "-10px", borderLeft: "none", borderTop: "none" },
            }

            return <span key={i} style={{ ...baseStyle, ...cornerStyles[corner] }} />
          }
        )}
      </motion.div>
    </div>
  )
}