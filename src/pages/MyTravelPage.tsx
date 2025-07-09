// src/pages/MyTravelPage.tsx
import React, { useState, useEffect } from 'react'
import { useMyTravelStore } from '../store/useMyTravelStore'
import styles from '../assets/MyTravelPage.module.css'
import { useNavigate } from 'react-router-dom'
import { FaLocationDot } from 'react-icons/fa6'
import { FaClock } from 'react-icons/fa'
import { IoHome } from 'react-icons/io5'
import { useAuthStore } from '../store/useAuthStore'

const MyTravelPage: React.FC = () => {
  const { courses, addCourse, removeCourse, updateCourseTitle, setCoursesFromDB } = useMyTravelStore()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedTitle, setEditedTitle] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 6
  const totalPages = Math.max(1, Math.ceil(courses.length / itemsPerPage))
  const paginatedCourses = courses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const userId = useAuthStore((state) => state.userId)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const name = useAuthStore((state) => state.name)
  const email = useAuthStore((state) => state.email)

  // ✅ 로그인하지 않은 경우 로그인 페이지로 이동
  useEffect(() => {
    if (!isAuthenticated) {
      alert("로그인 후 이용 가능합니다.")
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  console.log('사용자 정보 - userId:', userId, ', isAuthenticated:', isAuthenticated, ', name:', name, ', email:', email)

  useEffect(() => {
    if (!userId) return
    let isMounted = true

    fetch(`https://port-0-planit-mcmt59q6ef387a77.sel5.cloudtype.app/api/full-schedule?user_id=${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch full schedules')
        return res.json()
      })
      .then(
        (
          schedules: Array<{
            schedule_id: number
            title: string
            start_date: string
            end_date: string
            courses: Array<{
              day: number
              spots: Array<{ place_id: string; contenttypeid: number; sequence: number }>
            }>
          }>,
        ) => {
          const formatted = schedules.map((schedule) => ({
            id: schedule.schedule_id.toString(),
            title: schedule.title,
            startDate: schedule.start_date,
            endDate: schedule.end_date,
            items: (schedule.courses || []).flatMap((course) =>
              (course.spots || [])
                .filter((spot) => spot.place_id)
                .map((spot) => ({
                  placeId: spot.place_id,
                  contentid: parseInt(spot.place_id) || 0,
                  contenttypeid: spot.contenttypeid || 0,
                  title: '',
                  firstimage: '',
                  mapx: 0,
                  mapy: 0,
                  day: `Day ${course.day}`,
                  time: '',
                })),
            ),
          }))
          if (isMounted) {
            setCoursesFromDB(formatted)
          }
        },
      )
      .catch((error) => {
        console.error('Error fetching full schedules:', error)
      })

    return () => {
      isMounted = false
    }
  }, [userId, setCoursesFromDB])

  const handleAddCourse = () => {
    if (!title || !startDate || !endDate) return alert('제목과 날짜를 입력해주세요.')
    addCourse(title, startDate, endDate, userId)
    setTitle('')
    setStartDate('')
    setEndDate('')
  }

  const handleSaveTitle = (id: string) => {
    if (editedTitle.trim()) {
      updateCourseTitle(id, editedTitle.trim())
    }
    setEditingId(null)
    setEditedTitle('')
  }

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <span className={styles.breadcrumbHome} onClick={() => navigate('/')}>
          <IoHome size={18} style={{ verticalAlign: 'middle' }} />
        </span>
        <span className={styles.breadcrumbDivider}>{'>'}</span>
        <span className={styles.breadcrumbCurrent} onClick={() => navigate('/mytravel')}>
          나의 여행
        </span>
      </div>
      <div className={styles.titleFormRow}>
        <h1 className={styles.title}>나의 여행 일정 목록</h1>

        <div className={styles.addForm}>
          <input type="text" placeholder="일정 제목" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <button className={styles.addButton} onClick={handleAddCourse}>
            일정 추가
          </button>
        </div>
      </div>

      <div className={styles.cardGrid}>
        {paginatedCourses.map((course) => (
          <div key={course.id} className={styles.card}>
            <div className={styles.cardHeader}>
              {editingId === course.id ? (
                <div className={styles.titleEditBox}>
                  <input
                    className={styles.editInput}
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle(course.id!)
                      if (e.key === 'Escape') {
                        setEditingId(null)
                        setEditedTitle('')
                      }
                    }}
                  />
                  <button
                    className={styles.saveButton}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSaveTitle(course.id!)
                    }}>
                    저장
                  </button>
                </div>
              ) : (
                <div className={styles.titleEditBox}>
                  <h3 className={styles.cardTitle}>{course.title}</h3>
                  <button
                    className={styles.editButton}
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingId(course.id!)
                      setEditedTitle(course.title)
                    }}>
                    ✏️
                  </button>
                </div>
              )}
              <span className={styles.date}>
                {course.startDate} ~ {course.endDate}
              </span>
            </div>
            <div className={styles.courseInfo}>
              <p className={styles.usetime}>
                <FaClock /> 소요 시간: ?시간
              </p>
              <p className={styles.location}>
                <FaLocationDot /> 장소 {course.items.length}곳
              </p>
            </div>
            <div className={styles.cardActionRow}>
              <button className={styles.viewButton} onClick={() => navigate(`/mytravel/${course.id}`)}>
                일정 보기
              </button>
              <button
                className={styles.removeButton}
                onClick={(e) => {
                  e.stopPropagation()
                  if (window.confirm('정말 이 일정을 삭제하시겠습니까? 삭제하면 복구할 수 없습니다.')) {
                    removeCourse(course.id!)
                  }
                }}>
                일정 삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.pagination}>
        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
          {'<<'}
        </button>
        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          {'<'}
        </button>

        {[...Array(totalPages)].map((_, index) => {
          const page = index + 1
          return (
            <button key={page} className={currentPage === page ? styles.activePage : ''} onClick={() => setCurrentPage(page)}>
              {page}
            </button>
          )
        })}

        <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
          {'>'}
        </button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
          {'>>'}
        </button>
      </div>
    </div>
  )
}

export default MyTravelPage
