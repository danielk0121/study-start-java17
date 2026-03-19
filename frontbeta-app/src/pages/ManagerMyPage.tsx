import { useNavigate } from 'react-router-dom';

/**
 * 관리자용 내 정보 페이지
 * UC_MEM_02 구현 (Prototype)
 */
function ManagerMyPage() {
  const navigate = useNavigate();

  // Mock 데이터
  const managerInfo = {
    name: '박관리',
    email: 'admin@example.com',
    role: 'MANAGER',
    department: '상품운영팀',
    managedBrands: ['Apple', 'Samsung', 'Sony']
  };

  return (
    <div>
      <h1>내 정보 (관리자)</h1>
      <div style={{ marginTop: '2rem', border: '1px solid #d00', padding: '1.5rem', maxWidth: '600px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            <span style={{ width: '120px', color: '#666' }}>이름</span>
            <strong>{managerInfo.name}</strong>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            <span style={{ width: '120px', color: '#666' }}>이메일</span>
            <span>{managerInfo.email}</span>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            <span style={{ width: '120px', color: '#666' }}>권한</span>
            <span style={{ color: '#d00', fontWeight: 'bold' }}>{managerInfo.role}</span>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            <span style={{ width: '120px', color: '#666' }}>담당 부서</span>
            <span>{managerInfo.department}</span>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>담당 브랜드</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {managerInfo.managedBrands.map(brand => (
              <span key={brand} style={{ padding: '0.3rem 0.8rem', backgroundColor: '#f5f5f5', border: '1px solid #ddd', fontSize: '0.85rem' }}>
                {brand}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginTop: '2rem' }}>
          <div onClick={() => navigate('/manager/sales')} style={{ padding: '1.5rem', border: '1px solid #eee', textAlign: 'center', cursor: 'pointer', backgroundColor: '#fff5f5' }}>
            <div style={{ fontSize: '0.9rem', color: '#d00' }}>판매 실적 확인</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>전체 판매 내역 바로가기</div>
          </div>
        </div>

        <button style={{ marginTop: '2rem', padding: '0.8rem', width: '100%', border: '1px solid #d00', color: '#d00', backgroundColor: '#fff', cursor: 'pointer' }}>
          관리자 설정 변경
        </button>
      </div>
    </div>
  );
}

export default ManagerMyPage;
