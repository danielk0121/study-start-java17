import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { Order, OrderStatusHistory } from '../types';

/**
 * 주문 상세 페이지
 * UC_ORD_06 구현 (Prototype - 상태 변경 이력 포함)
 */
function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [histories, setHistories] = useState<OrderStatusHistory[]>([]);

  // 상품 ID -> 상품 정보 매핑 (상세용)
  const productInfoMap: Record<number, { name: string, price: number, thumb: string }> = {
    1: { name: '맥북 프로 14인치', price: 2990000, thumb: 'https://via.placeholder.com/100x100?text=MBP' },
    2: { name: '아이폰 15 Pro', price: 1550000, thumb: 'https://via.placeholder.com/100x100?text=iPhone' },
    3: { name: '무선 키보드', price: 89000, thumb: 'https://via.placeholder.com/100x100?text=KBD' },
    4: { name: '린넨 셔츠', price: 49000, thumb: 'https://via.placeholder.com/100x100?text=Shirt' },
    8: { name: '클린 코드', price: 33000, thumb: 'https://via.placeholder.com/100x100?text=Book' }
  };

  useEffect(() => {
    // Flyway 샘플 데이터를 기반으로 한 Mock 데이터
    const mockOrders: Order[] = [
      {
        id: 1,
        orderNo: '250902101500001',
        memberId: 2,
        status: 'CONFIRMED',
        shippingAddress: '서울시 강남구 역삼동 123-45',
        shippingZipCode: '06123',
        createdAt: '2025-09-02T10:15:00',
        items: [{ productId: 1, quantity: 1 }, { productId: 3, quantity: 2 }]
      }
    ];

    const foundOrder = mockOrders.find(o => o.id === Number(id)) || mockOrders[0];
    setOrder(foundOrder);

    // 상태 변경 이력 Mock
    const mockHistories: OrderStatusHistory[] = [
      { id: 1, status: 'PENDING', createdAt: '2025-09-02T10:15:00' },
      { id: 2, status: 'CONFIRMED', createdAt: '2025-09-02T14:30:00' }
    ];
    setHistories(mockHistories);
  }, [id]);

  if (!order) return <div>주문 정보를 불러오는 중...</div>;

  return (
    <div>
      <button 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
      >
        &lt; 뒤로가기
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1>주문 상세 내역</h1>
        <div style={{ fontSize: '1.1rem' }}>
          주문번호: <strong>{order.orderNo}</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
        {/* 왼쪽: 상품 및 배송 정보 */}
        <div>
          <section style={{ marginBottom: '3rem' }}>
            <h3>주문 상품 정보</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                  <th style={{ padding: '1rem 0' }}>상품정보</th>
                  <th style={{ padding: '1rem 0', textAlign: 'right' }}>수량</th>
                  <th style={{ padding: '1rem 0', textAlign: 'right' }}>금액</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => {
                  const info = productInfoMap[item.productId];
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <td style={{ padding: '1rem 0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <img src={info?.thumb} alt={info?.name} style={{ width: '50px', height: '50px', objectFit: 'cover', border: '1px solid #eee' }} />
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#999' }}>#{item.productId}</div>
                          <div style={{ fontWeight: 'bold' }}>{info?.name || '알 수 없는 상품'}</div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>{item.quantity}개</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                        {( (info?.price || 0) * item.quantity ).toLocaleString()}원
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <section>
            <h3>배송 정보</h3>
            <div style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', marginTop: '1rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#666', width: '100px', display: 'inline-block' }}>배송 주소</span>
                <span>{order.shippingAddress}</span>
              </div>
              <div>
                <span style={{ color: '#666', width: '100px', display: 'inline-block' }}>우편번호</span>
                <span>{order.shippingZipCode}</span>
              </div>
            </div>
          </section>
        </div>

        {/* 오른쪽: 주문 상태 타임라인 */}
        <div>
          <h3>주문 진행 상태</h3>
          <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {histories.map((history, idx) => (
                <div key={history.id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                  {/* 타임라인 라인 */}
                  {idx !== histories.length - 1 && (
                    <div style={{ position: 'absolute', left: '7px', top: '20px', bottom: '-25px', width: '2px', backgroundColor: '#ddd' }}></div>
                  )}
                  {/* 타임라인 점 */}
                  <div style={{ 
                    width: '16px', height: '16px', borderRadius: '50%', 
                    backgroundColor: idx === histories.length - 1 ? '#000' : '#ccc',
                    zIndex: 1, marginTop: '4px'
                  }}></div>
                  {/* 내용 */}
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{history.status}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{new Date(history.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', padding: '1.5rem', borderTop: '2px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>총 주문 금액</span>
              <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                {order.items.reduce((acc, item) => acc + (productInfoMap[item.productId]?.price || 0) * item.quantity, 0).toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
