// src/pages/TestPage.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../assets/HotCourses.module.css'
import course1 from '/course1.jpg' // 더미 이미지 (fallback용)

interface TourItem {
  contentid: string
  title: string
  addr1: string
  firstimage?: string
}

const TestPage: React.FC = () => {
  const [data, setData] = useState<TourItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const API_KEY = import.meta.env.VITE_API_KEY1

  useEffect(() => {
    const fetchTourData = async () => {
      try {
        const res = await fetch(
          `https://apis.data.go.kr/B551011/KorService1/areaBasedList1?` +
            `serviceKey=${API_KEY}` +
            `&numOfRows=10` +
            `&pageNo=1` +
            `&MobileOS=ETC` +
            `&MobileApp=TestApp` +
            `&_type=json` +
            `&contentTypeId=25` + // 여행코스만
            `&areaCode=1`,
        )
        if (!res.ok) {
          throw new Error('API 호출 실패')
        }
        const json = await res.json()
        const items = json.response.body.items.item as TourItem | TourItem[] | undefined
        const arr = items ? (Array.isArray(items) ? items : [items]) : []
        setData(arr)
      } catch (e) {
        console.error(e)
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    fetchTourData()
  }, [API_KEY])

  // 데이터 중 랜덤 3개만
  const sample3 = React.useMemo(() => {
    if (data.length <= 3) return data
    // shuffle copy
    return [...data].sort(() => Math.random() - 0.5).slice(0, 3)
  }, [data])

  if (loading) return <p>불러오는 중...</p>
  if (error) return <p>에러 발생: {error}</p>

  return (
    <div style={{ padding: 20 }}>
      <h1 className={styles.courseh1}>🌟 이런 여행 코스는 어떠세요?</h1>
      <div className={styles.hotCourses}>
        <div className={styles.courseList}>
          {sample3.map((course) => (
            <div key={course.contentid} className={styles.courseCard}>
              <img src={course.firstimage || course1} alt={course.title} className={styles.courseImage} />
              <h3>{course.title}</h3>
              <p>{course.addr1 || '주소 정보 없음'}</p>
              <button
                className={styles.detailBtn}
                onClick={() => navigate(`/detail/${course.contentid}/25`)} // typeid=25
              >
                자세히 보기
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TestPage
