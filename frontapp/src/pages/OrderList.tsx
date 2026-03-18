import { useState, useEffect } from 'react';
import type { Order } from '../types';

/**
 * 주문 목록 페이지
 * PRD 2.5 요구사항 반영
 */
function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // TODO: API 연동 (GET /orders)
    const mockOrders: Order[] = [
      {
        id: 1001,
        memberId: 1,
        status: 'COMPLETED',
        shippingAddress: '서울시 강남구 테헤란로 123',
        shippingZipCode: '12345',
        createdAt: '2024-03-19T10:00:00',
        items: [{ productId: 1, quantity: 1 }]
      },
      {
        id: 1002,
        memberId: 1,
        status: 'PENDING',
        shippingAddress: '서울시 서초구 서초대로 456',
        shippingZipCode: '54321',
        createdAt: '2024-03-19T11:30:00',
        items: [{ productId: 2, quantity: 2 }]
      }
    ];
    setOrders(mockOrders);
  }, []);

  return (
    <div>
      <h1>주문 내역</h1>
      {orders.length === 0 ? (
        <p>주문 내역이 없습니다.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #000' }}>
              <th style={{ textAlign: 'left', padding: '1rem' }}>주문번호</th>
              <th style={{ textAlign: 'left', padding: '1rem' }}>배송지</th>
              <th style={{ textAlign: 'center', padding: '1rem' }}>상태</th>
              <th style={{ textAlign: 'right', padding: '1rem' }}>주문일시</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>{order.id}</td>
                <td style={{ padding: '1rem' }}>
                  <div>{order.shippingAddress}</div>
                  <small style={{ color: '#666' }}>({order.shippingZipCode})</small>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <span style={{ 
                    padding: '0.2rem 0.5rem', 
                    border: '1px solid #ccc',
                    fontSize: '0.8rem'
                  }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  {new Date(order.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default OrderList;
