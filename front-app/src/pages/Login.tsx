import { useState } from 'react';

/**
 * 로그인 페이지
 * PRD 2.2 요구사항 반영
 */
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    alert('로그인 시도 (API 연동 예정)');
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h1>로그인</h1>
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
