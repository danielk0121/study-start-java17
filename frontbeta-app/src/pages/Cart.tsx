import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  itemTotal: number;
  thumbnailUrl1?: string;
}

/**
 * 장바구니 페이지
 * PRD-FRONTAPP 2.4 요구사항 반영 (썸네일 및 ID 포함, 모바일 최적화)
 */
function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    // TODO: API 연동 (GET /carts/me)
    const mockCartItems: CartItem[] = [
      { 
        productId: 11, productName: '삼성 갤럭시 북4 Pro', price: 1850000, quantity: 1, itemTotal: 1850000,
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/samsung-laptop.png`
      },
      { 
        productId: 12, productName: '삼성 갤럭시 S24 Ultra', price: 1550000, quantity: 1, itemTotal: 1550000,
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/samsung-phone.png`
      },
      { 
        productId: 13, productName: '삼성 커스텀 기계식 키보드', price: 150000, quantity: 1, itemTotal: 150000,
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/keyboard.png`
      },
      { 
        productId: 1, productName: '맥북 프로 14인치', price: 2990000, quantity: 1, itemTotal: 2990000,
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/apple-laptop.png`
      }
    ];
    setCartItems(mockCartItems);
    setTotalPrice(mockCartItems.reduce((acc, item) => acc + item.itemTotal, 0));
  }, []);

  const handleUpdateQuantity = (productId: number, delta: number) => {
    setCartItems(prev => prev.map(item => 
      item.productId === productId 
        ? { ...item, quantity: Math.max(1, item.quantity + delta), itemTotal: item.price * Math.max(1, item.quantity + delta) } 
        : item
    ));
  };

  useEffect(() => {
    setTotalPrice(cartItems.reduce((acc, item) => acc + item.itemTotal, 0));
  }, [cartItems]);

  const handleRemove = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  return (
    <div>
      <h1>장바구니</h1>
      {cartItems.length === 0 ? (
        <p>장바구니가 비어 있습니다.</p>
      ) : (
        <>
          {isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cartItems.map(item => (
                <div key={item.productId} style={{ 
                  border: '1px solid #eee', 
                  borderRadius: '8px', 
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem'
                }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ 
                      width: '80px', height: '80px', backgroundColor: '#f0f0f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee', flexShrink: 0
                    }}>
                      {item.thumbnailUrl1 ? (
                        <img src={item.thumbnailUrl1} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: '#ccc', fontSize: '0.6rem' }}>No Img</span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Link to={`/product/${item.productId}`} style={{ textDecoration: 'underline', color: '#999', fontSize: '0.75rem', fontFamily: 'monospace', display: 'block' }}>
                        ID: {item.productId.toString().padStart(8, '0')}
                      </Link>
                      <Link to={`/product/${item.productId}`} style={{ textDecoration: 'underline', color: 'inherit' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.3rem' }}>{item.productName}</div>
                      </Link>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>{item.price.toLocaleString()}원</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px' }}>
                      <button onClick={() => handleUpdateQuantity(item.productId, -1)} style={{ padding: '0.3rem 0.6rem', border: 'none', background: 'none' }}>-</button>
                      <span style={{ padding: '0 0.8rem', fontSize: '0.9rem' }}>{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item.productId, 1)} style={{ padding: '0.3rem 0.6rem', border: 'none', background: 'none' }}>+</button>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#999' }}>합계</div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{item.itemTotal.toLocaleString()}원</div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleRemove(item.productId)} 
                    style={{ 
                      width: '100%', padding: '0.5rem', border: '1px solid #ff4d4f', color: '#ff4d4f', 
                      background: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' 
                    }}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee' }}>
                    <th style={{ textAlign: 'left', padding: '1rem' }}>상품정보</th>
                    <th style={{ textAlign: 'right', padding: '1rem' }}>가격</th>
                    <th style={{ textAlign: 'center', padding: '1rem' }}>수량</th>
                    <th style={{ textAlign: 'right', padding: '1rem' }}>합계</th>
                    <th style={{ textAlign: 'center', padding: '1rem' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map(item => (
                    <tr key={item.productId} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ 
                            width: '60px', height: '60px', backgroundColor: '#f0f0f0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee'
                          }}>
                            {item.thumbnailUrl1 ? (
                              <img src={item.thumbnailUrl1} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ color: '#ccc', fontSize: '0.6rem' }}>No Img</span>
                            )}
                          </div>
                          <div>
                            <Link to={`/product/${item.productId}`} style={{ textDecoration: 'underline', color: '#999', fontSize: '0.8rem', fontFamily: 'monospace', display: 'block' }}>
                              ID: {item.productId.toString().padStart(8, '0')}
                            </Link>
                            <Link to={`/product/${item.productId}`} style={{ textDecoration: 'underline', color: 'inherit' }}>
                              <div style={{ fontWeight: 'bold' }}>{item.productName}</div>
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>{item.price.toLocaleString()}원</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button onClick={() => handleUpdateQuantity(item.productId, -1)}>-</button>
                        <span style={{ margin: '0 0.5rem' }}>{item.quantity}</span>
                        <button onClick={() => handleUpdateQuantity(item.productId, 1)}>+</button>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>{item.itemTotal.toLocaleString()}원</td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button onClick={() => handleRemove(item.productId)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div style={{ textAlign: 'right', marginTop: '2rem', borderTop: '2px solid #000', paddingTop: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.2rem', color: '#666' }}>총 결제 예정 금액:</span>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', marginLeft: '1rem' }}>{totalPrice.toLocaleString()}원</span>
            </div>
            <button
              style={{ width: isMobile ? '100%' : 'auto', padding: '1rem 3rem', backgroundColor: '#000', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              주문하기
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
