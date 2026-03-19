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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h1 style={{ margin: 0 }}>배송지 관리</h1>
        <button style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>새 배송지 등록</button>
      </div>

      {addresses.length === 0 ? (
        <p>등록된 배송지가 없습니다.</p>
      ) : (
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {addresses.map(addr => (
            <div
              key={addr.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '0.5rem',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{addr.nickname}</div>
                <div style={{ wordBreak: 'break-word', marginBottom: '0.25rem' }}>{addr.address}</div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>우편번호 {addr.zipCode}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flexShrink: 0 }}>
                <button style={{ padding: '0.35rem 0.75rem', cursor: 'pointer' }}>수정</button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  style={{ padding: '0.35rem 0.75rem', cursor: 'pointer', color: '#d00' }}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AddressManagement;
