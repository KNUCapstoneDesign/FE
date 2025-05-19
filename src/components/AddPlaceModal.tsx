// src/components/AddPlaceModal.tsx
import React, { useState } from 'react'
import { useMyTravelStore, Place } from '../store/useMyTravelStore'
import styles from '../assets/AiSearchPage.module.css'

interface AddPlaceModalProps {
  place: Place
  onClose: () => void
}

const AddPlaceModal: React.FC<AddPlaceModalProps> = ({ place, onClose }) => {
  const { courses, addPlaceToCourse } = useMyTravelStore()
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')

  const handleAdd = () => {
    if (selectedCourseId) {
      addPlaceToCourse(selectedCourseId, place)
      onClose()
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>어느 일정에 추가할까요?</h2>
        {courses.length === 0 ? (
          <p>
            생성된 일정이 없습니다.
            <br />
            먼저 일정을 추가해주세요.
          </p>
        ) : (
          <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className={styles.modalSelect}>
            <option value="">일정을 선택하세요</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title} ({course.date})
              </option>
            ))}
          </select>
        )}
        <div className={styles.modalButtons}>
          <button className={styles.addBtn} onClick={handleAdd} disabled={!selectedCourseId}>
            추가하기
          </button>
          <button className={styles.cancelBtn} onClick={onClose} type="button">
            취소
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddPlaceModal
