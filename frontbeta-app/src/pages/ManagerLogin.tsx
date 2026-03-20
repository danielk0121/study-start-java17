import { useState } from 'react';

/**
 * 상품 관리자 로그인 페이지
 * PRD 2.2 요구사항 반영
 */
function ManagerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Manager Login attempt:', { email, password });
    alert('상품 관리자 로그인 시도 (API 연동 예정)');
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem', border: '1px solid #d00' }}>
      <h1 style={{ color: '#d00' }}>상품 관리자 로그인</h1>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>관리자 계정으로 로그인하세요.</p>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <input 
          type="email" 
          placeholder="관리자 이메일" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          style={{ padding: '0.8rem', border: '1px solid #ccc' }}
        />
        <input 
          type="password" 
          placeholder="비밀번호" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          style={{ padding: '0.8rem', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ backgroundColor: '#d00', color: 'white', border: 'none', padding: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
          관리자 로그인
        </button>
      </form>
    </div>
  );
}

export default ManagerLogin;
