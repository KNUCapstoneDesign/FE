import React, { useRef, useEffect, useState, FormEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import styles from '../assets/ChatBot.module.css';
import axios from 'axios';

interface ChatBotProps {
  onClose?: () => void;
}

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ onClose }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', content: '안녕하세요! 저는 PLANIT BOT입니다.\n여행지에 대해서 자유롭게 물어봐주세요!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [messages, onClose]);

  const sendMessage = async (question: string) => {
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);
    try {
      // system 메시지 + 이전 대화 모두 포함
      const apiMessages = [
        { role: 'system', content: '' },
        ...messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
        { role: 'user', content: question },
      ];
      const response = await axios.post(
        'https://port-0-planit-mcmt59q6ef387a77.sel5.cloudtype.app/api/chatbot',
        {
          messages: apiMessages,
        }
      );
      // 응답 구조가 다를 경우 대비
      const reply = response.data?.result?.message?.content || response.data?.result || response.data?.message || '죄송합니다, 응답에 실패했어요.';
      setMessages(prev => [...prev, { role: 'bot', content: reply }]);
    } catch (error: any) {
      // 상세 에러 콘솔 출력
      console.error(error?.response?.data || error.message);
      setMessages(prev => [...prev, { role: 'bot', content: '❌ 오류가 발생했습니다.' }]);
    }
    setLoading(false);
  };

  const handleSend = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <span>챗봇</span>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.chatBox}>
          {messages.map((msg, idx) => (
            <div key={idx} className={msg.role === 'bot' ? styles.botMessage : styles.userMessage}>
              {msg.content.split('\n').map((line, i) => (
                <React.Fragment key={i}>{line}<br/></React.Fragment>
              ))}
            </div>
          ))}
          {loading && (
            <div className={styles.botMessage}>답변을 불러오는 중...</div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form className={styles.inputRow} onSubmit={handleSend}>
          <input
            className={styles.input}
            placeholder="메시지를 입력하세요"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            disabled={loading}
          />
          <button type="submit" className={styles.sendBtn} disabled={loading || !input.trim()}>
            {loading ? '전송중...' : '보내기'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;
