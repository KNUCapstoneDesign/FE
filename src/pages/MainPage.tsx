import styles from '../assets/MainPage.module.css'
import axios from 'axios'
import {useEffect, useState} from "react"

interface Data{
  name: string
}

const MainPage = () => {
  const [data, setData] = useState<Data[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=> {
    axios.get('http://localhost:5001/test-query')  // 백엔드 서버 URL로 변경
      .then(response => {
        setData(response.data);  // 응답 데이터를 상태에 저장
        setLoading(false);  // 로딩 상태를 종료
      })
      .catch(err => {
        setError(err.message);  // 오류 발생 시 오류 메시지 저장
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <div className={styles.mainPage}>
      <h1 className={styles.heading}>메인메인메인메인메인메인메인메인</h1>
      <p className={styles.description}>내용내용내용내용내용내용내용내용내용내용내용내용내용</p>
      <br/>
      <p>{data[0].name}</p>
    </div>
  );
};

export default MainPage;
