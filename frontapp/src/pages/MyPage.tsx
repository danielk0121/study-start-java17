import { useState, useEffect } from 'react';
import type { Address } from '../types';

/**
 * 마이페이지 및 배송지 관리
 * PRD 2.5 요구사항 반영
 */
function MyPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    // 임시 데이터
    const mockAddresses: Address[] = [
      { id: 1, nickname: '우리집', address: '서울시 강남구...', zipCode: '12345' },
      { id: 2, nickname: '회사', address: '서울시 서초구...', zipCode: '54321' }
    ];
    setAddresses(mockAddresses);
  }, []);

  return (
    <div>
      <h1>마이페이지</h1>
      
      <section>
        <h2>내 정보</h2>
        <p>이름: 홍길동</p>
        <p>이메일: user@example.com</p>
        <p>권한: BUYER</p>
      </section>

      <hr />

      <section>
        <h2>배송지 관리</h2>
        <button style={{ marginBottom: '1rem' }}>새 배송지 등록</button>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>별명</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>주소</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>우편번호</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map(addr => (
              <tr key={addr.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{addr.nickname}</td>
                <td style={{ padding: '0.5rem' }}>{addr.address}</td>
                <td style={{ padding: '0.5rem' }}>{addr.zipCode}</td>
                <td style={{ padding: '0.5rem' }}>
                  <button>수정</button>
                  <button style={{ marginLeft: '0.5rem', color: 'red' }}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default MyPage;
