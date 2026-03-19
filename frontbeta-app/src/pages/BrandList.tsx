import { useState, useEffect } from 'react';

interface BrandProduct {
  id: number;
  name: string;
  price: number;
  thumbnailUrl?: string;
}

interface BrandSummary {
  id: number;
  name: string;
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

  useEffect(() => {
    // V10 샘플 데이터를 기반으로 한 브랜드별 상품 정보 Mock 데이터
    const allBrands: BrandSummary[] = [
      { 
        id: 1, name: 'Apple', productCount: 2, 
        products: [
          { id: 1, name: '맥북 프로 14인치', price: 2990000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=MacBook' },
          { id: 2, name: '아이폰 15 Pro', price: 1550000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=iPhone' }
        ] 
      },
      { 
        id: 2, name: 'Samsung', productCount: 2, 
        products: [
          { id: 11, name: 'Galaxy S24', price: 1150000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=S24' },
          { id: 22, name: 'Galaxy Watch 6', price: 320000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=Watch6' }
        ] 
      },
      { 
        id: 3, name: 'Sony', productCount: 2, 
        products: [
          { id: 12, name: 'WH-1000XM5', price: 450000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=SonyHead' },
          { id: 23, name: 'PlayStation 5', price: 620000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=PS5' }
        ] 
      },
      { 
        id: 6, name: 'Nike', productCount: 2, 
        products: [
          { id: 13, name: 'Air Max 97', price: 199000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=AirMax' },
          { id: 24, name: 'Jordan 1 Retro', price: 239000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=Jordan' }
        ] 
      },
      { 
        id: 12, name: 'Coca-Cola', productCount: 2, 
        products: [
          { id: 19, name: 'Coke Zero 500ml', price: 2000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=Coke' },
          { id: 26, name: 'Sprite 1.5L', price: 3000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=Sprite' }
        ] 
      },
      { 
        id: 16, name: 'OReilly', productCount: 2, 
        products: [
          { id: 18, name: 'Designing Data-Intensive Applications', price: 45000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=DDIA' },
          { id: 38, name: 'Python Crash Course', price: 38000, thumbnailUrl: 'https://via.placeholder.com/100x100?text=Python' }
        ] 
      }
    ];

    const query = finalQuery.toLowerCase();
    const filtered = allBrands.map(brand => {
      // 브랜드명이 일치하거나, 상품명 중 하나라도 일치하는 상품들을 찾음
      const filteredProducts = brand.products.filter(p => 
        brand.name.toLowerCase().includes(query) || 
        p.name.toLowerCase().includes(query)
      );
      
      // 브랜드 자체가 일치하면 모든 상품 노출, 아니면 필터링된 상품만 노출
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>브랜드관</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="브랜드명, 상품명 검색..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ padding: '0.6rem 1rem', width: '300px', border: '1px solid #000' }}
          />
          <button 
            onClick={handleSearch}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            검색
          </button>
        </div>
      </div>

      {brands.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>검색 결과가 없습니다.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {brands.map(brand => (
            <div key={brand.id} style={{ 
              border: '1px solid #000', 
              padding: '1.5rem', 
              backgroundColor: '#fff'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'baseline',
                borderBottom: '2px solid #eee',
                paddingBottom: '1rem',
                marginBottom: '1rem'
              }}>
                <h2 style={{ margin: 0 }}>{brand.name}</h2>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>
                  전체 상품 <strong>{brand.productCount}</strong>개
                </span>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
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
                      width: '60px', height: '60px', backgroundColor: '#f0f0f0', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                      {product.thumbnailUrl ? (
                        <img src={product.thumbnailUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: '#ccc', fontSize: '0.6rem' }}>No Img</span>
                      )}
                    </div>
                    <div>
                      <div style={{ color: '#999', fontSize: '0.75rem', marginBottom: '0.1rem' }}>ID: {product.id}</div>
                      <div style={{ fontWeight: 'bold', marginBottom: '0.2rem', fontSize: '0.9rem' }}>{product.name}</div>
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
