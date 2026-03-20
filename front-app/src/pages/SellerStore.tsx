import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import type { Product } from '../types';

interface SellerInfo {
  id: number;
  name: string;
  thumbnailUrl?: string;
  description: string;
  productCount: number;
}

const mockSellers: SellerInfo[] = [
  { id: 1, name: '애플공식몰', thumbnailUrl: 'https://via.placeholder.com/100x100?text=Apple', description: 'Apple 공식 판매 스토어', productCount: 2 },
  { id: 2, name: '로지텍코리아', thumbnailUrl: 'https://via.placeholder.com/100x100?text=Logi', description: 'Logitech 공식 판매 스토어', productCount: 1 },
  { id: 3, name: '패션브랜드샵', thumbnailUrl: 'https://via.placeholder.com/100x100?text=Fashion', description: '유니클로·자라 공식 판매 스토어', productCount: 2 },
  { id: 4, name: '푸드마켓', thumbnailUrl: 'https://via.placeholder.com/100x100?text=Food', description: '신선식품 전문 판매 스토어', productCount: 2 },
  { id: 5, name: '북스토어', thumbnailUrl: 'https://via.placeholder.com/100x100?text=Books', description: '도서 전문 판매 스토어', productCount: 3 },
  { id: 6, name: '라이프스타일샵', thumbnailUrl: 'https://via.placeholder.com/100x100?text=Life', description: '생활용품 전문 판매 스토어', productCount: 3 },
];

const mockSellerProducts: Record<number, Product[]> = {
  1: [
    { id: 1, name: '[Apple] 맥북 프로 14인치 M3 Pro 실버', price: 2990000, stock: 10, category: '전자기기', brandName: '애플', sellerId: 1, sellerName: '애플공식몰', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=A', thumbnailUrl1: 'https://via.placeholder.com/400x400?text=MacBook', salesCount: 15 },
    { id: 2, name: '[Apple] 아이폰 15 Pro 256GB 내추럴 티타늄', price: 1550000, stock: 25, category: '전자기기', brandName: '애플', sellerId: 1, sellerName: '애플공식몰', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=A', salesCount: 42 },
  ],
  2: [
    { id: 3, name: '[Logitech] MX Keys Mini 무선 기계식 키보드', price: 89000, stock: 50, category: '전자기기', brandName: '로지텍', sellerId: 2, sellerName: '로지텍코리아', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=L', salesCount: 120 },
  ],
  3: [
    { id: 4, name: '[Uniqlo] 프리미엄 리넨 셔츠 (긴팔) 화이트 L', price: 49000, stock: 100, category: '의류', brandName: '유니클로', sellerId: 3, sellerName: '패션브랜드샵', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=U', salesCount: 85 },
    { id: 5, name: '[Zara] 슬림핏 스트레치 데님 팬츠 다크 블루', price: 79000, stock: 80, category: '의류', brandName: '자라', sellerId: 3, sellerName: '패션브랜드샵', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=Z', salesCount: 60 },
  ],
  4: [
    { id: 6, name: '[CJ] 서귀포 프리미엄 고당도 제주 감귤 2kg', price: 15000, stock: 200, category: '식품', brandName: 'CJ', sellerId: 4, sellerName: '푸드마켓', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=C', salesCount: 350 },
    { id: 7, name: '[Starbucks] 하우스 블렌드 유기농 원두 500g', price: 22000, stock: 150, category: '식품', brandName: '스타벅스', sellerId: 4, sellerName: '푸드마켓', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=S', salesCount: 210 },
  ],
  5: [
    { id: 8, name: '[Pearson] 클린 코드: 애자일 소프트웨어 장인 정신', price: 33000, stock: 60, category: '도서', brandName: '피어슨', sellerId: 5, sellerName: '북스토어', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=P', salesCount: 95 },
    { id: 9, name: '[OReilly] 자바 ORM 표준 JPA 프로그래밍 가이드', price: 38000, stock: 45, category: '도서', brandName: '오라일리', sellerId: 5, sellerName: '북스토어', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=O', salesCount: 78 },
    { id: 14, name: '[OReilly] Designing Data-Intensive Applications', price: 45000, stock: 100, category: '도서', brandName: '오라일리', sellerId: 5, sellerName: '북스토어', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=O', salesCount: 54 },
  ],
  6: [
    { id: 10, name: '[Muji] 스테인리스 보온 보냉 텀블러 500ml', price: 25000, stock: 120, category: '기타', brandName: '무지', sellerId: 6, sellerName: '라이프스타일샵', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=M', salesCount: 45 },
    { id: 13, name: '[Nike] Air Max 97 OG 실버 불렛 2024', price: 199000, stock: 50, category: '의류', brandName: '나이키', sellerId: 6, sellerName: '라이프스타일샵', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=N', salesCount: 112 },
    { id: 15, name: '[LEGO] Star Wars 밀레니엄 팔콘 컬렉션', price: 210000, stock: 5, category: '기타', brandName: '레고', sellerId: 6, sellerName: '라이프스타일샵', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=L', salesCount: 29 },
  ],
};

/**
 * 판매자스토어 페이지
 * 특정 판매자의 스토어 정보와 등록 상품 목록을 표시
 */
function SellerStore() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    var id = Number(sellerId);
    var foundSeller = mockSellers.find(s => s.id === id) ?? null;
    var foundProducts = mockSellerProducts[id] ?? [];
    setSeller(foundSeller);
    setProducts(foundProducts);
  }, [sellerId]);

  if (!seller) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>판매자 정보를 찾을 수 없습니다.</p>
        <button onClick={() => navigate(-1)} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>뒤로가기</button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
      >
        &lt; 뒤로가기
      </button>

      {/* 판매자 정보 헤더 */}
      <div style={{
        border: '1px solid #000',
        padding: isMobile ? '1rem' : '2rem',
        marginBottom: '2rem',
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center'
      }}>
        <div style={{
          width: isMobile ? '70px' : '100px',
          height: isMobile ? '70px' : '100px',
          flexShrink: 0,
          backgroundColor: '#f0f0f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee'
        }}>
          {seller.thumbnailUrl ? (
            <img src={seller.thumbnailUrl} alt={seller.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{ color: '#ccc' }}>Logo</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#999', fontSize: '0.75rem', fontFamily: 'monospace', marginBottom: '0.3rem' }}>
            판매자 ID: {seller.id.toString().padStart(8, '0')}
          </div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: isMobile ? '1.4rem' : '2rem' }}>{seller.name}</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{seller.description}</p>
          <p style={{ margin: '0.5rem 0 0 0', color: '#333', fontSize: '0.85rem' }}>
            등록 상품 <strong>{products.length}</strong>개
          </p>
        </div>
      </div>

      {/* 상품 목록 */}
      <h2 style={{ marginBottom: '1rem', borderBottom: '2px solid #000', paddingBottom: '0.5rem' }}>판매 상품</h2>
      {products.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>등록된 상품이 없습니다.</p>
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
              <p style={{ fontWeight: 'bold', fontSize: isMobile ? '0.95rem' : '1.1rem', margin: 0 }}>{product.price.toLocaleString()}원</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerStore;
