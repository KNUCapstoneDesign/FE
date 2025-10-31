import React from 'react'
import { useParams } from 'react-router-dom'
import { useMyTravelStore } from '../store/useMyTravelStore'
import styles from '../assets/MyTravelDetailPage.module.css'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import Progressify from '../components/Progressify.tsx'
import { FaList } from "react-icons/fa";

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

    const [placeInfoMap, setPlaceInfoMap] = React.useState<
    Record<number, { title: string; firstimage: string; overview: string }>
  >({})
  // 일자 섹션 스크롤을 위한 ref 맵
  const sectionRefs = React.useRef<Record<string, HTMLDivElement | null>>({})

  const fetchPlaceInfo = async (contentid: number) => {
    try {
      const res = await fetch(
        `${TOUR_BASE}/detailCommon2?serviceKey=${
          import.meta.env.VITE_API_KEY1
        }&MobileOS=ETC&MobileApp=MyApp&contentId=${contentid}&_type=json`,
      )
      const data = await res.json()
      const raw = data.response?.body?.items?.item
      const item = Array.isArray(raw) ? raw[0] : raw
      return {
        title: item?.title || '',
        firstimage: item?.firstimage || '',
        overview: item?.overview || '',
      }
    } catch (err) {
      console.error('TourAPI fetch failed for contentid:', contentid, err)
      return { title: '', firstimage: '', overview: '' }
    }
  }

  React.useEffect(() => {
    const missing = Object.values(days)
      .flat()
      .filter((p) => p.contentid && !placeInfoMap[p.contentid])

    if (!missing.length) return

    const fetchAll = async () => {
      const updates: Record<number, { title: string; firstimage: string; overview: string }> = {}
      await Promise.all(
        missing.map(async (p) => {
          try {
            const info = await fetchPlaceInfo(p.contentid)
            updates[p.contentid] = info
          } catch (e) {
            updates[p.contentid] = { title: '', firstimage: '', overview: '' }
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

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!course) return <div>일정 정보를 찾을 수 없습니다.</div>

  const period = course.startDate && course.endDate ? `${course.startDate} — ${course.endDate}` : '날짜 정보 없음'

  const handleNavClick = (dayKey: string) => {
    setSelectedDay(dayKey)
    // 스무스 스크롤 이동
    window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  const renderDaySection = (dayKey: string) => (
    <div
      key={dayKey}
      ref={(el) => {
        sectionRefs.current[dayKey] = el
      }}
      id={`day-${dayKey}`}
      className={styles.daySection}
    >
      <div className={styles.dayHeaderRow}>
        <h3 className={styles.dayTitle}>{dayKey}</h3>
        <span className={styles.dayCount}>{(days[dayKey] || []).length}곳</span>
      </div>
      <div className={styles.cardsColumn}>
        {(days[dayKey] || [])
          .slice()
          .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
          .map((place) => (
            <div className={styles.placeRowCard} key={place.contentid}>
              <div className={styles.thumbWrap}>
                <img
                  src={placeInfoMap[place.contentid]?.firstimage || '/noimage.jpg'}
                  alt={place.title}
                  className={styles.placeThumb}
                  loading="lazy"
                />
                {!!place.time && <span className={styles.timeBadge}>{place.time}</span>}
              </div>
              <div className={styles.placeMeta}>
                <div className={styles.placeTitleLine}>
                  <div>
                    <strong className={styles.placeTitleText}>
                      {placeInfoMap[place.contentid]?.title || place.title}
                    </strong>
                    {place.groupName && <span className={styles.placeGroup}>{place.groupName}</span>}
                  </div>
                  <button
                    className={styles.detailBtn}
                    onClick={() => navigate(`/detail/${place.contentid}/${place.contenttypeid}`)}
                    type="button"
                  >
                    상세 정보 {'>'}
                  </button>
                </div>
                <p
                  className={styles.placeDescription}
                  dangerouslySetInnerHTML={{ __html: placeInfoMap[place.contentid]?.overview || '' }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  )

  return (
    <div className={styles.outerContainer}>
      <Progressify />
      <main className={styles.mainBox}>
        <div className={styles.headerRow}>
          <div className={styles.headerTitleArea}>
            <h2 className={styles.headerTitle}>{course.title}</h2>
            <div className={styles.headerDate}>{period}</div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.secondaryBtn} type="button" onClick={() => navigate(-1)}>
              <FaList />목록
            </button>
          </div>
        </div>

        <div className={styles.layout}>
          <aside className={styles.sideNav}>
            <div className={styles.sideNavTitle}>일정</div>
            <ul className={styles.sideNavList}>
              {tabKeys.map((dayKey) => (
                <li key={dayKey}>
                  <button
                    type="button"
                    className={`${styles.sideNavItem} ${selectedDay === dayKey ? styles.sideNavItemActive : ''}`}
                    onClick={() => handleNavClick(dayKey)}
                  >
                    {dayKey === allKey ? '전체' : dayKey}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className={styles.contentArea}>
            {selectedDay === allKey ? dayKeys.map((k) => renderDaySection(k)) : renderDaySection(selectedDay)}
          </section>
        </div>
      </main>
    </div>
  )
}

export default MyTravelDetailPage
