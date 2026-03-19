import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Order } from '../types';

/**
 * 주문 목록 페이지
 * PRD 2.5 요구사항 반영 (주문 취소 기능 추가)
 */
function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 상품 ID -> 상품 정보 매핑 (검색 및 UI용)
  const productInfoMap: Record<number, { name: string, thumb: string }> = {
    1: { name: '맥북 프로 14인치', thumb: 'https://via.placeholder.com/50x50?text=MBP' },
    2: { name: '아이폰 15 Pro', thumb: 'https://via.placeholder.com/50x50?text=iPhone' },
    3: { name: '무선 키보드', thumb: 'https://via.placeholder.com/50x50?text=KBD' },
    4: { name: '린넨 셔츠', thumb: 'https://via.placeholder.com/50x50?text=Shirt' },
    8: { name: '클린 코드', thumb: 'https://via.placeholder.com/50x50?text=Book' }
  };

  useEffect(() => {
    // TODO: API 연동 (GET /orders)
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
      },
      {
        id: 4,
        orderNo: '250929140000004',
        memberId: 4,
        status: 'CANCELLED',
        shippingAddress: '서울시 서초구 서초동 678-90',
        shippingZipCode: '06543',
        createdAt: '2025-09-29T14:00:00',
        items: [{ productId: 4, quantity: 2 }]
      },
      {
        id: 6,
        orderNo: '250902101500006',
        memberId: 2,
        status: 'CONFIRMED',
        shippingAddress: '서울시 강남구 역삼동 123-45',
        shippingZipCode: '06123',
        createdAt: '2025-09-02T10:15:00',
        items: [{ productId: 3, quantity: 1 }, { productId: 8, quantity: 1 }]
      },
      {
        id: 105,
        orderNo: '260226130000105',
        memberId: 8,
        status: 'PENDING',
        shippingAddress: '서울시 서초구 서초동 678-90',
        shippingZipCode: '06543',
        createdAt: '2026-02-26T13:00:00',
        items: [{ productId: 3, quantity: 1 }]
      }
    ];
    setOrders(mockOrders);
  }, []);

  useEffect(() => {
    // 상품명으로 주문 필터링
    const filtered = orders.filter(order => 
      order.items.some(item => 
        (productInfoMap[item.productId]?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  const handleCancelOrder = (orderId: number) => {
    if (!window.confirm('주문을 취소하시겠습니까?')) return;

    // TODO: API 연동 (PATCH /orders/{id}/cancel)
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'CANCELLED' } : order
    ));
    alert('주문이 취소되었습니다.');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>주문 내역</h1>
        <input 
          type="text" 
          placeholder="주문 상품명 검색..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '0.5rem', width: '250px', border: '1px solid #000' }}
        />
      </div>
      
      {filteredOrders.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>검색 결과가 없습니다.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #000' }}>
              <th style={{ textAlign: 'left', padding: '1rem' }}>주문번호</th>
              <th style={{ textAlign: 'left', padding: '1rem' }}>배송지</th>
              <th style={{ textAlign: 'left', padding: '1rem' }}>주문 상품</th>
              <th style={{ textAlign: 'center', padding: '1rem' }}>상태</th>
              <th style={{ textAlign: 'right', padding: '1rem' }}>주문일시</th>
              <th style={{ textAlign: 'center', padding: '1rem' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>
                  <Link to={`/order/${order.id}`} style={{ textDecoration: 'none', color: '#000' }}>
                    <div style={{ fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>{order.orderNo}</div>
                  </Link>
                  <small style={{ color: '#999' }}>ID: {order.id}</small>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div>{order.shippingAddress}</div>
                  <small style={{ color: '#666' }}>({order.shippingZipCode})</small>
                </td>
                <td style={{ padding: '1rem' }}>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.9rem', color: '#333' }}>
                    {order.items.map((item, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <div style={{ width: '30px', height: '30px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {productInfoMap[item.productId]?.thumb ? (
                            <img src={productInfoMap[item.productId].thumb} alt="item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '0.5rem', color: '#ccc' }}>N/A</span>
                          )}
                        </div>
                        <span>
                          <small style={{ color: '#999', marginRight: '0.3rem' }}>#{item.productId}</small>
                          {productInfoMap[item.productId]?.name || '기타 상품'} ({item.quantity}개)
                        </span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <span style={{ 
                    padding: '0.2rem 0.5rem', 
                    border: '1px solid #ccc',
                    fontSize: '0.8rem',
                    color: order.status === 'CANCELLED' ? '#d00' : '#333',
                    backgroundColor: order.status === 'CANCELLED' ? '#fff0f0' : 'transparent'
                  }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  {order.status === 'PENDING' && (
                    <button 
                      onClick={() => handleCancelOrder(order.id)}
                      style={{ 
                        padding: '0.3rem 0.6rem', 
                        fontSize: '0.8rem', 
                        cursor: 'pointer', 
                        color: '#d00',
                        border: '1px solid #d00',
                        backgroundColor: '#fff'
                      }}
                    >
                      주문취소
                    </button>
                  )}
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
