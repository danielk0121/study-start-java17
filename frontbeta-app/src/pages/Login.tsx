import { useState } from 'react';

/**
 * 로그인 페이지
 * PRD 2.2 요구사항 반영
 */
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [failCount, setFailCount] = useState(0);
  const [lockUntil, setLockUntil] = useState<Date | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lockUntil && lockUntil > new Date()) {
      alert(`로그인이 제한된 상태입니다. ${lockUntil.toLocaleTimeString()} 이후에 다시 시도해주세요.`);
      return;
    }

    // 시뮬레이션을 위해 무조건 실패로 처리 (5회 시 잠금)
    const newFailCount = failCount + 1;
    setFailCount(newFailCount);

    if (newFailCount >= 5) {
      const lockTime = new Date();
      lockTime.setMinutes(lockTime.getMinutes() + 10);
      setLockUntil(lockTime);
      alert('5회 로그인 실패로 인해 10분간 로그인이 제한됩니다.');
    } else {
      alert(`로그인 실패 (${newFailCount}/5). 5회 실패 시 10분간 계정이 잠깁니다.`);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h1>로그인</h1>
      {lockUntil && lockUntil > new Date() && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fff0f0', 
          border: '1px solid #ff0000', 
          color: '#d00', 
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          <strong>로그인 시도 제한</strong><br />
          5회 이상 로그인 실패로 인해 서비스 이용이 일시 제한되었습니다.<br />
          잠금 해제 예정 시간: <strong>{lockUntil.toLocaleTimeString()}</strong>
        </div>
      )}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="email" 
          placeholder="이메일" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="비밀번호" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">로그인</button>
      </form>
    </div>
  );
}

export default Login;
