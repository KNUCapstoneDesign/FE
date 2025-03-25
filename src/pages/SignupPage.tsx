import { useState } from 'react';
import styles from '../assets/SignupPage.module.css';
import axios from 'axios';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // 이벤트 파라미터의 타입을 명시적으로 지정
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
            return;
        }
        // 서버로 회원가입 요청
        try {
            const response = await axios.post('http://localhost:5001/api/signup', formData);
            setSuccessMessage(response.data.message);
            setError('');
        } catch (err) {
            setError('회원가입에 실패했습니다.');
            setSuccessMessage('');
        }

    };

    return (
        <div className={styles.signupContainer}>
            <h2>회원가입</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">사용자 이름</label>
                    <input
                        className={styles.inputField}
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">이메일</label>
                    <input
                        className={styles.inputField}
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">비밀번호</label>
                    <input
                        className={styles.inputField}
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword">비밀번호 확인</label>
                    <input
                        className={styles.inputField}
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {successMessage && <p style={{color: 'green'}}>{successMessage}</p>}
                <button type="submit">가입하기</button>
            </form>
        </div>
    );
};

export default SignupPage;
