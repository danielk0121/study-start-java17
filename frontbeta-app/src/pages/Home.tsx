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
  const [sortBy, setSortBy] = useState('sales');
  const isMobile = useIsMobile();

  useEffect(() => {
    // TODO: 백엔드 API 연동 (GET /products)
    // 요청된 순서대로 baseProducts 정의: 노트북, 커피, 책, 키보드, 신발, 티셔츠, 기타
    const baseProducts: Product[] = [
      { id: 11, name: '[Samsung] 삼성 노트북 갤럭시 북4 Pro', price: 1850000, stock: 30, category: '전자기기', sellerId: 2, sellerName: '삼성공식몰', brandName: '삼성', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-samsung.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/samsung-laptop.png`, salesCount: 0, createdAt: '2024-03-01'
      },
      { id: 7, name: '[Starbucks] 하우스 블렌드 유기농 원두 500g', price: 22000, stock: 150, category: '식품', sellerId: 4, sellerName: '먹거리세상', brandName: '스타벅스', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-starbucks.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/coffee.png`, salesCount: 0, createdAt: '2024-01-07' 
      },
      { id: 14, name: '[OReilly] Designing Data-Intensive Applications', price: 45000, stock: 100, category: '도서', sellerId: 5, sellerName: '책방골목', brandName: '오라일리', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-oreilly.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/book-ddia.png`, salesCount: 0, createdAt: '2024-01-11' 
      },
      { id: 12, name: '[Samsung] 삼성 키보드 MX 기계식 유선', price: 125000, stock: 45, category: '전자기기', sellerId: 2, sellerName: '삼성공식몰', brandName: '삼성', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-samsung.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/keyboard.png`, salesCount: 0, createdAt: '2024-03-02'
      },
      { id: 15, name: '[Nike] Air Max 97 OG 실버 불렛 2024', price: 199000, stock: 50, category: '의류', sellerId: 3, sellerName: '패션창고', brandName: '나이키', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-nike.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/nike.png`, salesCount: 0, createdAt: '2023-12-30' 
      },
      { id: 4, name: '[Uniqlo] 프리미엄 리넨 셔츠 (긴팔) 화이트 L', price: 49000, stock: 100, category: '의류', sellerId: 3, sellerName: '패션창고', brandName: '유니클로', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-uniqlo.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/shirt.png`, salesCount: 0, createdAt: '2023-11-15' 
      },
      // 기타 나머지들
      { id: 13, name: '[Samsung] 삼성 갤럭시 S24 Ultra 512GB', price: 1450000, stock: 25, category: '전자기기', sellerId: 2, sellerName: '삼성공식몰', brandName: '삼성', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-samsung.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/samsung-phone.png`, salesCount: 0, createdAt: '2024-03-03'
      },
      { id: 1, name: '[Apple] 맥북 프로 14인치 M3 Pro 실버', price: 2990000, stock: 10, category: '전자기기', sellerId: 1, sellerName: '애플공식몰', brandName: '애플', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-apple.png`,
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/apple-laptop.png`, salesCount: 0, createdAt: '2023-12-01'
      },
      { id: 6, name: '[CJ] 서귀포 프리미엄 고당도 제주 감귤 2kg', price: 15000, stock: 200, category: '식품', sellerId: 4, sellerName: '먹거리세상', brandName: 'CJ', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-cj.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/tangerine.png`, salesCount: 0, createdAt: '2023-12-20' 
      },
      { id: 2, name: '[Apple] 아이폰 15 Pro 256GB 내추럴 티타늄', price: 1550000, stock: 25, category: '전자기기', sellerId: 1, sellerName: '애플공식몰', brandName: '애플', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-apple.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/apple-phone.png`, salesCount: 0, createdAt: '2023-12-05' 
      },
      { id: 3, name: '[Logitech] MX Keys Mini 무선 기계식 키보드', price: 89000, stock: 50, category: '전자기기', sellerId: 2, sellerName: '테크마트', brandName: '로지텍', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-logitech.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/keyboard.png`, salesCount: 0, createdAt: '2023-11-20' 
      },
      { id: 5, name: '[Zara] 슬림핏 스트레치 데님 팬츠 다크 블루', price: 79000, stock: 80, category: '의류', sellerId: 3, sellerName: '패션창고', brandName: '자라', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-zara.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/pants.png`, salesCount: 0, createdAt: '2023-11-10' 
      },
      { id: 8, name: '[Pearson] 클린 코드: 애자일 소프트웨어 장인 정신', price: 33000, stock: 60, category: '도서', sellerId: 5, sellerName: '책방골목', brandName: '피어슨', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-pearson.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/book-clean.png`, salesCount: 0, createdAt: '2023-10-01' 
      },
      { id: 9, name: '[OReilly] 자바 ORM 표준 JPA 프로그래밍 가이드', price: 38000, stock: 45, category: '도서', sellerId: 5, sellerName: '책방골목', brandName: '오라일리', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-oreilly.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/book-jpa.png`, salesCount: 0, createdAt: '2023-10-05' 
      },
      { id: 10, name: '[Muji] 스테인리스 보온 보냉 텀블러 500ml', price: 25000, stock: 120, category: '기타', sellerId: 6, sellerName: '라이프스토어', brandName: '무지', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-muji.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/tumbler.png`, salesCount: 0, createdAt: '2023-09-01' 
      },
      { id: 140, name: '[Sony] WH-1000XM5 노이즈 캔슬링 헤드폰', price: 450000, stock: 20, category: '전자기기', sellerId: 2, sellerName: '테크마트', brandName: '소니', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-sony.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/sony.png`, salesCount: 0, createdAt: '2023-08-01' 
      },
      { id: 155, name: '[LEGO] Star Wars 밀레니엄 팔콘 컬렉션', price: 210000, stock: 5, category: '기타', sellerId: 6, sellerName: '라이프스토어', brandName: '레고', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-lego.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/lego.png`, salesCount: 0, createdAt: '2024-01-12' }
    ];

    // 데이터 뻥튀기 및 판매량 교차 배정 로직
    const mockProducts: Product[] = [];
    let globalSalesSeed = 10000;

    for (let i = 0; i < 4; i++) {
      baseProducts.forEach(p => {
        mockProducts.push({
          ...p,
          id: p.id + (i * 1000), // ID 중복 방지
          name: i === 0 ? p.name : `${p.name} (Lot ${i + 1})`,
          stock: p.stock + (i * 10),
          // 전체 리스트에서 1씩 차감하여 완벽하게 요청 순서대로 교차 노출되도록 함
          salesCount: globalSalesSeed--
        });
      });
    }

    // 검색 및 정렬 필터링
    const query = finalQuery.toLowerCase();
    let filtered = mockProducts.filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.brandName ?? '').toLowerCase().includes(query) ||
      p.sellerName.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );

    // 정렬 로직 (기본값 sales)
    filtered.sort((a, b) => {
      if (sortBy === 'priceHigh') return b.price - a.price;
      if (sortBy === 'priceLow') return a.price - b.price;
      if (sortBy === 'sales') {
        return b.salesCount - a.salesCount;
      }
      if (sortBy === 'latest') {
        const dateA = new Date(a.createdAt || '2000-01-01').getTime();
        const dateB = new Date(b.createdAt || '2000-01-01').getTime();
        return dateB - dateA;
      }
      return 0;
    });

    setProducts(filtered);
  }, [finalQuery, sortBy]);

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
        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: isMobile ? 'column' : 'row' }}>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #000' }}
          >
            <option value="latest">최신순</option>
            <option value="priceHigh">높은가격순</option>
            <option value="priceLow">낮은가격순</option>
            <option value="sales">판매많은순</option>
          </select>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="상품, 브랜드, 판매자 검색..."
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
      </div>

      {products.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>검색 결과가 없습니다.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(250px, 1fr))', gap: isMobile ? '0.75rem' : '1.5rem' }}>
          {products.map(product => (
            <div key={product.id} style={{ border: '1px solid #ddd', padding: isMobile ? '0.75rem' : '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
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
                <div style={{ fontSize: '0.72rem', color: '#888', marginBottom: '0.2rem', fontWeight: 500 }}>
                  판매자: <Link to={`/seller/${product.sellerId}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                    {product.sellerName}
                  </Link>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                  {product.brandThumbnailUrl && (
                    <img src={product.brandThumbnailUrl} alt={product.brandName} style={{ width: '14px', height: '14px', border: '1px solid #eee', objectFit: 'contain', flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: '0.72rem', color: '#666' }}>
                    브랜드: {product.brandName}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#888' }}>
                  카테고리: {product.category}
                </div>
              </div>
              <Link to={`/product/${product.id}`} style={{ textDecoration: 'underline', color: '#000' }}>
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
              <div style={{ fontSize: '0.72rem', color: '#666', marginBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div>재고: <strong>{product.stock.toLocaleString()}개</strong></div>
                <div>판매: <strong>{product.salesCount.toLocaleString()}개</strong></div>
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
