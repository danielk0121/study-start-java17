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
      { id: 1, nickname: '우리집', address: '서울시 강남구 역삼동 123-45', zipCode: '06123', phoneNumber: '010-1234-5678', isDefault: true },
      { id: 2, nickname: '회사', address: '서울시 서초구 서초동 678-90', zipCode: '06543', phoneNumber: '02-555-9876', isDefault: false },
      { id: 3, nickname: '친구집', address: '경기도 성남시 분당구 정자동 11-22', zipCode: '13561', phoneNumber: '010-9999-8888', isDefault: false },
      { id: 4, nickname: '본가', address: '부산시 해운대구 우동 101호', zipCode: '48058', phoneNumber: '051-123-4567', isDefault: false },
      { id: 5, nickname: '처가', address: '광주시 북구 용봉동 202호', zipCode: '61186', phoneNumber: '062-987-6543', isDefault: false },
      { id: 6, nickname: '운동센터', address: '서울시 송파구 잠실동 스포츠콤플렉스', zipCode: '05551', phoneNumber: '010-1111-2222', isDefault: false },
      { id: 7, nickname: '스터디카페', address: '서울시 마포구 노고산동 10-5', zipCode: '04104', phoneNumber: '010-3333-4444', isDefault: false },
      { id: 8, nickname: '자취방', address: '서울시 관악구 신림동 99-88', zipCode: '08821', phoneNumber: '010-5555-6666', isDefault: false },
      { id: 9, nickname: '비밀장소', address: '제주도 서귀포시 안덕면 777', zipCode: '63529', phoneNumber: '010-7777-8888', isDefault: false },
      { id: 10, nickname: '작업실', address: '서울시 성동구 성수동 1가 22-33', zipCode: '04778', phoneNumber: '010-0000-1111', isDefault: false },
      { id: 11, nickname: '카페', address: '서울시 종로구 가회동 삼청로 15', zipCode: '03053', phoneNumber: '010-2222-3333', isDefault: false },
      { id: 12, nickname: '도서관', address: '서울시 서초구 반포대로 201', zipCode: '06579', phoneNumber: '02-123-4567', isDefault: false }
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 'bold' }}>{addr.nickname}</span>
                  {addr.isDefault && (
                    <span style={{ fontSize: '0.65rem', backgroundColor: '#000', color: '#fff', padding: '0.1rem 0.3rem', borderRadius: '2px' }}>기본배송지</span>
                  )}
                </div>
                <div style={{ wordBreak: 'break-word', marginBottom: '0.25rem' }}>{addr.address}</div>
                <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.15rem' }}>우편번호 {addr.zipCode}</div>
                <div style={{ color: '#333', fontSize: '0.9rem', fontWeight: 500 }}>연락처: {addr.phoneNumber}</div>
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
