import { useNavigate } from 'react-router-dom';

/**
 * 구매자용 내 정보 페이지
 * UC_MEM_01 구현 (Prototype)
 */
function BuyerMyPage() {
  const navigate = useNavigate();

  // Mock 데이터
  const userInfo = {
    name: '김철수',
    email: 'chulsu@example.com',
    role: 'BUYER',
    addressCount: 2,
    orderCount: 5
  };

  return (
    <div>
      <h1>내 정보 (구매자)</h1>
      <div style={{ marginTop: '2rem', border: '1px solid #000', padding: '1.5rem', maxWidth: '600px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            <span style={{ width: '120px', color: '#666' }}>이름</span>
            <strong>{userInfo.name}</strong>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            <span style={{ width: '120px', color: '#666' }}>이메일</span>
            <span>{userInfo.email}</span>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
            <span style={{ width: '120px', color: '#666' }}>권한</span>
            <span style={{ color: '#00d' }}>{userInfo.role}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
          <div onClick={() => navigate('/addresses')} style={{ padding: '1.5rem', border: '1px solid #eee', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>등록 배송지</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{userInfo.addressCount}개</div>
          </div>
          <div onClick={() => navigate('/orders')} style={{ padding: '1.5rem', border: '1px solid #eee', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>주문 내역</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{userInfo.orderCount}건</div>
          </div>
        </div>

        <button style={{ marginTop: '2rem', padding: '0.8rem', width: '100%', border: '1px solid #000', backgroundColor: '#fff', cursor: 'pointer' }}>
          회원 정보 수정
        </button>
      </div>
    </div>
  );
}

export default BuyerMyPage;
