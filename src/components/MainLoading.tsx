import React, { useEffect, useState } from 'react'
import Lottie from 'lottie-react'

const MainLoading: React.FC = () => {
  const [animationData, setAnimationData] = useState<object | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetch('/Earth.json')
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return
        setAnimationData(json)
      })
      .catch((err) => console.error('Lottie json 로드 실패:', err))
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div style={{ width: 220, margin: 'auto' }}>
      {!loading && animationData ? (
        <Lottie animationData={animationData} loop />
      ) : (
        <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>로딩 중...</div>
      )}
      <div style={{ textAlign: 'center', marginTop: 12 }}>페이지를 준비하는 중...</div>
    </div>
  )
}

export default MainLoading
