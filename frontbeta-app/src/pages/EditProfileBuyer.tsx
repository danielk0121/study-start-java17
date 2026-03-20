import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

/**
 * 구매자 회원 정보 수정 페이지 (Prototype)
 */
function EditProfileBuyer() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    name: '홍길동',
    email: 'buyer@example.com',
    phone: '010-1234-5678'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('회원 정보가 수정되었습니다.');
    navigate('/mypage');
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', textAlign: isMobile ? 'center' : 'left' }}>회원 정보 수정 (BUYER)</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>이름</label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})}
            style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc' }} 
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>이메일</label>
          <input 
            type="email" 
            value={formData.email} 
            disabled
            style={{ width: '100%', padding: '0.8rem', border: '1px solid #eee', backgroundColor: '#f9f9f9', color: '#999' }} 
          />
          <small style={{ color: '#999' }}>이메일은 변경할 수 없습니다.</small>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>연락처</label>
          <input 
            type="tel" 
            value={formData.phone} 
            onChange={e => setFormData({...formData, phone: e.target.value})}
            style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc' }} 
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="button" onClick={() => navigate(-1)} style={{ flex: 1, padding: '1rem', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}>취소</button>
          <button type="submit" style={{ flex: 2, padding: '1rem', border: 'none', backgroundColor: '#000', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>수정 완료</button>
        </div>
      </form>
    </div>
  );
}

export default EditProfileBuyer;
