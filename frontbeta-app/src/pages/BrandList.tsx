import { useState, useEffect } from 'react';

interface BrandSummary {
  id: number;
  name: string;
  productCount: number;
}

/**
 * 브랜드관 페이지
 * UC_PROD_06 구현 (Prototype)
 */
function BrandList() {
  const [brands, setBrands] = useState<BrandSummary[]>([]);

  useEffect(() => {
    // V10 샘플 데이터를 기반으로 한 브랜드별 상품 개수 Mock 데이터
    const mockBrands: BrandSummary[] = [
      { id: 1, name: 'Apple', productCount: 2 },
      { id: 2, name: 'Samsung', productCount: 3 },
      { id: 3, name: 'Sony', productCount: 2 },
      { id: 4, name: 'LG', productCount: 1 },
      { id: 5, name: 'Dell', productCount: 1 },
      { id: 6, name: 'Nike', productCount: 2 },
      { id: 7, name: 'Adidas', productCount: 2 },
      { id: 8, name: 'Uniqlo', productCount: 1 },
      { id: 11, name: 'Nestle', productCount: 1 },
      { id: 12, name: 'Coca-Cola', productCount: 2 },
      { id: 16, name: 'OReilly', productCount: 2 },
      { id: 17, name: 'Manning', productCount: 1 },
      { id: 21, name: 'Starbucks', productCount: 1 },
      { id: 24, name: 'Dyson', productCount: 1 },
      { id: 31, name: 'Logitech', productCount: 1 },
      { id: 41, name: 'Vans', productCount: 1 },
      { id: 46, name: 'LEGO', productCount: 1 },
      { id: 47, name: 'Nintendo', productCount: 1 }
    ];
    setBrands(mockBrands);
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>브랜드관</h1>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {brands.map(brand => (
          <div key={brand.id} style={{ 
            border: '1px solid #000', 
            padding: '2rem', 
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: '#fff'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>{brand.name}</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
              상품 <strong>{brand.productCount}</strong>개
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BrandList;
