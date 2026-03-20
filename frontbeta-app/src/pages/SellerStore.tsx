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
  const [products, setProducts] = useState<Product[]>([]);
  const [storeInfo, setStoreInfo] = useState<{ name: string; logoUrl: string; description: string } | null>(null);

  useEffect(() => {
    // 판매자 정보 Mock
    const mockStore = {
      name: '애플공식몰',
      logoUrl: `${import.meta.env.BASE_URL}assets/sample/brand-apple.png`,
      description: '혁신적인 기술과 디자인의 애플 공식 판매 상점입니다.'
    };
    setStoreInfo(mockStore);

    // 해당 판매자의 상품 목록 Mock (50개 이상으로 확장)
    const baseProducts: Product[] = [
      { id: 1, name: '[Apple] 맥북 프로 14인치 M3 Pro 실버', price: 2990000, stock: 10, category: '전자기기', sellerId: 1, sellerName: '애플공식몰', brandName: '애플', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-apple.png`, thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/macbook.png`, salesCount: 15 },
      { id: 2, name: '[Apple] 아이폰 15 Pro 256GB 내추럴 티타늄', price: 1550000, stock: 25, category: '전자기기', sellerId: 1, sellerName: '애플공식몰', brandName: '애플', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-apple.png`, thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/iphone.png`, salesCount: 42 },
    ];

    const extendedProducts: Product[] = [];
    for (let i = 0; i < 25; i++) {
      baseProducts.forEach(p => {
        extendedProducts.push({
          ...p,
          id: p.id + (i * 100),
          name: `${p.name} #${i + 1}`,
          stock: p.stock + i,
          salesCount: p.salesCount + (i * 2)
        });
      });
    }
    setProducts(extendedProducts);
  }, [id]);

  if (!storeInfo) return null;

  return (
    <div>
      {/* 상점 헤더 */}
      <div style={{ 
        padding: '2rem', 
        border: '1px solid #000', 
        marginBottom: '2rem', 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center', 
        gap: '2rem' 
      }}>
        <img src={storeInfo.logoUrl} alt={storeInfo.name} style={{ width: '100px', height: '100px', border: '1px solid #eee' }} />
        <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>{storeInfo.name}</h1>
          <p style={{ margin: 0, color: '#666' }}>{storeInfo.description}</p>
        </div>
      </div>

      <h2 style={{ marginBottom: '1.5rem' }}>판매 상품 목록 ({products.length})</h2>

      {/* 상품 목록 (Home.tsx와 동일한 카드 레이아웃, 모바일 2열) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: isMobile ? '0.5rem' : '1.5rem'
      }}>
        {products.map(product => (
          <div key={product.id} style={{ 
            border: '1px solid #eee', 
            padding: isMobile ? '0.5rem' : '1rem', 
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                      alignItems: 'center'
                    }}
                  >
                    <img src={`${import.meta.env.BASE_URL}icons.svg#cart`} alt="cart" style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SellerStore;
