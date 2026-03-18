import { useState, useEffect } from 'react';
import type { Product } from '../types';

/**
 * 상품 목록 페이지 (Home)
 * PRD 2.3 요구사항 반영 (장바구니 담기 기능 추가)
 */
function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // TODO: 백엔드 API 연동 (GET /products)
    const mockProducts: Product[] = [
      { id: 1, name: 'MacBook Pro', price: 2000000, stock: 10, category: 'ELECTRONICS', brandName: 'Apple' },
      { id: 2, name: 'iPhone 15', price: 1500000, stock: 20, category: 'ELECTRONICS', brandName: 'Apple' },
      { id: 3, name: 'Galaxy S24', price: 1300000, stock: 15, category: 'ELECTRONICS', brandName: 'Samsung' }
    ];
    setProducts(mockProducts);
  }, []);

  const handleAddToCart = (product: Product) => {
    // TODO: API 연동 (POST /carts/me/items)
    console.log('Add to cart:', product);
    alert(`${product.name}이(가) 장바구니에 담겼습니다.`);
  };

  return (
    <div>
      <h1>상품 목록</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {products.map(product => (
          <div key={product.id} style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>{product.brandName} | {product.category}</div>
            <h3 style={{ margin: '0 0 1rem 0' }}>{product.name}</h3>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{product.price.toLocaleString()}원</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button 
                onClick={() => handleAddToCart(product)}
                style={{ flex: 1, padding: '0.5rem', cursor: 'pointer' }}
              >
                장바구니 담기
              </button>
              <button style={{ flex: 1, padding: '0.5rem', backgroundColor: '#333', color: 'white', border: 'none', cursor: 'pointer' }}>
                바로구매
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
