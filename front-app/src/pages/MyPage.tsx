import { Link } from 'react-router-dom';

/**
 * 마이페이지 (내 정보 화면)
 * PRD 2.6 요구사항 반영
 */
function MyPage() {
  // TODO: 실제 API 연동 (GET /members/me)
  const user = {
    name: '홍길동',
    email: 'user@example.com',
    role: 'BUYER'
  };

  return (
    <div>
      <h1>마이페이지</h1>
      
      <section style={{ border: '1px solid #000', padding: '1.5rem', marginBottom: '2rem' }}>
        <h2>내 정보</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.5rem' }}>
          <span style={{ fontWeight: 'bold' }}>이름:</span>
          <span>{user.name}</span>
          <span style={{ fontWeight: 'bold' }}>이메일:</span>
          <span>{user.email}</span>
          <span style={{ fontWeight: 'bold' }}>권한:</span>
          <span>{user.role}</span>
        </div>
      </section>

      <section style={{ display: 'flex', gap: '1rem' }}>
        <Link 
          to="/orders" 
          style={{ 
            flex: 1, 
            padding: '1.5rem', 
            border: '1px solid #000', 
            textDecoration: 'none', 
            color: '#000',
            textAlign: 'center'
          }}
        >
          <h3>주문 내역 조회</h3>
          <p>내 주문 목록을 확인합니다.</p>
        </Link>

        <Link 
          to="/addresses" 
          style={{ 
            flex: 1, 
            padding: '1.5rem', 
            border: '1px solid #000', 
            textDecoration: 'none', 
            color: '#000',
            textAlign: 'center'
          }}
        >
          <h3>배송지 관리</h3>
          <p>등록된 배송지를 관리합니다.</p>
        </Link>
      </section>
    </div>
  );
}

export default MyPage;
