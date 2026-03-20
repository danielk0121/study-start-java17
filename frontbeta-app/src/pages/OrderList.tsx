import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Order } from '../types';
import { useIsMobile } from '../hooks/useIsMobile';

/**
 * 주문 목록 페이지
 * PRD 2.5 요구사항 반영 (주문 취소 기능 추가, 모바일 최적화)
 */
function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [finalQuery, setFinalQuery] = useState('');
  const isMobile = useIsMobile();

  // 상품 ID -> 상품 정보 매핑 (검색 및 UI용)
  const productInfoMap: Record<number, { name: string, thumb: string, price: number }> = {
    1: { name: '맥북 프로 14인치', thumb: `${import.meta.env.BASE_URL}assets/sample/apple-laptop.png`, price: 2990000 },
    2: { name: '아이폰 15 Pro', thumb: `${import.meta.env.BASE_URL}assets/sample/apple-phone.png`, price: 1550000 },
    3: { name: '무선 키보드', thumb: `${import.meta.env.BASE_URL}assets/sample/keyboard.png`, price: 120000 },
    4: { name: '린넨 셔츠', thumb: `${import.meta.env.BASE_URL}assets/sample/shirt.png`, price: 45000 },
    8: { name: '클린 코드', thumb: `${import.meta.env.BASE_URL}assets/sample/book-clean.png`, price: 29000 },
    11: { name: '삼성 갤럭시 북4 Pro', thumb: `${import.meta.env.BASE_URL}assets/sample/samsung-laptop.png`, price: 1850000 },
    12: { name: '삼성 갤럭시 S24 Ultra', thumb: `${import.meta.env.BASE_URL}assets/sample/samsung-phone.png`, price: 1550000 },
    13: { name: '삼성 커스텀 기계식 키보드', thumb: `${import.meta.env.BASE_URL}assets/sample/keyboard.png`, price: 150000 }  };

  useEffect(() => {
    // TODO: API 연동 (GET /orders)
    const mockOrders: Order[] = [
      {
        id: 1,
        orderNo: '250902101500001',
        memberId: 2,
        status: 'CONFIRMED',
        shippingNickname: '우리집',
        shippingAddress: '서울시 강남구 역삼동 123-45',
        shippingZipCode: '06123',
        shippingPhoneNumber: '010-1234-5678',
        shippingCost: 2500,
        createdAt: '2025-09-02T10:15:00',
        items: [{ productId: 11, quantity: 1 }, { productId: 12, quantity: 1 }, { productId: 13, quantity: 1 }]
      },
      {
        id: 4,
        orderNo: '250929140000004',
        memberId: 4,
        status: 'CANCELLED',
        shippingNickname: '회사',
        shippingAddress: '서울시 서초구 서초동 678-90',
        shippingZipCode: '06543',
        shippingPhoneNumber: '02-555-9876',
        shippingCost: 3000,
        createdAt: '2025-09-29T14:00:00',
        items: [{ productId: 4, quantity: 2 }]
      },
      {
        id: 6,
        orderNo: '250902101500006',
        memberId: 2,
        status: 'CONFIRMED',
        shippingNickname: undefined, // 별명 없음 표현
        shippingAddress: '서울시 강남구 역삼동 123-45',
        shippingZipCode: '06123',
        shippingPhoneNumber: '010-1234-5678',
        shippingCost: 2000,
        createdAt: '2025-09-02T10:15:00',
        items: [{ productId: 3, quantity: 1 }, { productId: 8, quantity: 1 }]
      },
      {
        id: 105,
        orderNo: '260226130000105',
        memberId: 8,
        status: 'PENDING',
        shippingNickname: '친구집',
        shippingAddress: '서울시 서초구 서초동 678-90',
        shippingZipCode: '06543',
        shippingPhoneNumber: '010-9999-8888',
        shippingCost: 3000,
        createdAt: '2026-02-26T13:00:00',
        items: [{ productId: 3, quantity: 1 }]
      }
    ];
    // Sort by createdAt descending (latest first)
    const sortedOrders = [...mockOrders].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setOrders(sortedOrders);
  }, []);

  useEffect(() => {
    // 상품명으로 주문 필터링
    const query = finalQuery.toLowerCase();
    const filtered = orders.filter(order =>
      order.items.some(item =>
        (productInfoMap[item.productId]?.name || '').toLowerCase().includes(query)
      )
    );
    setFilteredOrders(filtered);
  }, [finalQuery, orders]);

  const handleSearch = () => {
    setFinalQuery(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? '0.75rem' : '0',
        marginBottom: '1.5rem'
      }}>
        <h1 style={{ margin: 0 }}>주문 내역</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="주문 상품명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ padding: '0.5rem', flex: 1, minWidth: 0, border: '1px solid #000' }}
          />
          <button
            onClick={handleSearch}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            검색
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>검색 결과가 없습니다.</p>
      ) : (
        isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredOrders.map(order => (
              <div key={order.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                  <div>
                    <Link to={`/order/${order.id}`} style={{ textDecoration: 'none', color: '#000' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '1rem', textDecoration: 'underline' }}>{order.orderNo}</div>
                    </Link>
                    <small style={{ color: '#999' }}>ID: {order.id} | {new Date(order.createdAt).toLocaleDateString()}</small>
                  </div>
                  <span style={{
                    padding: '0.2rem 0.5rem',
                    border: '1px solid #ccc',
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                    color: order.status === 'CANCELLED' ? '#d00' : '#333',
                    backgroundColor: order.status === 'CANCELLED' ? '#fff0f0' : '#f9f9f9'
                  }}>
                    {order.status}
                  </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem' }}>배송지</div>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                    {order.shippingNickname && <strong style={{ color: '#000', marginRight: '0.4rem' }}>[{order.shippingNickname}]</strong>}
                    {order.shippingAddress} ({order.shippingZipCode})
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#333' }}>연락처: {order.shippingPhoneNumber}</div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>주문 상품</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {order.items.map((item, idx) => {
                      const info = productInfoMap[item.productId];
                      return (
                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', backgroundColor: '#f9f9f9', padding: '0.5rem', borderRadius: '4px' }}>
                          <div style={{ width: '40px', height: '40px', backgroundColor: '#fff', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {info?.thumb ? (
                              <img src={info.thumb} alt="item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: '0.5rem', color: '#ccc' }}>N/A</span>
                            )}
                          </div>
                          <div style={{ flex: 1, fontSize: '0.85rem' }}>
                            <Link to={`/product/${item.productId}`} style={{ color: '#999', fontSize: '0.7rem', fontFamily: 'monospace', textDecoration: 'underline', display: 'block' }}>
                              {item.productId.toString().padStart(8, '0')}
                            </Link>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Link to={`/product/${item.productId}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                                <div>{info?.name || '기타 상품'} <span style={{ fontWeight: 'bold' }}>x {item.quantity}</span></div>
                              </Link>
                              <div style={{ fontSize: '0.8rem', color: '#666' }}>{info ? (info.price * item.quantity).toLocaleString() + '원' : ''}</div>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#999' }}>개당 {info?.price.toLocaleString() || 0}원</div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div style={{ borderTop: '1px dashed #eee', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>총 주문 금액</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#d00' }}>
                    {(order.items.reduce((sum, item) => sum + (productInfoMap[item.productId]?.price || 0) * item.quantity, 0) + order.shippingCost).toLocaleString()}원
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #000' }}>
                  <th style={{ textAlign: 'left', padding: '1rem' }}>주문번호</th>
                  <th style={{ textAlign: 'left', padding: '1rem' }}>배송지</th>
                  <th style={{ textAlign: 'left', padding: '1rem' }}>주문 상품 (단가)</th>
                  <th style={{ textAlign: 'right', padding: '1rem' }}>총 주문 금액</th>
                  <th style={{ textAlign: 'center', padding: '1rem' }}>상태</th>
                  <th style={{ textAlign: 'right', padding: '1rem' }}>주문일시</th>
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
                      {order.shippingNickname && (
                        <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: '#000', marginBottom: '0.2rem' }}>
                          [{order.shippingNickname}]
                        </div>
                      )}
                      <div>{order.shippingAddress}</div>
                      <small style={{ color: '#666' }}>({order.shippingZipCode})</small>
                      <div style={{ fontSize: '0.8rem', color: '#333', marginTop: '0.2rem' }}>{order.shippingPhoneNumber}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.9rem', color: '#333' }}>
                        {order.items.map((item, idx) => {
                          const info = productInfoMap[item.productId];
                          return (
                            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                              <div style={{ width: '30px', height: '30px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {info?.thumb ? (
                                  <img src={info.thumb} alt="item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <span style={{ fontSize: '0.5rem', color: '#ccc' }}>N/A</span>
                                )}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span>
                                  <Link to={`/product/${item.productId}`} style={{ color: '#999', marginRight: '0.3rem', fontFamily: 'monospace', textDecoration: 'underline' }}>
                                    {item.productId.toString().padStart(8, '0')}
                                  </Link>
                                  <Link to={`/product/${item.productId}`} style={{ color: '#000', textDecoration: 'underline' }}>
                                    {info?.name || '기타 상품'}
                                  </Link>
                                  <span style={{ marginLeft: '0.3rem' }}>({item.quantity}개)</span>
                                </span>
                                <small style={{ color: '#999' }}>개당 {info?.price.toLocaleString() || 0}원</small>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                      <div style={{ fontSize: '1.1rem', color: '#d00' }}>
                        {(order.items.reduce((sum, item) => sum + (productInfoMap[item.productId]?.price || 0) * item.quantity, 0) + order.shippingCost).toLocaleString()}원
                      </div>
                      <small style={{ color: '#999', fontWeight: 'normal' }}>배송비 {order.shippingCost.toLocaleString()}원 포함</small>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

export default OrderList;
