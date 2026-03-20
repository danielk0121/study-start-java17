import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { Product } from '../types';
import { useIsMobile } from '../hooks/useIsMobile';

/**
 * 상품 상세 페이지
 * UC_PROD_07 구현 (Prototype - 이미지 3장씩 추가 및 브랜드 썸네일)
 */
function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeThumb, setActiveThumb] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Flyway 샘플 데이터를 기반으로 한 Mock 데이터 조회 시뮬레이션
    const mockProducts: Product[] = [
      {
        id: 1, name: '[Apple] 맥북 프로 14인치 M3 Pro 실버', price: 2990000, stock: 10, category: '전자기기', brandName: '애플',
        brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=A',
        sellerId: 1, sellerName: '애플공식몰',
        thumbnailUrl1: 'https://via.placeholder.com/400x400?text=MacBook+Thumb+1',
        thumbnailUrl2: 'https://via.placeholder.com/400x400?text=MacBook+Thumb+2',
        thumbnailUrl3: 'https://via.placeholder.com/400x400?text=MacBook+Thumb+3',
        detailUrl1: 'https://via.placeholder.com/800x600?text=MacBook+Detail+1',
        detailUrl2: 'https://via.placeholder.com/800x600?text=MacBook+Detail+2',
        detailUrl3: 'https://via.placeholder.com/800x600?text=MacBook+Detail+3',
        salesCount: 15
      },
      { id: 2, name: '[Apple] 아이폰 15 Pro 256GB 내추럴 티타늄', price: 1550000, stock: 25, category: '전자기기', brandName: '애플', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=A', sellerId: 1, sellerName: '애플공식몰', salesCount: 42 },
      { id: 3, name: '[Logitech] MX Keys Mini 무선 기계식 키보드', price: 89000, stock: 50, category: '전자기기', brandName: '로지텍', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=L', sellerId: 2, sellerName: '로지텍코리아', salesCount: 120 }
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

  const thumbnails = [product.thumbnailUrl1, product.thumbnailUrl2, product.thumbnailUrl3].filter(Boolean);
  const details = [product.detailUrl1, product.detailUrl2, product.detailUrl3].filter(Boolean);

  const handleAddToCart = () => {
    alert(`${product.name}이(가) 장바구니에 담겼습니다.`);
  };

  const imageSize = isMobile ? '100%' : '400px';

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
      >
        &lt; 뒤로가기
      </button>

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '1.5rem' : '3rem', alignItems: 'start' }}>
        {/* 이미지 영역 */}
        <div style={{ width: imageSize, flexShrink: 0 }}>
          <div style={{
            width: '100%',
            paddingTop: isMobile ? '0' : '0',
            height: isMobile ? '280px' : '400px',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #ddd',
            marginBottom: '1rem'
          }}>
            {thumbnails[activeThumb] ? (
              <img src={thumbnails[activeThumb] as string} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#ccc' }}>이미지 없음</span>
            )}
          </div>

          {/* 썸네일 리스트 (3장) */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[0, 1, 2].map(idx => (
              <div
                key={idx}
                onClick={() => setActiveThumb(idx)}
                style={{
                  width: isMobile ? '72px' : '80px',
                  height: isMobile ? '72px' : '80px',
                  border: activeThumb === idx ? '2px solid #000' : '1px solid #ddd',
                  backgroundColor: '#f9f9f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {thumbnails[idx] ? (
                  <img src={thumbnails[idx] as string} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <small style={{ color: '#ccc' }}>No Image</small>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '1rem', color: '#666', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {product.brandThumbnailUrl && (
              <img src={product.brandThumbnailUrl} alt={product.brandName} style={{ width: '30px', height: '30px', border: '1px solid #eee', objectFit: 'contain' }} />
            )}
            <span>{product.brandName} | {product.category}</span>
            <small style={{ color: '#999', fontFamily: 'monospace' }}>(ID: {product.id.toString().padStart(8, '0')})</small>
          </div>
          {product.sellerId && product.sellerName && (
            <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '0.5rem' }}>
              판매자:{' '}
              <Link to={`/seller/${product.sellerId}`} style={{ color: '#d00', textDecoration: 'underline', fontWeight: 'bold' }}>
                {product.sellerName}
              </Link>
            </div>
          )}
          <h1 style={{ margin: '0 0 1.5rem 0', fontSize: isMobile ? '1.6rem' : '2.5rem' }}>{product.name}</h1>

          <div style={{ borderTop: '2px solid #000', borderBottom: '1px solid #eee', padding: '1.5rem 0', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#666' }}>판매가</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{product.price.toLocaleString()}원</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#666' }}>재고수량</span>
              <span>{product.stock}개</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>누적 판매량</span>
              <span style={{ fontWeight: 'bold' }}>{product.salesCount}개</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleAddToCart}
              style={{ flex: 1, padding: '1.2rem', fontSize: isMobile ? '0.95rem' : '1.1rem', cursor: 'pointer', border: '1px solid #000', backgroundColor: '#fff' }}
            >
              장바구니 담기
            </button>
            <button style={{ flex: 1, padding: '1.2rem', fontSize: isMobile ? '0.95rem' : '1.1rem', cursor: 'pointer', border: 'none', backgroundColor: '#000', color: '#fff' }}>
              바로 구매하기
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '4rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
        <h3>상품 상세 설명</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          {details.length > 0 ? details.map((url, idx) => (
            <img key={idx} src={url as string} alt={`detail-${idx}`} style={{ width: '100%', maxWidth: '800px' }} />
          )) : (
            <p style={{ color: '#666' }}>상세 이미지가 등록되지 않았습니다.</p>
          )}
        </div>
        <p style={{ color: '#444', lineHeight: '1.6', marginTop: '2rem' }}>
          이 상품은 {product.brandName} 브랜드의 정품입니다.<br />
          카테고리: {product.category}<br />
          상품 ID: <span style={{ fontFamily: 'monospace' }}>{product.id.toString().padStart(8, '0')}</span>
        </p>
      </div>
    </div>
  );
}

export default ProductDetail;
