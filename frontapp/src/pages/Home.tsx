import { useState, useEffect } from 'react';
import type { Product } from '../types';

/**
 * 상품 목록 페이지 (Home)
 * PRD 2.3 요구사항 반영
 */
function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  // TODO: 실제 API 연동 (axios)
  useEffect(() => {
    // 임시 데이터
    const mockProducts: Product[] = [
      { id: 1, name: 'MacBook Pro', price: 2000000, stock: 10, category: 'ELECTRONICS', brandName: 'Apple' },
      { id: 2, name: 'iPhone 15', price: 1500000, stock: 20, category: 'ELECTRONICS', brandName: 'Apple' }
    ];
    setProducts(mockProducts);
  }, []);

  return (
    <div>
      <h1>상품 목록</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {products.map(product => (
          <div key={product.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
            <h3>{product.name}</h3>
            <p>브랜드: {product.brandName}</p>
            <p>가격: {product.price.toLocaleString()}원</p>
            <button>주문하기</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
