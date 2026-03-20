import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Product } from '../types';
import { useIsMobile } from '../hooks/useIsMobile';

/**
 * 판매자 상점 페이지 (Seller Store)
 * UC_STORE_02 구현 (Prototype)
 */
function SellerStore() {
  const { id } = useParams<{ id: string }>();
  const isMobile = useIsMobile();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [storeInfo, setStoreInfo] = useState<{ name: string; logoUrl?: string; logoEmoji?: string; description: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [finalQuery, setFinalQuery] = useState('');

  useEffect(() => {
    // 판매자 정보 Mock
    const isSamsung = id === '2';
    const isFood = id === '4';

    const mockStore = isSamsung ? {
      name: '삼성공식몰',
      logoUrl: `${import.meta.env.BASE_URL}assets/sample/brand-samsung.png`,
      description: '함께 가요 미래로! 삼성 공식 판매 상점입니다.'
    } : isFood ? {
      name: '먹거리세상',
      logoEmoji: '🍎',
      description: '신선하고 건강한 먹거리를 제공하는 일반 판매 상점입니다.'
    } : {
      name: '애플공식몰',
      logoUrl: `${import.meta.env.BASE_URL}assets/sample/brand-apple.png`,
      description: '혁신적인 기술과 디자인의 애플 공식 판매 상점입니다.'
    };
    setStoreInfo(mockStore);

    // 해당 판매자의 상품 목록 Mock (50개 이상으로 확장)
    const baseProducts: Product[] = isSamsung ? [
      { id: 11, name: '[Samsung] 삼성 노트북 갤럭시 북4 Pro', price: 1850000, stock: 30, category: '전자기기', sellerId: 2, sellerName: '삼성공식몰', brandName: '삼성', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-samsung.png`, thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/samsung-laptop.png`, salesCount: 150, createdAt: '2024-03-01' },
      { id: 12, name: '[Samsung] 삼성 키보드 MX 기계식 유선', price: 125000, stock: 45, category: '전자기기', sellerId: 2, sellerName: '삼성공식몰', brandName: '삼성', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-samsung.png`, thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/keyboard.png`, salesCount: 230, createdAt: '2024-03-02' },
      { id: 13, name: '[Samsung] 삼성 갤럭시 S24 Ultra 512GB', price: 1450000, stock: 25, category: '전자기기', sellerId: 2, sellerName: '삼성공식몰', brandName: '삼성', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-samsung.png`, thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/samsung-phone.png`, salesCount: 320, createdAt: '2024-03-03' },
    ] : isFood ? [
      { id: 6, name: '[CJ] 서귀포 프리미엄 고당도 제주 감귤 2kg', price: 15000, stock: 200, category: '식품', sellerId: 4, sellerName: '먹거리세상', brandName: 'CJ', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-cj.png`, thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/tangerine.png`, salesCount: 350, createdAt: '2024-01-01' },
      { id: 7, name: '[Starbucks] 하우스 블렌드 유기농 원두 500g', price: 22000, stock: 150, category: '식품', sellerId: 4, sellerName: '먹거리세상', brandName: '스타벅스', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-starbucks.png`, thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/coffee.png`, salesCount: 210, createdAt: '2024-01-02' },
    ] : [
      { id: 1, name: '[Apple] 맥북 프로 14인치 M3 Pro 실버', price: 2990000, stock: 10, category: '전자기기', sellerId: 1, sellerName: '애플공식몰', brandName: '애플', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-apple.png`, thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/apple-laptop.png`, salesCount: 15, createdAt: '2024-02-01' },
      { id: 2, name: '[Apple] 아이폰 15 Pro 256GB 내추럴 티타늄', price: 1550000, stock: 25, category: '전자기기', sellerId: 1, sellerName: '애플공식몰', brandName: '애플', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-apple.png`, thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/apple-phone.png`, salesCount: 42, createdAt: '2024-02-02' },
    ];

    const extendedProducts: Product[] = [];
    for (let i = 0; i < 25; i++) {
      baseProducts.forEach(p => {
        extendedProducts.push({
          ...p,
          id: p.id + (i * 100),
          name: i === 0 ? p.name : `${p.name} #${i + 1}`,
          stock: p.stock + i,
          salesCount: p.salesCount + (i * 2)
        });
      });
    }
    setAllProducts(extendedProducts);
    setFilteredProducts(extendedProducts);
  }, [id]);

  useEffect(() => {
    const query = finalQuery.toLowerCase();
    const filtered = allProducts.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.brandName ?? '').toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  }, [finalQuery, allProducts]);

  const handleSearch = () => {
    setFinalQuery(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  if (!storeInfo) return null;

  return (
    <div style={{ minHeight: '80vh' }}>
      {/* 상점 헤더 */}
      <div style={{ 
        padding: '1rem', 
        border: '1px solid #000', 
        backgroundColor: '#fff',
        marginBottom: '1.5rem', 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center', 
        gap: '1.5rem' 
      }}>
        {storeInfo.logoUrl ? (
          <img src={storeInfo.logoUrl} alt={storeInfo.name} style={{ width: '60px', height: '60px', border: '1px solid #eee', objectFit: 'contain' }} />
        ) : (
          <div style={{ width: '60px', height: '60px', border: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', backgroundColor: '#f9f9f9' }}>
            {storeInfo.logoEmoji}
          </div>
        )}
        <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
          <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem' }}>{storeInfo.name}</h1>
          <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>{storeInfo.description}</p>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', justifyContent: isMobile ? 'center' : 'flex-start' }}>
            <span>월간판매량 <strong style={{ color: '#d00' }}>{id === '2' ? '2,400' : '1,250'}개</strong></span>
            <span style={{ color: '#ccc' }}>|</span>
            <span>누적판매량 <strong>{id === '2' ? '85,000' : '45,800'}개</strong></span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? '0.75rem' : '0',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ margin: 0 }}>판매 상품 목록 ({filteredProducts.length})</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="상점 내 상품 검색..."
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

      {/* 상품 목록 (Home.tsx와 동일한 카드 레이아웃, 모바일 2열) */}
      {filteredProducts.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>검색 결과가 없습니다.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: isMobile ? '0.5rem' : '1.5rem'
        }}>
          {filteredProducts.map(product => (
            <div key={product.id} style={{ 
              border: '1px solid #eee', 
              padding: isMobile ? '0.5rem' : '1rem', 
              position: 'relative',
              display: 'flex',
              backgroundColor: '#fff',
              flexDirection: 'column'
            }}>
              <Link to={`/product/${product.id}`} style={{ textDecoration: 'underline', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ color: '#999', fontSize: '0.7rem', marginBottom: '0.3rem' }}>
                  ID: {String(product.id).padStart(8, '0')}
                </div>
                
                <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#f9f9f9', marginBottom: '0.75rem', overflow: 'hidden', position: 'relative' }}>
                  {product.thumbnailUrl1 && (
                    <img src={product.thumbnailUrl1} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>

                {/* 브랜드 및 카테고리 정보 (Home.tsx 스타일) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  {product.brandThumbnailUrl && (
                    <img src={product.brandThumbnailUrl} alt={product.brandName} style={{ width: '16px', height: '16px', border: '1px solid #eee', objectFit: 'contain', flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: '0.75rem', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {product.brandName}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#999', marginBottom: '0.4rem' }}>
                  {product.category} · {product.sellerName}
                </div>

                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: isMobile ? '0.85rem' : '1rem', 
                  marginBottom: '0.75rem', 
                  height: isMobile ? '2.4rem' : '2.8rem', 
                  overflow: 'hidden', 
                  display: '-webkit-box', 
                  WebkitLineClamp: 2, 
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.4
                }}>
                  {product.name}
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.3rem' }}>
                    재고: {product.stock}개 <span style={{ marginLeft: '0.5rem' }}>판매: {product.salesCount}개</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: isMobile ? '1rem' : '1.2rem' }}>{product.price.toLocaleString()}원</span>
                    <button 
                      onClick={(e) => { e.preventDefault(); alert('장바구니에 담겼습니다.'); }}
                      style={{ 
                        padding: '0.3rem', 
                        backgroundColor: '#fff', 
                        border: '1px solid #ccc', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '1rem'
                      }}
                    >
                      🛒
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerStore;
