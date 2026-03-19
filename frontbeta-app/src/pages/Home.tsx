import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useIsMobile } from '../hooks/useIsMobile';

/**
 * 상품 목록 페이지 (Home)
 * PRD 2.3 요구사항 반영 (장바구니 담기 기능 추가)
 */
function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [finalQuery, setFinalQuery] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    // TODO: 백엔드 API 연동 (GET /products)
    const mockProducts: Product[] = [
      { id: 1, name: '맥북 프로 14인치', price: 2990000, stock: 10, category: '전자기기', brandName: '애플', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=A',
        thumbnailUrl1: 'https://via.placeholder.com/400x400?text=MacBook+Thumb+1', salesCount: 15
      },
      { id: 2, name: '아이폰 15 Pro', price: 1550000, stock: 25, category: '전자기기', brandName: '애플', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=A', salesCount: 42 },
      { id: 3, name: '무선 키보드', price: 89000, stock: 50, category: '전자기기', brandName: '로지텍', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=L', salesCount: 120 },
      { id: 4, name: '린넨 셔츠', price: 49000, stock: 100, category: '의류', brandName: '유니클로', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=U', salesCount: 85 },
      { id: 5, name: '청바지 슬림핏', price: 79000, stock: 80, category: '의류', brandName: '자라', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=Z', salesCount: 60 },
      { id: 6, name: '제주 감귤 2kg', price: 15000, stock: 200, category: '식품', brandName: 'CJ', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=C', salesCount: 350 },
      { id: 7, name: '유기농 아메리카노 원두 500g', price: 22000, stock: 150, category: '식품', brandName: '스타벅스', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=S', salesCount: 210 },
      { id: 8, name: '클린 코드', price: 33000, stock: 60, category: '도서', brandName: '피어슨', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=P', salesCount: 95 },
      { id: 9, name: '자바 ORM 표준 JPA 프로그래밍', price: 38000, stock: 45, category: '도서', brandName: '오라일리', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=O', salesCount: 78 },
      { id: 10, name: '텀블러 500ml', price: 25000, stock: 120, category: '기타', brandName: '무지', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=M', salesCount: 45 },
      { id: 11, name: 'Galaxy S24', price: 1150000, stock: 30, category: '전자기기', brandName: '삼성', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=S', salesCount: 33 },
      { id: 12, name: 'WH-1000XM5', price: 450000, stock: 20, category: '전자기기', brandName: '소니', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=S', salesCount: 18 },
      { id: 13, name: 'Air Max 97', price: 199000, stock: 50, category: '의류', brandName: '나이키', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=N', salesCount: 112 },
      { id: 14, name: 'Designing Data-Intensive Applications', price: 45000, stock: 100, category: '도서', brandName: '오라일리', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=O', salesCount: 54 },
      { id: 15, name: 'LEGO Star Wars', price: 210000, stock: 5, category: '기타', brandName: '레고', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=L', salesCount: 29 }
    ];

    // 검색 필터링
    const query = finalQuery.toLowerCase();
    const filtered = mockProducts.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.brandName.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
    setProducts(filtered);
  }, [finalQuery]);

  const handleSearch = () => {
    setFinalQuery(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleAddToCart = (product: Product) => {
    // TODO: API 연동 (POST /carts/me/items)
    console.log('Add to cart:', product);
    alert(`${product.name}이(가) 장바구니에 담겼습니다.`);
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
        <h1 style={{ margin: 0 }}>상품 목록</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="상품, 브랜드 검색..."
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

      {products.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>검색 결과가 없습니다.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(250px, 1fr))', gap: isMobile ? '0.75rem' : '1.5rem' }}>
        {products.map(product => (
          <div key={product.id} style={{ border: '1px solid #ddd', padding: isMobile ? '0.75rem' : '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{
              width: '100%', height: '150px', backgroundColor: '#f0f0f0', marginBottom: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee'
            }}>
              {product.thumbnailUrl1 ? (
                <img src={product.thumbnailUrl1} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#ccc', fontSize: '0.8rem' }}>No Image</span>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {product.brandThumbnailUrl && (
                <img src={product.brandThumbnailUrl} alt={product.brandName} style={{ width: '20px', height: '20px', border: '1px solid #eee', objectFit: 'contain' }} />
              )}
              <span>{product.brandName} | {product.category}</span>
              <small style={{ color: '#999' }}>(ID: {product.id})</small>
            </div>
            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: '#000' }}>
              <h3 style={{ margin: '0 0 1rem 0', cursor: 'pointer' }}>{product.name}</h3>
            </Link>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
              <span>재고: {product.stock}개</span>
              <span style={{ color: '#d00', fontWeight: 'bold' }}>판매: {product.salesCount}개</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>{product.price.toLocaleString()}원</p>
              <button
                onClick={() => handleAddToCart(product)}
                style={{ padding: '0.3rem 0.6rem', cursor: 'pointer', border: '1px solid #000', backgroundColor: '#fff', fontSize: '0.8rem' }}
              >
                장바구니
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

export default Home;
