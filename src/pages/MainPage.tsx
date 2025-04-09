import styles from '../assets/MainPage.module.css'
import Hero from '../components/Hero'
import mainpic from '/mainpic.jpg'
import HotCourses from '../components/HotCourses'

const MainPage = () => {

  return (
    <div>
      <div className={styles.mainPage}>
        <Hero mainpic={mainpic} />
        <HotCourses />
        <h1 className={styles.heading}>메인메인메인메인메인메인메인메인</h1>
        <p className={styles.description}>내용내용내용내용내용내용내용내용내용내용내용내용내용</p>
        <br />
      </div>
      <div className={styles.HotCourseContainer}></div>
    </div>
  )
}

export default MainPage
