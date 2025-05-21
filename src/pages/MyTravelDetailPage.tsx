import React from 'react'
import { useParams } from 'react-router-dom'
import { useMyTravelStore } from '../store/useMyTravelStore'
import styles from '../assets/MyTravelDetailPage.module.css'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

const MyTravelDetailPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { courses } = useMyTravelStore()
  const userId = useAuthStore((state) => state.userId)
  console.log('[MyTravelDetailPage] userId:', userId)
  const course = courses.find((c) => c.id === id)

  // course가 없어도 항상 선언
  const days = course
    ? course.items.reduce<{ [day: string]: typeof course.items }>((acc, item) => {
        const dayKey = item.day || 'Day 1'
        if (!acc[dayKey]) acc[dayKey] = []
        acc[dayKey].push({
          ...item,
          title: item.title || '',
          firstimage: item.firstimage || '',
          contentid: typeof item.placeId === 'string' ? parseInt(item.placeId) || 0 : item.contentid || 0,
          time: item.time || '',
          contenttypeid: item.contenttypeid || 0,
        })
        return acc
      }, {})
    : {}

  // 숫자 기준으로 오름차순 정렬
  const dayKeys = Object.keys(days).sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, ''), 10)
    const numB = parseInt(b.replace(/[^0-9]/g, ''), 10)
    return numA - numB
  })
  // useState는 항상 첫 렌더링 때만 dayKeys[0]을 씁니다
  const [selectedDay, setSelectedDay] = React.useState<string>(dayKeys[0] || '')

  // dayKeys가 바뀌어서 selectedDay가 더 이상 없을 때만 리셋
  React.useEffect(() => {
    if (!selectedDay || !dayKeys.includes(selectedDay)) {
      setSelectedDay(dayKeys[0] || '')
    }
    // eslint-disable-next-line
  }, [dayKeys.join(',')]) // dayKeys가 바뀔 때만

  if (!course) return <div>일정 정보를 찾을 수 없습니다.</div>

  const period = course.startDate && course.endDate ? `${course.startDate} — ${course.endDate}` : '날짜 정보 없음'

  return (
    <div className={styles.outerContainer}>
      <main className={styles.mainBox}>
        <div className={styles.titleSection}>
          <h2 className={styles.mainTitle}>{course.title}</h2>
          <div className={styles.dateRange}>{period}</div>
        </div>
        <div className={styles.dayTabWrapper}>
          {dayKeys.map((dayKey) => (
            <button key={dayKey} className={`${styles.dayTabBtn} ${selectedDay === dayKey ? styles.activeDayTab : ''}`} onClick={() => setSelectedDay(dayKey)} type="button">
              {dayKey}
            </button>
          ))}
        </div>
        <div className={styles.timelineSection}>
          <div className={styles.timeline}>
            <div className={styles.verticalLine} />
            <div className={styles.dayCards}>
              <div className={styles.dayGroup}>
                <div className={styles.dayBadge}>{selectedDay}</div>
                <div className={styles.cardsWrapper}>
                  {days[selectedDay]
                    ?.slice()
                    .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                    .map((place) => (
                      <div className={styles.placeCard} key={place.contentid}>
                        <div className={styles.placeCardImageWrap}>
                          <img src={place.firstimage || '/noimage.jpg'} alt={place.title} className={styles.placeCardImage} />
                          <span className={styles.placeTime}>{place.time || '시간 정보 없음'}</span>
                        </div>
                        <div className={styles.placeCardContent}>
                          <div className={styles.placeTitleRow}>
                            <div>
                              <strong className={styles.placeTitle}>{place.title}</strong>
                              {place.groupName && <span className={styles.placeGroup}>{place.groupName}</span>}
                            </div>
                            <button className={styles.detailBtn} onClick={() => navigate(`/detail/${place.contentid}/${place.contenttypeid}`)}>
                              상세 정보 {'>'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <button className={styles.fabBtn}>+ 여행지 추가</button>
    </div>
  )
}

export default MyTravelDetailPage
