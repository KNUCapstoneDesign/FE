import React, { useEffect, useState } from 'react'
import styles from '../assets/HotCourses.module.css'
import course1 from '/course1.jpg' // 더미 이미지 (fallback용)

interface TourItem {
  title: string
  addr1: string
  firstimage: string
  contentid: string
}

const TestPage: React.FC = () => {
  const [data, setData] = useState<TourItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    const API_KEY = 'QDd7o7V2yOy4lsip8k6fhzY840oSWvCq6B0BI4laxYy3K%2BkspyAQG1PyClXzCnqYyRqRblnuHKlDENQcyGzhgw%3D%3D'
// .env에서 API 키 로드

    const fetchTourData = async () => {
      try {
        const response = await fetch(
          `https://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=${API_KEY}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=TestApp&_type=json&contentTypeId=12&areaCode=1`,
        )

        console.log('헤더 정보:', response.headers)
        const remaining = response.headers.get('X-RateLimit-Remaining')
        console.log('남은 호출 수:', remaining)

        if (!response.ok) {
          setError('API 호출 실패!')
          return
        }

        const json = await response.json()
        const items = json.response.body.items.item
        setData(items)
      } catch (err) {
        console.error('API 호출 에러:', err)
        setError('API 호출 실패!')
      } finally {
        setLoading(false)
      }
    }

    fetchTourData().catch((error) => {
      console.error('fetchTourData 에러:', error)
    })
  }, [])

  // HotCourses 컴포넌트 정의 (더미 데이터 대신 API 데이터를 사용)
  const HotCourses = () => {
    // API 데이터가 없거나 로딩 중일 경우 대비
    const courses =
      data.length > 0
        ? data.map((item) => ({
          id: item.contentid,
          title: item.title,
          ex: item.addr1 || '주소 정보 없음', // addr1을 설명으로 사용
          image: item.firstimage || course1, // 이미지가 없으면 더미 이미지 사용
        }))
        : [{ id: 1, title: '데이터 없음', ex: 'API 데이터를 불러오지 못했습니다.', image: course1 }]

    return (
      <div className={styles.hotCourses}>
        <h2 className={styles.title}>🔥 핫한 여행 코스</h2>
        <div className={styles.courseList}>
          {courses.map((course) => (
            <div key={course.id} className={styles.courseCard}>
              <img src={course.image} alt={course.title} className={styles.courseImage} />
              <h3>{course.title}</h3>
              <p>{course.ex}</p>
              <button className={styles.detailBtn}>자세히 보기</button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 로딩 및 에러 처리
  if (loading) return <p>불러오는 중...</p>
  if (error) return <p>{error}</p>

  // HotCourses 컴포넌트를 렌더링
  return (
    <div style={{ padding: '20px' }}>
      <h1>📍 Tour API 테스트</h1>
      <HotCourses />
    </div>
  )
}

export default TestPage
