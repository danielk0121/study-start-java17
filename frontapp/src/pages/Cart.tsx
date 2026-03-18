import { useState, useEffect } from 'react';

interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  itemTotal: number;
}

/**
 * 장바구니 페이지
 * PRD-FRONTAPP 2.4 요구사항 반영
 */
function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    // TODO: API 연동 (GET /carts/me)
    const mockCartItems: CartItem[] = [
      { productId: 1, productName: 'MacBook Pro', price: 2000000, quantity: 1, itemTotal: 2000000 },
      { productId: 2, productName: 'iPhone 15', price: 1500000, quantity: 2, itemTotal: 3000000 }
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
                <th style={{ textAlign: 'left', padding: '1rem' }}>상품명</th>
                <th style={{ textAlign: 'right', padding: '1rem' }}>가격</th>
                <th style={{ textAlign: 'center', padding: '1rem' }}>수량</th>
                <th style={{ textAlign: 'right', padding: '1rem' }}>합계</th>
                <th style={{ textAlign: 'center', padding: '1rem' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(item => (
                <tr key={item.productId} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>{item.productName}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>{item.price.toLocaleString()}원</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button onClick={() => handleUpdateQuantity(item.productId, -1)}>-</button>
                    <span style={{ margin: '0 0.5rem' }}>{item.quantity}</span>
                    <button onClick={() => handleUpdateQuantity(item.productId, 1)}>+</button>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>{item.itemTotal.toLocaleString()}원</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button onClick={() => handleRemove(item.productId)} style={{ color: 'red' }}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: 'right', marginTop: '2rem' }}>
            <h2>총 결제 예정 금액: {totalPrice.toLocaleString()}원</h2>
            <button style={{ padding: '1rem 2rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              주문하기
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
