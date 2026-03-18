import { useState, useEffect } from 'react';
import type { Address } from '../types';

/**
 * 배송지 관리 페이지
 * PRD 2.6 요구사항 반영
 */
function AddressManagement() {
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    // TODO: API 연동 (GET /members/{id}/addresses)
    const mockAddresses: Address[] = [
      { id: 1, nickname: '우리집', address: '서울시 강남구 역삼동 123-45', zipCode: '06123' },
      { id: 2, nickname: '회사', address: '서울시 서초구 서초동 678-90', zipCode: '06543' }
    ];
    setAddresses(mockAddresses);
  }, []);

  const handleDelete = (id: number) => {
    if (window.confirm('삭제하시겠습니까?')) {
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>배송지 관리</h1>
        <button style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>새 배송지 등록</button>
      </div>

      {addresses.length === 0 ? (
        <p>등록된 배송지가 없습니다.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #000' }}>
              <th style={{ textAlign: 'left', padding: '1rem' }}>별명</th>
              <th style={{ textAlign: 'left', padding: '1rem' }}>주소</th>
              <th style={{ textAlign: 'left', padding: '1rem' }}>우편번호</th>
              <th style={{ textAlign: 'center', padding: '1rem' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map(addr => (
              <tr key={addr.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>{addr.nickname}</td>
                <td style={{ padding: '1rem' }}>{addr.address}</td>
                <td style={{ padding: '1rem' }}>{addr.zipCode}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <button style={{ padding: '0.2rem 0.5rem', cursor: 'pointer' }}>수정</button>
                  <button 
                    onClick={() => handleDelete(addr.id)}
                    style={{ padding: '0.2rem 0.5rem', cursor: 'pointer', marginLeft: '0.5rem', color: '#d00' }}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AddressManagement;
