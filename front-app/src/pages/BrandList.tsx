import { useState, useEffect } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

interface BrandProduct {
  id: number;
  name: string;
  price: number;
  thumbnailUrl?: string;
}

interface BrandSummary {
  id: number;
  name: string;
  thumbnailUrl?: string;
  productCount: number;
  products: BrandProduct[];
}

/**
 * 브랜드관 페이지
 * UC_PROD_06 구현 (Prototype - 브랜드별 상품 정보 및 검색 추가)
 */
function BrandList() {
  const [brands, setBrands] = useState<BrandSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [finalQuery, setFinalQuery] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    // V10 샘플 데이터를 기반으로 한 브랜드별 상품 정보 Mock 데이터
    const allBrands: BrandSummary[] = [
      {
        id: 1, name: '애플', productCount: 2,
        thumbnailUrl: 'https://via.placeholder.com/150x150?text=Apple',
        products: [
          { id: 1, name: '맥북 프로 14인치', price: 2990000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=MacBook' },
          { id: 2, name: '아이폰 15 Pro', price: 1550000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=iPhone' }
        ]
      },
      {
        id: 2, name: '삼성', productCount: 2,
        thumbnailUrl: 'https://via.placeholder.com/150x150?text=Samsung',
        products: [
          { id: 11, name: 'Galaxy S24', price: 1150000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=S24' },
          { id: 22, name: 'Galaxy Watch 6', price: 320000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=Watch6' }
        ]
      },
      {
        id: 3, name: '소니', productCount: 2,
        thumbnailUrl: 'https://via.placeholder.com/150x150?text=Sony',
        products: [
          { id: 12, name: 'WH-1000XM5', price: 450000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=SonyHead' },
          { id: 23, name: 'PlayStation 5', price: 620000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=PS5' }
        ]
      },
      {
        id: 6, name: '나이키', productCount: 2,
        thumbnailUrl: 'https://via.placeholder.com/150x150?text=Nike',
        products: [
          { id: 13, name: 'Air Max 97', price: 199000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=AirMax' },
          { id: 24, name: 'Jordan 1 Retro', price: 239000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=Jordan' }
        ]
      },
      {
        id: 12, name: '코카콜라', productCount: 2,
        thumbnailUrl: 'https://via.placeholder.com/150x150?text=Coke',
        products: [
          { id: 19, name: 'Coke Zero 500ml', price: 2000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=Coke' },
          { id: 26, name: 'Sprite 1.5L', price: 3000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=Sprite' }
        ]
      },
      {
        id: 16, name: '오라일리', productCount: 2,
        thumbnailUrl: 'https://via.placeholder.com/150x150?text=OReilly',
        products: [
          { id: 18, name: 'Designing Data-Intensive Applications', price: 45000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=DDIA' },
          { id: 38, name: 'Python Crash Course', price: 38000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=Python' }
        ]
      }
    ];

    const query = finalQuery.toLowerCase();
    const filtered = allBrands.map(brand => {
      const filteredProducts = brand.products.filter(p =>
        brand.name.toLowerCase().includes(query) ||
        p.name.toLowerCase().includes(query)
      );

      return {
        ...brand,
        products: brand.name.toLowerCase().includes(query) ? brand.products : filteredProducts,
        isVisible: brand.name.toLowerCase().includes(query) || filteredProducts.length > 0
      };
    }).filter(b => (b as any).isVisible);

    setBrands(filtered);
  }, [finalQuery]);

  const handleSearch = () => {
    setFinalQuery(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? '0.75rem' : '0',
        marginBottom: '2rem'
      }}>
        <h1 style={{ margin: 0 }}>브랜드관</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="브랜드명, 상품명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ padding: '0.6rem 1rem', flex: 1, minWidth: 0, border: '1px solid #000' }}
          />
          <button
            onClick={handleSearch}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            검색
          </button>
        </div>
      </div>

      {brands.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>검색 결과가 없습니다.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {brands.map(brand => (
            <div key={brand.id} style={{
              border: '1px solid #000',
              padding: isMobile ? '1rem' : '2rem',
              backgroundColor: '#fff'
            }}>
              <div style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                borderBottom: '2px solid #eee',
                paddingBottom: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  width: isMobile ? '70px' : '100px',
                  height: isMobile ? '70px' : '100px',
                  flexShrink: 0,
                  backgroundColor: '#f0f0f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee'
                }}>
                  {brand.thumbnailUrl ? (
                    <img src={brand.thumbnailUrl} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ color: '#ccc' }}>Logo</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ margin: '0 0 0.5rem 0' }}>{brand.name}</h2>
                  <span style={{ color: '#666', fontSize: '0.9rem' }}>
                    등록 상품 <strong>{brand.productCount}</strong>개
                  </span>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1rem'
              }}>
                {brand.products.map(product => (
                  <div key={product.id} style={{
                    padding: '1rem',
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      width: '60px', height: '60px', flexShrink: 0, backgroundColor: '#f0f0f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {product.thumbnailUrl ? (
                        <img src={product.thumbnailUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: '#ccc', fontSize: '0.6rem' }}>No Img</span>
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: '#999', fontSize: '0.75rem', marginBottom: '0.1rem', fontFamily: 'monospace' }}>ID: {product.id.toString().padStart(8, '0')}</div>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.2rem', fontSize: '0.9rem', wordBreak: 'break-word' }}>{product.name}</div>
                      <div style={{ color: '#d00', fontSize: '0.85rem' }}>{product.price.toLocaleString()}원</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BrandList;
