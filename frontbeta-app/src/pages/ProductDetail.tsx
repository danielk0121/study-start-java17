import { useParams, useNavigate } from 'react-router-dom';
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
    // Home.tsx와 SellerStore.tsx의 ID 생성 규칙을 반영하여 Mock 데이터 확장
    const baseProducts: Product[] = [
      { id: 11, name: '[Samsung] 삼성 노트북 갤럭시 북4 Pro', price: 1850000, stock: 30, category: '전자기기', sellerId: 2, sellerName: '테크마트', brandName: '삼성', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-samsung.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/macbook.png`, salesCount: 150
      },
      { id: 12, name: '[Samsung] 삼성 키보드 MX 기계식 유선', price: 125000, stock: 45, category: '전자기기', sellerId: 2, sellerName: '테크마트', brandName: '삼성', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-samsung.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/keyboard.png`, salesCount: 230
      },
      { id: 13, name: '[Samsung] 삼성 갤럭시 S24 Ultra 512GB', price: 1450000, stock: 25, category: '전자기기', sellerId: 2, sellerName: '테크마트', brandName: '삼성', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-samsung.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/galaxy.png`, salesCount: 320
      },
      {
        id: 1, name: '[Apple] 맥북 프로 14인치 M3 Pro 실버', price: 2990000, stock: 10, category: '전자기기',
        sellerId: 1, sellerName: '애플공식몰', brandName: '애플',
        brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-apple.png`,
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/macbook.png`,
        thumbnailUrl2: `${import.meta.env.BASE_URL}assets/sample/macbook.png`,
        thumbnailUrl3: `${import.meta.env.BASE_URL}assets/sample/macbook.png`,
        detailUrl1: `${import.meta.env.BASE_URL}assets/sample/macbook.png`,
        detailUrl2: `${import.meta.env.BASE_URL}assets/sample/macbook.png`,
        detailUrl3: `${import.meta.env.BASE_URL}assets/sample/macbook.png`,
        salesCount: 15
      },
      { id: 2, name: '[Apple] 아이폰 15 Pro 256GB 내추럴 티타늄', price: 1550000, stock: 25, category: '전자기기', sellerId: 1, sellerName: '애플공식몰', brandName: '애플', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-apple.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/iphone.png`, 
        thumbnailUrl2: `${import.meta.env.BASE_URL}assets/sample/iphone.png`,
        salesCount: 42 },
      { id: 3, name: '[Logitech] MX Keys Mini 무선 기계식 키보드', price: 89000, stock: 50, category: '전자기기', sellerId: 2, sellerName: '테크마트', brandName: '로지텍', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-logitech.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/keyboard.png`,
        thumbnailUrl2: `${import.meta.env.BASE_URL}assets/sample/keyboard.png`,
        salesCount: 120 },
      { id: 4, name: '[Uniqlo] 프리미엄 리넨 셔츠 (긴팔) 화이트 L', price: 49000, stock: 100, category: '의류', sellerId: 3, sellerName: '패션창고', brandName: '유니클로', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-uniqlo.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/shirt.png`, salesCount: 85 },
      { id: 5, name: '[Zara] 슬림핏 스트레치 데님 팬츠 다크 블루', price: 79000, stock: 80, category: '의류', sellerId: 3, sellerName: '패션창고', brandName: '자라', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-zara.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/pants.png`, salesCount: 60 },
      { id: 6, name: '[CJ] 서귀포 프리미엄 고당도 제주 감귤 2kg', price: 15000, stock: 200, category: '식품', sellerId: 4, sellerName: '먹거리세상', brandName: 'CJ', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-cj.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/tangerine.png`, salesCount: 350 },
      { id: 7, name: '[Starbucks] 하우스 블렌드 유기농 원두 500g', price: 22000, stock: 150, category: '식품', sellerId: 4, sellerName: '먹거리세상', brandName: '스타벅스', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-starbucks.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/coffee.png`, salesCount: 210 },
      { id: 8, name: '[Pearson] 클린 코드: 애자일 소프트웨어 장인 정신', price: 33000, stock: 60, category: '도서', sellerId: 5, sellerName: '책방골목', brandName: '피어슨', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-pearson.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/book-clean.png`, salesCount: 95 },
      { id: 9, name: '[OReilly] 자바 ORM 표준 JPA 프로그래밍 가이드', price: 38000, stock: 45, category: '도서', sellerId: 5, sellerName: '책방골목', brandName: '오라일리', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-oreilly.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/book-jpa.png`, salesCount: 78 },
      { id: 10, name: '[Muji] 스테인리스 보온 보냉 텀블러 500ml', price: 25000, stock: 120, category: '기타', sellerId: 6, sellerName: '라이프스토어', brandName: '무지', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-muji.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/tumbler.png`, salesCount: 45 },
      { id: 14, name: '[Sony] WH-1000XM5 노이즈 캔슬링 헤드폰', price: 450000, stock: 20, category: '전자기기', sellerId: 2, sellerName: '테크마트', brandName: '소니', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-sony.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/sony.png`, salesCount: 18 },
      { id: 15, name: '[Nike] Air Max 97 OG 실버 불렛 2024', price: 199000, stock: 50, category: '의류', sellerId: 3, sellerName: '패션창고', brandName: '나이키', brandThumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/brand-nike.png`, 
        thumbnailUrl1: `${import.meta.env.BASE_URL}assets/sample/nike.png`, salesCount: 112 }
    ];


    const mockProducts: Product[] = [];
    // Home.tsx 대응 (i * 1000)
    for (let i = 0; i < 10; i++) {
      baseProducts.forEach(p => {
        mockProducts.push({
          ...p,
          id: p.id + (i * 1000),
          name: i === 0 ? p.name : `${p.name} (Lot ${i + 1})`
        });
      });
    }
    // SellerStore.tsx 대응 (i * 100)
    for (let i = 0; i < 50; i++) {
      baseProducts.forEach(p => {
        const newId = p.id + (i * 100);
        if (!mockProducts.find(mp => mp.id === newId)) {
          mockProducts.push({
            ...p,
            id: newId,
            name: `${p.name} #${i + 1}`
          });
        }
      });
    }

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
          <div style={{ fontSize: '1rem', color: '#666', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {product.brandThumbnailUrl && (
              <img src={product.brandThumbnailUrl} alt={product.brandName} style={{ width: '30px', height: '30px', border: '1px solid #eee', objectFit: 'contain' }} />
            )}
            <span>{product.brandName ? `${product.brandName} | ` : ''}{product.category}</span>
            <small style={{ color: '#999', fontFamily: 'monospace' }}>(ID: {product.id.toString().padStart(8, '0')})</small>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>
            판매자: <strong style={{ color: '#333' }}>{product.sellerName}</strong>
          </div>
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
          {product.brandName && <>이 상품은 {product.brandName} 브랜드의 정품입니다.<br /></>}
          카테고리: {product.category}<br />
          판매자: {product.sellerName}<br />
          상품 ID: <span style={{ fontFamily: 'monospace' }}>{product.id.toString().padStart(8, '0')}</span>
        </p>
      </div>
    </div>
  );
}

export default ProductDetail;
