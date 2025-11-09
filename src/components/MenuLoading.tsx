import React, { useEffect, useState } from 'react'
import Lottie from 'lottie-react'

const MenuLoading: React.FC = () => {
  const [animationData, setAnimationData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetch('/PrepareFood.json')
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
    <div style={{ width: 200, margin: '0 auto' }}>
      {!loading && animationData ? (
        <Lottie animationData={animationData} loop />
      ) : (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>로딩 중...</div>
      )}
      <div style={{ textAlign: 'center', marginTop: 12 }}>메뉴 정보를 불러오는 중...</div>
    </div>
  )
}

export default MenuLoading

