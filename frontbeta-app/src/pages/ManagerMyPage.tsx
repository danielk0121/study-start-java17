import { useNavigate } from 'react-router-dom';

/**
 * 판매자용 내 정보 페이지
 * UC_MEM_03 구현 (Prototype) - SELLER는 상점명 및 사업자번호 정보 노출
 */
function ManagerMyPage() {
  const navigate = useNavigate();

  // Mock 데이터
  const sellerInfo = {
    name: '김판매',
    email: 'seller@example.com',
    role: 'SELLER',
    storeName: '먹거리세상',
    businessNumber: '123-45-67890',
    logoEmoji: '🍎'
  };

  return (
    <div>
      <h1>내 정보 (판매자)</h1>
      <div style={{ marginTop: '2rem', border: '1px solid #d00', padding: '1.5rem', maxWidth: '600px', backgroundColor: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1.5rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', border: '1px solid #ddd' }}>
            {sellerInfo.logoEmoji}
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{sellerInfo.storeName}</h2>
            <p style={{ margin: '0.2rem 0 0 0', color: '#666' }}>{sellerInfo.name} 대표님, 안녕하세요!</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            <span style={{ width: '120px', color: '#666' }}>이름</span>
            <strong>{sellerInfo.name}</strong>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            <span style={{ width: '120px', color: '#666' }}>이메일</span>
            <span>{sellerInfo.email}</span>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            <span style={{ width: '120px', color: '#666' }}>권한</span>
            <span style={{ color: '#d00', fontWeight: 'bold' }}>{sellerInfo.role}</span>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            <span style={{ width: '120px', color: '#666' }}>상점명</span>
            <span style={{ fontWeight: 'bold' }}>{sellerInfo.storeName}</span>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            <span style={{ width: '120px', color: '#666' }}>사업자번호</span>
            <span>{sellerInfo.businessNumber}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '2rem' }}>
          <div onClick={() => navigate('/manager/sales')} style={{ padding: '1.5rem', border: '1px solid #eee', textAlign: 'center', cursor: 'pointer', backgroundColor: '#fff5f5' }}>
            <div style={{ fontSize: '0.9rem', color: '#d00' }}>판매 실적 확인</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>전체 판매 내역 바로가기</div>
          </div>
        </div>

        <button style={{ marginTop: '2rem', padding: '0.8rem', width: '100%', border: '1px solid #d00', color: '#d00', backgroundColor: '#fff', cursor: 'pointer' }}>
          판매자 설정 변경
        </button>
      </div>
    </div>
  );
}

export default ManagerMyPage;
