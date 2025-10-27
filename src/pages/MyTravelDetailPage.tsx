import React from 'react'
import { useParams } from 'react-router-dom'
import { useMyTravelStore } from '../store/useMyTravelStore'
import styles from '../assets/MyTravelDetailPage.module.css'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import Progressify from '../components/Progressify.tsx'

const MyTravelDetailPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { courses } = useMyTravelStore()
  const userId = useAuthStore((state) => state.userId)
  console.log('[MyTravelDetailPage] userId:', userId)
  const course = courses.find((c) => c.id === id)
  const TOUR_BASE = '/api/tour'; // 프록시 사용

  const days = React.useMemo(() => {
    if (!course) return {}
    return course.items.reduce<{ [day: string]: typeof course.items }>((acc, item) => {
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
  }, [course])

  const [placeInfoMap, setPlaceInfoMap] = React.useState<Record<number, { title: string; firstimage: string }>>({})

  const fetchPlaceInfo = async (contentid: number) => {
    try {
      const res = await fetch(`${TOUR_BASE}/detailCommon2?serviceKey=${import.meta.env.VITE_API_KEY1}&MobileOS=ETC&MobileApp=MyApp&contentId=${contentid}&_type=json`)
      const data = await res.json()
      const raw = data.response?.body?.items?.item
      const item = Array.isArray(raw) ? raw[0] : raw
      return {
        title: item?.title || '',
        firstimage: item?.firstimage || '',
      }
    } catch (err) {
      console.error('TourAPI fetch failed for contentid:', contentid, err)
      return { title: '', firstimage: '' }
    }
  }

  React.useEffect(() => {
    const missing = Object.values(days)
      .flat()
      .filter((p) => p.contentid && !placeInfoMap[p.contentid])

    if (!missing.length) return

    const fetchAll = async () => {
      const updates: Record<number, { title: string; firstimage: string }> = {}
      await Promise.all(
        missing.map(async (p) => {
          try {
            const info = await fetchPlaceInfo(p.contentid)
            updates[p.contentid] = info
          } catch (e) {
            updates[p.contentid] = { title: '', firstimage: '' }
          }
        }),
      )
      setPlaceInfoMap((prev) => ({ ...prev, ...updates }))
    }

    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days])

  const dayKeys = Object.keys(days).sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, ''), 10)
    const numB = parseInt(b.replace(/[^0-9]/g, ''), 10)
    return numA - numB
  })
  const allKey = 'All'
  const tabKeys = [allKey, ...dayKeys]
  const [selectedDay, setSelectedDay] = React.useState<string>(tabKeys[0] || '')

  React.useEffect(() => {
    if (!selectedDay || !tabKeys.includes(selectedDay)) {
      setSelectedDay(tabKeys[0] || '')
    }
    // eslint-disable-next-line
  }, [tabKeys.join(',')])

  if (!course) return <div>일정 정보를 찾을 수 없습니다.</div>

  const period = course.startDate && course.endDate ? `${course.startDate} — ${course.endDate}` : '날짜 정보 없음'

  return (
    <div className={styles.outerContainer}>
      <Progressify />
      <main className={styles.mainBox}>
        <div className={styles.titleSection}>
          <h2 className={styles.mainTitle}>{course.title}</h2>
          <div className={styles.dateRange}>{period}</div>
        </div>
        <div className={styles.dayTabWrapper}>
          {tabKeys.map((dayKey) => (
            <button key={dayKey} className={`${styles.dayTabBtn} ${selectedDay === dayKey ? styles.activeDayTab : ''}`}
                    onClick={() => setSelectedDay(dayKey)} type="button">
              {dayKey === allKey ? 'All' : dayKey}
            </button>
          ))}
        </div>
        <div className={styles.timelineSection}>
          <div className={styles.timeline}>
            <div className={styles.verticalLine} />
            <div className={styles.dayCards}>
              {selectedDay === allKey ? (
                dayKeys.map((dayKey) => (
                  <div className={styles.dayGroup} key={dayKey}>
                    <div className={styles.dayBadge}>{dayKey}</div>
                    <div className={styles.cardsWrapper}>
                      {(days[dayKey] || [])
                        .slice()
                        .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                        .map((place) => (
                          <div className={styles.placeCard} key={place.contentid}>
                            <div className={styles.placeCardImageWrap}>
                              <img src={placeInfoMap[place.contentid]?.firstimage || '/noimage.jpg'} alt={place.title}
                                   className={styles.placeCardImage} />
                            </div>
                            <div className={styles.placeCardContent}>
                              <div className={styles.placeTitleRow}>
                                <div>
                                  <strong
                                    className={styles.placeTitle}>{placeInfoMap[place.contentid]?.title || place.title}</strong>
                                  {place.groupName && <span className={styles.placeGroup}>{place.groupName}</span>}
                                </div>
                                <button className={styles.detailBtn}
                                        onClick={() => navigate(`/detail/${place.contentid}/${place.contenttypeid}`)}>
                                  상세 정보 {'>'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.dayGroup}>
                  <div className={styles.dayBadge}>{selectedDay}</div>
                  <div className={styles.cardsWrapper}>
                    {(days[selectedDay] || [])
                      .slice()
                      .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                      .map((place) => (
                        <div className={styles.placeCard} key={place.contentid}>
                          <div className={styles.placeCardImageWrap}>
                            <img src={placeInfoMap[place.contentid]?.firstimage || '/noimage.jpg'} alt={place.title}
                                 className={styles.placeCardImage} />
                          </div>
                          <div className={styles.placeCardContent}>
                            <div className={styles.placeTitleRow}>
                              <div>
                                <strong
                                  className={styles.placeTitle}>{placeInfoMap[place.contentid]?.title || place.title}</strong>
                                {place.groupName && <span className={styles.placeGroup}>{place.groupName}</span>}
                              </div>
                              <button className={styles.detailBtn}
                                      onClick={() => navigate(`/detail/${place.contentid}/${place.contenttypeid}`)}>
                                상세 정보 {'>'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <button className={styles.fabBtn}>+ 여행지 추가</button>
    </div>
  )
}

export default MyTravelDetailPage
