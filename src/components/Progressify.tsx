// src/components/Progressify.tsx
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Props {
  barColor?: string
  containerColor?: string
}

export default function Progressify({ barColor = '#277aff', containerColor = '#F2F2F2' }: Props) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(scrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: '100px', // Nav 높이
        left: 0,
        width: '100%',
        height: 6,
        backgroundColor: containerColor,
        zIndex: 999, // 모달 오버레이 아래로
        pointerEvents: 'none',
      }}>
      <motion.div
        style={{
          height: '100%',
          backgroundColor: barColor,
          width: `${progress}%`,
        }}
        transition={{ ease: 'easeOut', duration: 0.15 }}
      />
    </motion.div>
  )
}
