import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { Order, OrderStatusHistory } from '../types';
import { useIsMobile } from '../hooks/useIsMobile';

/**
 * 주문 상세 페이지
 * UC_ORD_06 구현 (Prototype - 상태 변경 이력 및 취소 기능 포함)
 */
function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [histories, setHistories] = useState<OrderStatusHistory[]>([]);
  const isMobile = useIsMobile();

  // 상품 ID -> 상품 정보 매핑 (상세용)
  const productInfoMap: Record<number, { name: string, price: number, thumb: string }> = {
    1: { name: '맥북 프로 14인치', price: 2990000, thumb: `${import.meta.env.BASE_URL}assets/sample/macbook.png` },
    2: { name: '아이폰 15 Pro', price: 1550000, thumb: `${import.meta.env.BASE_URL}assets/sample/iphone.png` },
    3: { name: '무선 키보드', price: 89000, thumb: `${import.meta.env.BASE_URL}assets/sample/keyboard.png` },
    4: { name: '린넨 셔츠', price: 49000, thumb: `${import.meta.env.BASE_URL}assets/sample/shirt.png` },
    8: { name: '클린 코드', price: 33000, thumb: `${import.meta.env.BASE_URL}assets/sample/book-clean.png` }
  };

  useEffect(() => {
    // Flyway 샘플 데이터를 기반으로 한 Mock 데이터
    const mockOrders: Order[] = [
      {
        id: 1,
        orderNo: '250902101500001',
        memberId: 2,
        status: 'CONFIRMED',
        shippingNickname: '우리집',
        shippingAddress: '서울시 강남구 역삼동 123-45',
        shippingZipCode: '06123',
        shippingCost: 2500,
        createdAt: '2025-09-02T10:15:00',
        items: [{ productId: 1, quantity: 1 }, { productId: 3, quantity: 2 }]
      },
      {
        id: 105,
        orderNo: '260226130000105',
        memberId: 8,
        status: 'PENDING',
        shippingNickname: undefined, // 별명 없음 표현
        shippingAddress: '서울시 서초구 서초동 678-90',
        shippingZipCode: '06543',
        shippingCost: 3000,
        createdAt: '2026-02-26T13:00:00',
        items: [{ productId: 3, quantity: 1 }]
      }
    ];

    const foundOrder = mockOrders.find(o => o.id === Number(id)) || mockOrders[0];
    setOrder(foundOrder);

    // 상태 변경 이력 Mock
    const mockHistories: OrderStatusHistory[] = [
      { id: 1, status: 'PENDING', createdAt: foundOrder.createdAt }
    ];

    if (foundOrder.status === 'CONFIRMED') {
      mockHistories.push({ id: 2, status: 'CONFIRMED', createdAt: '2025-09-02T14:30:00' });
    } else if (foundOrder.status === 'CANCELLED') {
      mockHistories.push({ id: 2, status: 'CANCELLED', createdAt: new Date().toISOString() });
    }

    setHistories(mockHistories);
  }, [id]);

  const handleCancelOrder = () => {
    if (!order || order.status !== 'PENDING') return;
    if (!window.confirm('정말로 이 주문을 취소하시겠습니까?')) return;

    // TODO: API 연동 (PATCH /orders/{id}/cancel)
    const cancelTime = new Date().toISOString();

    setOrder(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
    setHistories(prev => [
      ...prev,
      { id: prev.length + 1, status: 'CANCELLED', createdAt: cancelTime }
    ]);

    alert('주문이 취소되었습니다.');
  };

  if (!order) return <div>주문 정보를 불러오는 중...</div>;

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
      >
        &lt; 뒤로가기
      </button>

      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? '1rem' : '0',
        borderBottom: '2px solid #000',
        paddingBottom: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '0.5rem' : '1.5rem', alignItems: isMobile ? 'flex-start' : 'baseline' }}>
          <h1 style={{ margin: 0 }}>주문 상세 내역</h1>
          <div style={{ fontSize: '1.1rem' }}>
            주문번호: <strong>{order.orderNo}</strong>
          </div>
        </div>

        {/* 주문 취소 버튼: 항상 노출하되 PENDING 상태일 때만 활성화 */}
        <button
          onClick={handleCancelOrder}
          disabled={order.status !== 'PENDING'}
          style={{
            padding: '0.6rem 1.2rem',
            backgroundColor: order.status === 'PENDING' ? '#fff' : '#eee',
            color: order.status === 'PENDING' ? '#d00' : '#999',
            border: `1px solid ${order.status === 'PENDING' ? '#d00' : '#ccc'}`,
            cursor: order.status === 'PENDING' ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
            alignSelf: isMobile ? 'stretch' : 'auto'
          }}
        >
          주문 취소하기
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: isMobile ? '2rem' : '3rem' }}>
        {/* 왼쪽: 상품 및 배송 정보 */}
        <div>
          <section style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3>주문 상품 정보</h3>
              <span style={{
                padding: '0.2rem 0.6rem',
                border: '1px solid #ccc',
                fontSize: '0.85rem',
                color: order.status === 'CANCELLED' ? '#d00' : '#333',
                backgroundColor: order.status === 'CANCELLED' ? '#fff0f0' : '#f9f9f9'
              }}>
                현재 상태: <strong>{order.status}</strong>
              </span>
            </div>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', minWidth: '280px' }}>
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
                            <div style={{ fontSize: '0.8rem', color: '#999', fontFamily: 'monospace' }}>{item.productId.toString().padStart(8, '0')}</div>
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
            </div>
          </section>

          <section>
            <h3>배송 정보</h3>
            <div style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', marginTop: '1rem' }}>
              {order.shippingNickname && (
                <div style={{ marginBottom: '0.8rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#666', width: '100px', display: 'inline-block' }}>배송지 별명</span>
                  <strong style={{ color: '#000', fontSize: '1.1rem' }}>{order.shippingNickname}</strong>
                </div>
              )}
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
          <h3>주문 진행 상태 (타임라인)</h3>
          <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {histories.map((history, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                  {/* 타임라인 라인 */}
                  {idx !== histories.length - 1 && (
                    <div style={{ position: 'absolute', left: '7px', top: '20px', bottom: '-25px', width: '2px', backgroundColor: '#ddd' }}></div>
                  )}
                  {/* 타임라인 점 */}
                  <div style={{
                    width: '16px', height: '16px', borderRadius: '50%',
                    backgroundColor: history.status === 'CANCELLED' ? '#d00' : (idx === histories.length - 1 ? '#000' : '#ccc'),
                    zIndex: 1, marginTop: '4px'
                  }}></div>
                  {/* 내용 */}
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem', color: history.status === 'CANCELLED' ? '#d00' : '#000' }}>
                      {history.status}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{new Date(history.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '2rem', padding: '1.5rem', borderTop: '2px solid #eee' }}>
            {(() => {
              var itemsTotal = order.items.reduce((acc, item) => acc + (productInfoMap[item.productId]?.price || 0) * item.quantity, 0);
              var grandTotal = itemsTotal + order.shippingCost;
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#555' }}>
                    <span>상품 금액</span>
                    <span>{itemsTotal.toLocaleString()}원</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#555' }}>
                    <span>배송비</span>
                    <span>{order.shippingCost.toLocaleString()}원</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: '0.75rem' }}>
                    <span>총 결제 금액</span>
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                      {grandTotal.toLocaleString()}원
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
