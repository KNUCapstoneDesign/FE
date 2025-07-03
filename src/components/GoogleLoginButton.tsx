import { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {useAuthStore} from '../store/useAuthStore.ts'
import styles from '../assets/LoginPage.module.css'

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const {login} = useAuthStore();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
  const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI!;

  const handleLogin = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile&prompt=select_account`;
    window.location.href = authUrl;
  };

  const extractCodeAndSendToBackend = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    console.log('Code from URL:', code);
    if (!code) return;

    try {
      const res = await axios.post('https://port-0-planit-be-mcmt59q6ef387a77.sel5.cloudtype.app/api/auth/google', { code });

      const { isExistingMember, token, name, email, phone, user_id } = res.data;
      login({ userId: user_id, token, name, email, phone });
      localStorage.setItem('token', token);

      if (isExistingMember) {
        navigate('/');
      } else {
        navigate('/signup');
      }

    } catch (err) {
      console.error('구글 로그인 처리 실패:', err);
    }
  };

  useEffect(() => {
    extractCodeAndSendToBackend();
  }, []);

  return (
    <button onClick={handleLogin} className={styles.googleLoginButton}>
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google Logo"
        style={{ width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' }}
      />
      구글로 로그인하기
    </button>
  );
};

export default GoogleLoginButton;
