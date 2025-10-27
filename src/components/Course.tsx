// src/pages/Course.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../assets/Course.module.css'
import course1 from '/course1.jpg'
import SeeMoreButton from './SeeMoreButton.tsx' // 더미 이미지 (fallback용)

interface TourItem {
  contentid: string
  title: string
  addr1: string
  firstimage?: string
}

const AREA_LIST = [
  { code: '1', name: '서울' },
  { code: '2', name: '인천' },
  { code: '3', name: '대전' },
  { code: '4', name: '대구' },
  { code: '5', name: '광주' },
  { code: '6', name: '부산' },
  { code: '7', name: '울산' },
  { code: '8', name: '세종' },
  { code: '31', name: '경기' },
  { code: '32', name: '강원' },
  { code: '33', name: '충북' },
  { code: '34', name: '충남' },
  { code: '35', name: '경북' },
  { code: '36', name: '경남' },
  { code: '37', name: '전북' },
  { code: '38', name: '전남' },
  { code: '39', name: '제주' },
]

/* 균등 셔플 (Fisher–Yates) */
function shuffle<T>(arr: T[]) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const Course: React.FC = () => {
  const [data, setData] = useState<TourItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCount, setShowCount] = useState(8)
  const navigate = useNavigate()
  const API_KEY = import.meta.env.VITE_API_KEY1
  const TOUR_BASE = '/api/tour'; // 프록시 사용

  useEffect(() => {
    const fetchTourData = async () => {
      try {
        // 랜덤으로 3개 지역 선택
        const shuffledAreas = shuffle(AREA_LIST).slice(0, 3)
        let all: TourItem[] = []
        for (const area of shuffledAreas) {
          const url =
            `${TOUR_BASE}/areaBasedList2?` +
            `serviceKey=${API_KEY}` +
            `&numOfRows=20` + // 각 지역당 20개로 줄임
            `&pageNo=1` +
            `&MobileOS=ETC` +
            `&MobileApp=TestApp` +
            `&_type=json` +
            `&contentTypeId=25` +
            `&areaCode=${area.code}`
          const res = await fetch(url)
          if (!res.ok) throw new Error('API 호출 실패')
          const json = await res.json()
          const items = json.response.body.items.item as TourItem | TourItem[] | undefined
          const arr = items ? (Array.isArray(items) ? items : [items]) : []
          all = all.concat(arr)
        }
        setData(all)
      } catch (e) {
        console.error(e)
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    fetchTourData()
  }, [API_KEY])

  // 데이터 전체 셔플 (랜덤 순서)
  const shuffledData = React.useMemo(() => {
    if (data.length <= 1) return data
    const arr = [...data]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [data])

  if (loading) return <p>불러오는 중...</p>
  if (error) return <p>에러 발생: {error}</p>

  return (
    <div style={{ paddingTop: 50, paddingLeft: 100, paddingRight: 100 , backgroundColor: '#ffffff' }}>
      <h1 className={styles.courseh1}>떠오르는 여행 코스</h1>
      <div className={styles.hotCourses}>
        <div className={styles.courseList}>
          {shuffledData.slice(0, showCount).map((course) => (
            <div key={course.contentid} className={styles.courseCard} onClick={() => navigate(`/detail/${course.contentid}/25`)} style={{ cursor: 'pointer' }}>
              <img src={course.firstimage || course1} alt={course.title} className={styles.courseImage} />
              <h3>{course.title}</h3>
            </div>
          ))}
        </div>
        {shuffledData.length > showCount && (
          <SeeMoreButton onClick={() => setShowCount((prev) => prev + 8)} />
        )}
      </div>
    </div>
  )
}

export default Course
