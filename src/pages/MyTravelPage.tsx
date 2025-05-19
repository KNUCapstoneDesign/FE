// src/pages/MyTravelPage.tsx
import React, { useState } from 'react'
import { useMyTravelStore } from '../store/useMyTravelStore'
import styles from '../assets/MyTravelPage.module.css'
import { useNavigate } from 'react-router-dom'
import { FaLocationDot } from 'react-icons/fa6'
import { FaClock } from 'react-icons/fa'
import { IoHome } from 'react-icons/io5'

const MyTravelPage: React.FC = () => {
  const { courses, addCourse, removeCourse, updateCourseTitle } = useMyTravelStore()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedTitle, setEditedTitle] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 6
  const totalPages = Math.max(1, Math.ceil(courses.length / itemsPerPage))
  const paginatedCourses = courses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleAddCourse = () => {
    if (!title || !date) return alert('제목과 날짜를 입력해주세요.')
    addCourse(title, date)
    setTitle('')
    setDate('')
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
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
                      if (e.key === 'Enter') handleSaveTitle(course.id)
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
                      handleSaveTitle(course.id)
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
                      setEditingId(course.id)
                      setEditedTitle(course.title)
                    }}>
                    ✏️
                  </button>
                </div>
              )}
              <span className={styles.date}>{course.date}</span>
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
                  removeCourse(course.id)
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
