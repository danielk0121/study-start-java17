import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

interface SellerSummary {
  id: number;
  email: string;
  name: string;
  storeName: string;
  description: string;
  logoUrl?: string;
  logoEmoji?: string;
  joinedAt: string;
  productCount: number;
  monthlySalesCount: number;
  totalSalesCount: number;
}

/**
 * 판매자 목록 페이지
 * 판매자 기본정보, 월간판매량, 누적판매량 표시
 */
function SellerList() {
  const [allSellers, setAllSellers] = useState<SellerSummary[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<SellerSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [finalQuery, setFinalQuery] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    // TODO: 백엔드 API 연동 (GET /sellers)
    const mockSellers: SellerSummary[] = [
      {
        id: 1,
        email: 'apple@official.com',
        name: '애플코리아',
        storeName: '애플공식몰',
        description: '혁신적인 기술과 디자인의 애플 공식 판매 상점입니다.',
        logoUrl: `${import.meta.env.BASE_URL}assets/sample/brand-apple.png`,
        joinedAt: '2022-01-15',
        productCount: 48,
        monthlySalesCount: 1820,
        totalSalesCount: 62400,
      },
      {
        id: 2,
        email: 'samsung@official.com',
        name: '삼성전자',
        storeName: '삼성공식몰',
        description: '함께 가요 미래로! 삼성 공식 판매 상점입니다.',
        logoUrl: `${import.meta.env.BASE_URL}assets/sample/brand-samsung.png`,
        joinedAt: '2022-02-01',
        productCount: 72,
        monthlySalesCount: 2400,
        totalSalesCount: 85000,
      },
      {
        id: 3,
        email: 'sony@official.com',
        name: '소니코리아',
        storeName: '소니공식몰',
        description: '최고의 오디오·영상·게임 기기를 제공하는 소니 공식 판매 상점입니다.',
        logoUrl: `${import.meta.env.BASE_URL}assets/sample/brand-sony.png`,
        joinedAt: '2022-03-10',
        productCount: 35,
        monthlySalesCount: 980,
        totalSalesCount: 34200,
      },
      {
        id: 4,
        email: 'food@seller.com',
        name: '박먹거리',
        storeName: '먹거리세상',
        description: '신선하고 건강한 먹거리를 제공하는 일반 판매 상점입니다.',
        logoEmoji: '🍎',
        joinedAt: '2023-05-20',
        productCount: 24,
        monthlySalesCount: 1250,
        totalSalesCount: 45800,
      },
      {
        id: 5,
        email: 'nike@official.com',
        name: '나이키코리아',
        storeName: '나이키공식몰',
        description: 'Just Do It. 나이키 공식 스포츠용품 판매 상점입니다.',
        logoUrl: `${import.meta.env.BASE_URL}assets/sample/brand-nike.png`,
        joinedAt: '2022-08-05',
        productCount: 61,
        monthlySalesCount: 3100,
        totalSalesCount: 118000,
      },
      {
        id: 6,
        email: 'books@oreilly.com',
        name: '오라일리출판사',
        storeName: '오라일리서점',
        description: '개발자를 위한 전문 기술 서적을 판매하는 상점입니다.',
        logoUrl: `${import.meta.env.BASE_URL}assets/sample/brand-oreilly.png`,
        joinedAt: '2023-01-12',
        productCount: 18,
        monthlySalesCount: 540,
        totalSalesCount: 9800,
      },
    ];
    setAllSellers(mockSellers);
    setFilteredSellers(mockSellers);
  }, []);

  useEffect(() => {
    const query = finalQuery.toLowerCase();
    if (!query) {
      setFilteredSellers(allSellers);
      return;
    }
    var filtered = allSellers.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.storeName.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query)
    );
    setFilteredSellers(filtered);
  }, [finalQuery, allSellers]);

  const handleSearch = () => {
    setFinalQuery(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div>
      {/* 검색 영역 */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? '0.75rem' : '0',
        marginBottom: '2rem'
      }}>
        <h1 style={{ margin: 0 }}>판매자 목록 ({filteredSellers.length})</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="판매자명, 상점명, 이메일 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ padding: '0.6rem 1rem', flex: 1, minWidth: isMobile ? 0 : '260px', border: '1px solid #000' }}
          />
          <button
            onClick={handleSearch}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            검색
          </button>
        </div>
      </div>

      {/* 판매자 목록 */}
      {filteredSellers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>검색 결과가 없습니다.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredSellers.map(seller => (
            <div key={seller.id} style={{
              border: '1px solid #000',
              padding: isMobile ? '0.75rem' : '1.25rem',
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '0.75rem' : '1.5rem',
              alignItems: isMobile ? 'flex-start' : 'center'
            }}>
              {/* 로고 */}
              <div style={{
                width: isMobile ? '48px' : '64px',
                height: isMobile ? '48px' : '64px',
                flexShrink: 0,
                border: '1px solid #eee',
                backgroundColor: '#f9f9f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                {seller.logoUrl ? (
                  <img src={seller.logoUrl} alt={seller.storeName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  seller.logoEmoji ?? '🏪'
                )}
              </div>

              {/* 기본 정보 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                  <span style={{ color: '#999', fontSize: '0.72rem', fontFamily: 'monospace' }}>
                    ID: {String(seller.id).padStart(8, '0')}
                  </span>
                  <span style={{ color: '#ccc' }}>|</span>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>{seller.email}</span>
                  <span style={{ color: '#ccc' }}>|</span>
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>가입일 {seller.joinedAt}</span>
                </div>
                <div style={{ marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 'bold', fontSize: isMobile ? '1rem' : '1.1rem' }}>
                    {seller.name}
                  </span>
                  <span style={{ color: '#666', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                    ({seller.storeName})
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
                  {seller.description}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>
                  등록 상품 <strong>{seller.productCount}</strong>개
                </div>
              </div>

              {/* 판매 통계 */}
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'row' : 'column',
                gap: isMobile ? '1rem' : '0.4rem',
                alignItems: isMobile ? 'center' : 'flex-end',
                flexShrink: 0,
                minWidth: isMobile ? 'auto' : '130px'
              }}>
                <div style={{ textAlign: isMobile ? 'center' : 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>월간판매량</div>
                  <div style={{ fontWeight: 'bold', fontSize: isMobile ? '1rem' : '1.1rem', color: '#d00' }}>
                    {seller.monthlySalesCount.toLocaleString()}개
                  </div>
                </div>
                <div style={{ color: '#ccc' }}>{isMobile ? '|' : '─'}</div>
                <div style={{ textAlign: isMobile ? 'center' : 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>누적판매량</div>
                  <div style={{ fontWeight: 'bold', fontSize: isMobile ? '1rem' : '1.1rem' }}>
                    {seller.totalSalesCount.toLocaleString()}개
                  </div>
                </div>
              </div>

              {/* 상점 바로가기 */}
              <div style={{ flexShrink: 0 }}>
                <Link
                  to={`/seller/${seller.id}`}
                  style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    border: '1px solid #000',
                    backgroundColor: '#000',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  상점 보기
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerList;
