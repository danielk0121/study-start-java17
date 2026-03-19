import { useState, useEffect } from 'react';

interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  itemTotal: number;
  thumbnailUrl?: string;
}

/**
 * 장바구니 페이지
 * PRD-FRONTAPP 2.4 요구사항 반영 (썸네일 및 ID 포함)
 */
function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    // TODO: API 연동 (GET /carts/me)
    const mockCartItems: CartItem[] = [
      { 
        productId: 1, productName: '맥북 프로 14인치', price: 2990000, quantity: 1, itemTotal: 2990000,
        thumbnailUrl: 'https://via.placeholder.com/80x80?text=MacBook'
      },
      { 
        productId: 3, productName: '무선 키보드', price: 89000, quantity: 2, itemTotal: 178000,
        thumbnailUrl: 'https://via.placeholder.com/80x80?text=KBD'
      },
      { 
        productId: 8, productName: '클린 코드', price: 33000, quantity: 1, itemTotal: 33000,
        thumbnailUrl: 'https://via.placeholder.com/80x80?text=Book'
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
                        {item.thumbnailUrl ? (
                          <img src={item.thumbnailUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ color: '#ccc', fontSize: '0.6rem' }}>No Img</span>
                        )}
                      </div>
                      <div>
                        <div style={{ color: '#999', fontSize: '0.8rem' }}>ID: #{item.productId}</div>
                        <div style={{ fontWeight: 'bold' }}>{item.productName}</div>
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
          <div style={{ textAlign: 'right', marginTop: '2rem' }}>
            <h2>총 결제 예정 금액: {totalPrice.toLocaleString()}원</h2>
            <button 
              style={{ padding: '1rem 2rem', backgroundColor: '#000', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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
