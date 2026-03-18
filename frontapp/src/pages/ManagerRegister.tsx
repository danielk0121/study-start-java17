import { useState } from 'react';

/**
 * 상품 관리자 회원가입 페이지
 * PRD 2.2 요구사항 반영
 */
function ManagerRegister() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    authCode: ''
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Manager Register attempt:', formData);
    alert('상품 관리자 회원가입 시도 (API 연동 예정)');
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem', border: '1px solid #d00' }}>
      <h1 style={{ color: '#d00' }}>상품 관리자 가입</h1>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>관리자 권한 신청을 위해 정보를 입력하세요.</p>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <input 
          type="email" 
          placeholder="이메일" 
          value={formData.email} 
          onChange={e => setFormData({...formData, email: e.target.value})} 
          required 
        />
        <input 
          type="text" 
          placeholder="이름" 
          value={formData.name} 
          onChange={e => setFormData({...formData, name: e.target.value})} 
          required 
        />
        <input 
          type="password" 
          placeholder="비밀번호" 
          value={formData.password} 
          onChange={e => setFormData({...formData, password: e.target.value})} 
          required 
        />
        <input 
          type="text" 
          placeholder="관리자 인증 코드" 
          value={formData.authCode} 
          onChange={e => setFormData({...formData, authCode: e.target.value})} 
          required 
        />
        <button type="submit" style={{ backgroundColor: '#333', color: 'white', border: 'none', padding: '0.7rem', cursor: 'pointer' }}>
          관리자 가입 신청
        </button>
      </form>
    </div>
  );
}

export default ManagerRegister;
