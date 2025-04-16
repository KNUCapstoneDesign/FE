import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import styles from '../assets/LoginPage.module.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google'; // 구글 로그인
import { jwtDecode } from 'jwt-decode'; // 구글 토큰 디코딩용

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  interface GooglePayload {
    email: string;
    name: string;
    picture: string;
    sub: string;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email,
        password,
      });

      const { name, token, phone } = response.data; // 서버에서 받은 사용자 정보
      console.log("로그인 성공", response.data.token);
      // 상태 저장
      login({ name, token, email, phone });
      // 로그인 성공 후 마이페이지로 이동
      navigate('/');
    } catch (err) {
      console.error('로그인 실패:', err);
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    console.log("응답 왔다", credentialResponse); // 여기에 출력되는지 확인
    try {
      const { credential } = credentialResponse;
      if (!credential) return;

      let email, name, picture;

      try {
        const decoded = jwtDecode<GooglePayload>(credential);
        email = decoded.email;
        name = decoded.name;
        picture = decoded.picture;
      } catch (err) {
        console.error('JWT 디코딩 오류:', err);
        setError('구글 로그인 중 문제가 발생했습니다.');
        return;  // 디코딩 오류가 나면 이후 로직을 중단
      }

      // 소셜 로그인 전용 백엔드 API 호출 (서버가 처리해줄 수 있어야 함)
      const response = await axios.post('http://localhost:5001/api/auth/google', {
        email,
        name,
        picture,
      });

      const { token, phone } = response.data;

      // 상태 저장
      login({ name, token, email, phone });
      navigate('/');
    } catch (err) {
      console.error('Google 로그인 실패:', err);
      setError('구글 로그인에 실패했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.loginContainer}>
        <h1>Login</h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        <button type="submit">Login</button>

        {error && <p className={styles.error}>{error}</p>}

        <div>
          <Link to='/signup'>회원가입</Link>
        </div>

        <div style={{ marginTop: '20px' }}>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => setError('구글 로그인에 실패했습니다.')}
          />
        </div>
      </div>
    </form>
  );
};

export default LoginPage;
