import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { Product } from '../types';

/**
 * 상품 상세 페이지
 * UC_PROD_07 구현 (Prototype)
 */
function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Flyway 샘플 데이터를 기반으로 한 Mock 데이터 조회 시뮬레이션
    const mockProducts: Product[] = [
      { id: 1, name: '맥북 프로 14인치', price: 2990000, stock: 10, category: 'ELECTRONICS', brandName: 'Apple' },
      { id: 2, name: '아이폰 15 Pro', price: 1550000, stock: 25, category: 'ELECTRONICS', brandName: 'Apple' },
      { id: 3, name: '무선 키보드', price: 89000, stock: 50, category: 'ELECTRONICS', brandName: 'Logitech' },
      { id: 4, name: '린넨 셔츠', price: 49000, stock: 100, category: 'CLOTHING', brandName: 'Uniqlo' },
      { id: 11, name: 'Galaxy S24', price: 1150000, stock: 30, category: 'ELECTRONICS', brandName: 'Samsung' }
    ];

    const found = mockProducts.find(p => p.id === Number(id));
    setProduct(found || null);
  }, [id]);

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>상품 정보를 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/')} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>목록으로 이동</button>
      </div>
    );
  }

  const handleAddToCart = () => {
    alert(`${product.name}이(가) 장바구니에 담겼습니다.`);
  };

  return (
    <div>
      <button 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
      >
        &lt; 뒤로가기
      </button>

      <div style={{ display: 'flex', gap: '3rem', alignItems: 'start' }}>
        {/* 상품 이미지 플레이스홀더 */}
        <div style={{ 
          width: '400px', 
          height: '400px', 
          backgroundColor: '#f0f0f0', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '1px solid #ddd'
        }}>
          <span style={{ color: '#999' }}>상품 이미지 준비 중</span>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1rem', color: '#666', marginBottom: '0.5rem' }}>
            {product.brandName} | {product.category}
          </div>
          <h1 style={{ margin: '0 0 1.5rem 0', fontSize: '2.5rem' }}>{product.name}</h1>
          
          <div style={{ borderTop: '2px solid #000', borderBottom: '1px solid #eee', padding: '1.5rem 0', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#666' }}>판매가</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{product.price.toLocaleString()}원</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>재고수량</span>
              <span>{product.stock}개</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={handleAddToCart}
              style={{ flex: 1, padding: '1.2rem', fontSize: '1.1rem', cursor: 'pointer', border: '1px solid #000', backgroundColor: '#fff' }}
            >
              장바구니 담기
            </button>
            <button style={{ flex: 1, padding: '1.2rem', fontSize: '1.1rem', cursor: 'pointer', border: 'none', backgroundColor: '#000', color: '#fff' }}>
              바로 구매하기
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '4rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
        <h3>상품 상세 정보</h3>
        <p style={{ color: '#444', lineHeight: '1.6' }}>
          이 상품은 {product.brandName} 브랜드의 정품입니다.<br />
          카테고리: {product.category}<br />
          상품 ID: {product.id}<br /><br />
          (여기에 상세 설명 텍스트가 들어갑니다. 현재는 프로토타입 단계로 기본 정보만 표시됩니다.)
        </p>
      </div>
    </div>
  );
}

export default ProductDetail;
