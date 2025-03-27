import styles from '../assets/HotCourses.module.css'
import course1 from '/course1.jpg' // 더미 이미지
import course2 from '/course2.jpg'
import course3 from '/course3.jpg'

/* 더미데이터 */ const HotCourses = () => {
  const courses = [
    { id: 1, title: '서울 3일 완벽 코스', ex: '역사와 현대가 공존하는 서울의 매력을 만나보세요', image: course1 },
    { id: 2, title: '부산 바다 여행', ex: '해운대부터 광안리까지 완벽한 부산 코스', image: course2 },
    { id: 3, title: '경주 역사 탐방', ex: '코스3 간단한 천년 고도의 역사를 따라가는 완벽 코스', image: course3 },
  ]

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

export default HotCourses
