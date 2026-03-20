import { useState } from 'react';

/**
 * 회원가입 페이지
 * PRD 2.2 요구사항 반영
 */
function Register() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: ''
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register attempt:', formData);
    alert('회원가입 시도 (API 연동 예정)');
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h1>회원가입</h1>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="email" 
          placeholder="이메일" 
          value={formData.email} 
          onChange={e => setFormData({...formData, email: e.target.value})} 
          required 
          style={{ padding: '0.8rem', border: '1px solid #ccc' }}
        />
        <input 
          type="text" 
          placeholder="이름" 
          value={formData.name} 
          onChange={e => setFormData({...formData, name: e.target.value})} 
          required 
          style={{ padding: '0.8rem', border: '1px solid #ccc' }}
        />
        <input 
          type="password" 
          placeholder="비밀번호" 
          value={formData.password} 
          onChange={e => setFormData({...formData, password: e.target.value})} 
          required 
          style={{ padding: '0.8rem', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '1rem', border: 'none', backgroundColor: '#000', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>가입하기</button>
      </form>
    </div>
  );
}

export default Register;
