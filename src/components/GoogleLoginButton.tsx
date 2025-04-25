import { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {useAuthStore} from '../store/useAuthStore.ts'

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
      const res = await axios.post('http://localhost:5001/api/auth/google', { code });

      const { isExistingMember, token, name, email, phone } = res.data;
      login({ token, name, email, phone });
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
    <button onClick={handleLogin}>
      구글로 로그인하기
    </button>
  );
};

export default GoogleLoginButton;