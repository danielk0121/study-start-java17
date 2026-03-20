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
      { id: 1, name: '[Apple] 맥북 프로 14인치 M3 Pro 실버', price: 2990000, stock: 10, category: '전자기기', brandName: '애플', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=A', sellerId: 1, sellerName: '애플공식몰',
        thumbnailUrl1: 'https://via.placeholder.com/400x400?text=MacBook+Thumb+1', salesCount: 15
      },
      { id: 2, name: '[Apple] 아이폰 15 Pro 256GB 내추럴 티타늄', price: 1550000, stock: 25, category: '전자기기', brandName: '애플', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=A', sellerId: 1, sellerName: '애플공식몰', salesCount: 42 },
      { id: 3, name: '[Logitech] MX Keys Mini 무선 기계식 키보드', price: 89000, stock: 50, category: '전자기기', brandName: '로지텍', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=L', sellerId: 2, sellerName: '로지텍코리아', salesCount: 120 },
      { id: 4, name: '[Uniqlo] 프리미엄 리넨 셔츠 (긴팔) 화이트 L', price: 49000, stock: 100, category: '의류', brandName: '유니클로', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=U', sellerId: 3, sellerName: '패션브랜드샵', salesCount: 85 },
      { id: 5, name: '[Zara] 슬림핏 스트레치 데님 팬츠 다크 블루', price: 79000, stock: 80, category: '의류', brandName: '자라', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=Z', sellerId: 3, sellerName: '패션브랜드샵', salesCount: 60 },
      { id: 6, name: '[CJ] 서귀포 프리미엄 고당도 제주 감귤 2kg', price: 15000, stock: 200, category: '식품', brandName: 'CJ', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=C', sellerId: 4, sellerName: '푸드마켓', salesCount: 350 },
      { id: 7, name: '[Starbucks] 하우스 블렌드 유기농 원두 500g', price: 22000, stock: 150, category: '식품', brandName: '스타벅스', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=S', sellerId: 4, sellerName: '푸드마켓', salesCount: 210 },
      { id: 8, name: '[Pearson] 클린 코드: 애자일 소프트웨어 장인 정신', price: 33000, stock: 60, category: '도서', brandName: '피어슨', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=P', sellerId: 5, sellerName: '북스토어', salesCount: 95 },
      { id: 9, name: '[OReilly] 자바 ORM 표준 JPA 프로그래밍 가이드', price: 38000, stock: 45, category: '도서', brandName: '오라일리', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=O', sellerId: 5, sellerName: '북스토어', salesCount: 78 },
      { id: 10, name: '[Muji] 스테인리스 보온 보냉 텀블러 500ml', price: 25000, stock: 120, category: '기타', brandName: '무지', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=M', sellerId: 6, sellerName: '라이프스타일샵', salesCount: 45 },
      { id: 11, name: '[Samsung] Galaxy S24 Ultra 512GB 블랙', price: 1150000, stock: 30, category: '전자기기', brandName: '삼성', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=S', sellerId: 6, sellerName: '라이프스타일샵', salesCount: 33 },
      { id: 12, name: '[Sony] WH-1000XM5 노이즈 캔슬링 헤드폰', price: 450000, stock: 20, category: '전자기기', brandName: '소니', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=S', sellerId: 6, sellerName: '라이프스타일샵', salesCount: 18 },
      { id: 13, name: '[Nike] Air Max 97 OG 실버 불렛 2024', price: 199000, stock: 50, category: '의류', brandName: '나이키', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=N', sellerId: 6, sellerName: '라이프스타일샵', salesCount: 112 },
      { id: 14, name: '[OReilly] Designing Data-Intensive Applications', price: 45000, stock: 100, category: '도서', brandName: '오라일리', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=O', sellerId: 5, sellerName: '북스토어', salesCount: 54 },
      { id: 15, name: '[LEGO] Star Wars 밀레니엄 팔콘 컬렉션', price: 210000, stock: 5, category: '기타', brandName: '레고', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=L', sellerId: 6, sellerName: '라이프스타일샵', salesCount: 29 }
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
            <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.4rem', fontFamily: 'monospace' }}>
              ID: {product.id.toString().padStart(8, '0')}
            </div>
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
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                {product.brandThumbnailUrl && (
                  <img src={product.brandThumbnailUrl} alt={product.brandName} style={{ width: '16px', height: '16px', border: '1px solid #eee', objectFit: 'contain', flexShrink: 0 }} />
                )}
                <span style={{ fontSize: '0.75rem', color: '#555', fontWeight: 600 }}>{product.brandName}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#888', paddingLeft: '20px' }}>{product.category}</div>
              {product.sellerId && product.sellerName && (
                <div style={{ fontSize: '0.72rem', paddingLeft: '20px', marginTop: '0.1rem' }}>
                  <Link to={`/seller/${product.sellerId}`} style={{ color: '#333', textDecoration: 'none' }}>
                    {product.sellerName}
                  </Link>
                </div>
              )}
            </div>
            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: '#000' }}>
              <h3 style={{
                margin: '0 0 0.75rem 0',
                cursor: 'pointer',
                fontSize: isMobile ? '0.85rem' : '1rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                height: '2.4em',
                lineHeight: '1.2em'
              }}>
                {product.name}
              </h3>
            </Link>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '0.72rem', color: '#666', marginBottom: '0.5rem', gap: '0.1rem 0.25rem' }}>
              <span>재고: <strong>{product.stock.toLocaleString()}개</strong></span>
              <span>판매: <strong>{product.salesCount.toLocaleString()}개</strong></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem' }}>
              <p style={{ fontWeight: 'bold', fontSize: isMobile ? '0.95rem' : '1.1rem', margin: 0 }}>{product.price.toLocaleString()}원</p>
              <button
                onClick={() => handleAddToCart(product)}
                style={{ 
                  width: isMobile ? '1.8rem' : '2.2rem',
                  height: isMobile ? '1.8rem' : '2.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  cursor: 'pointer', 
                  border: '1px solid #000', 
                  backgroundColor: '#fff', 
                  fontSize: isMobile ? '0.9rem' : '1.1rem', 
                  whiteSpace: 'nowrap',
                  lineHeight: 1
                }}
              >
                🛒
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
