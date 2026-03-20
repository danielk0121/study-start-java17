import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

/**
 * 판매자 정보 수정 페이지 (Prototype)
 */
function EditProfileSeller() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    name: '김판매',
    email: 'seller@example.com',
    storeName: '애플공식몰',
    businessNo: '123-45-67890',
    description: '혁신적인 기술과 디자인의 애플 공식 판매 상점입니다.'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('판매자 정보가 수정되었습니다.');
    navigate('/manager/mypage');
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', textAlign: isMobile ? 'center' : 'left', color: '#d00' }}>판매자 정보 수정 (SELLER)</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>이름 (대표자)</label>
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
        </div>
        <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>상점 정보</h3>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>상점명</label>
            <input 
              type="text" 
              value={formData.storeName} 
              onChange={e => setFormData({...formData, storeName: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc' }} 
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>사업자 등록번호</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={formData.businessNo} 
                onChange={e => setFormData({...formData, businessNo: e.target.value})}
                style={{ flex: 1, padding: '0.8rem', border: '1px solid #ccc' }} 
              />
              <button 
                type="button" 
                onClick={() => alert('사업자 인증이 완료되었습니다.')}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                인증하기
              </button>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>상점 설명</label>
            <textarea 
              rows={4}
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', resize: 'vertical' }} 
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="button" onClick={() => navigate(-1)} style={{ flex: 1, padding: '1rem', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer' }}>취소</button>
          <button type="submit" style={{ flex: 2, padding: '1rem', border: 'none', backgroundColor: '#d00', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>수정 완료</button>
        </div>
      </form>
    </div>
  );
}

export default EditProfileSeller;
