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
      logoUrl: '/assets/sample/brand-apple.png',
      description: '혁신적인 기술과 디자인의 애플 공식 판매 상점입니다.'
    };
    setStoreInfo(mockStore);

    // 해당 판매자의 상품 목록 Mock
    const mockProducts: Product[] = [
      { id: 1, name: '[Apple] 맥북 프로 14인치 M3 Pro 실버', price: 2990000, stock: 10, category: '전자기기', sellerId: 1, sellerName: '애플공식몰', brandName: '애플', brandThumbnailUrl: '/assets/sample/brand-apple.png', thumbnailUrl1: '/assets/sample/macbook.jpg', salesCount: 15 },
      { id: 2, name: '[Apple] 아이폰 15 Pro 256GB 내추럴 티타늄', price: 1550000, stock: 25, category: '전자기기', sellerId: 1, sellerName: '애플공식몰', brandName: '애플', brandThumbnailUrl: '/assets/sample/brand-apple.png', thumbnailUrl1: '/assets/sample/iphone.jpg', salesCount: 42 },
    ];
    setProducts(mockProducts);
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

      {/* 상품 목록 (Home.tsx와 동일한 카드 레이아웃) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {products.map(product => (
          <div key={product.id} style={{ border: '1px solid #eee', padding: '1rem', position: 'relative' }}>
            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ color: '#999', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                ID: {String(product.id).padStart(8, '0')}
              </div>
              <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#f9f9f9', marginBottom: '1rem', overflow: 'hidden' }}>
                {product.thumbnailUrl1 && (
                  <img src={product.thumbnailUrl1} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem', height: '2.8rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {product.name}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{product.price.toLocaleString()}원</span>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>재고: {product.stock}개</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SellerStore;
