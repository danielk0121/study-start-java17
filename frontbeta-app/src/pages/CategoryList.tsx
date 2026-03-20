import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

interface CategoryProduct {
  id: number;
  name: string;
  price: number;
  thumbnailUrl?: string;
}

interface CategorySummary {
  id: number;
  name: string;
  productCount: number;
  products: CategoryProduct[];
}

/**
 * 카테고리관 페이지 (BrandList와 유사한 가로 스크롤 레이아웃)
 */
function CategoryList() {
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [finalQuery, setFinalQuery] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    const baseCategories: CategorySummary[] = [
      {
        id: 1, name: '전자기기', productCount: 0,
        products: [
          { id: 11, name: '[Samsung] 삼성 노트북 갤럭시 북4 Pro', price: 1850000, thumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/samsung-laptop.png` },
          { id: 13, name: '[Samsung] 삼성 갤럭시 S24 Ultra 512GB', price: 1450000, thumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/samsung-phone.png` },
          { id: 12, name: '[Samsung] 삼성 키보드 MX 기계식 유선', price: 125000, thumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/keyboard.png` },
          { id: 1, name: '[Apple] 맥북 프로 14인치 M3 Pro 실버', price: 2990000, thumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/apple-laptop.png` }
        ]
      },
      {
        id: 2, name: '의류', productCount: 0,
        products: [
          { id: 4, name: '[Uniqlo] 프리미엄 리넨 셔츠 (긴팔) 화이트 L', price: 49000, thumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/shirt.png` },
          { id: 5, name: '[Zara] 슬림핏 스트레치 데님 팬츠 다크 블루', price: 79000, thumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/pants.png` },
          { id: 15, name: '[Nike] Air Max 97 OG 실버 불렛 2024', price: 199000, thumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/nike.png` }
        ]
      },
      {
        id: 3, name: '식품', productCount: 0,
        products: [
          { id: 6, name: '[CJ] 서귀포 프리미엄 고당도 제주 감귤 2kg', price: 15000, thumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/tangerine.png` },
          { id: 7, name: '[Starbucks] 하우스 블렌드 유기농 원두 500g', price: 22000, thumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/coffee.png` }
        ]
      },
      {
        id: 4, name: '도서', productCount: 0,
        products: [
          { id: 14, name: '[OReilly] Designing Data-Intensive Applications', price: 45000, thumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/book-ddia.png` },
          { id: 8, name: '[Pearson] 클린 코드: 애자일 소프트웨어 장인 정신', price: 33000, thumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/book-clean.png` },
          { id: 9, name: '[OReilly] 자바 ORM 표준 JPA 프로그래밍 가이드', price: 38000, thumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/book-jpa.png` }
        ]
      },
      {
        id: 5, name: '기타', productCount: 0,
        products: [
          { id: 10, name: '[Muji] 스테인리스 보온 보냉 텀블러 500ml', price: 25000, thumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/tumbler.png` },
          { id: 155, name: '[LEGO] Star Wars 밀레니엄 팔콘 컬렉션', price: 210000, thumbnailUrl: `${import.meta.env.BASE_URL}assets/sample/lego.png` }
        ]
      }
    ];

    const allCategories = baseCategories.map(cat => ({
      ...cat,
      productCount: cat.products.length
    }));

    const query = finalQuery.toLowerCase();
    const filtered = allCategories.map(cat => {
      const filteredProducts = cat.products.filter(p =>
        cat.name.toLowerCase().includes(query) ||
        p.name.toLowerCase().includes(query)
      );

      return {
        ...cat,
        products: cat.name.toLowerCase().includes(query) ? cat.products : filteredProducts,
        isVisible: cat.name.toLowerCase().includes(query) || filteredProducts.length > 0
      };
    }).filter(b => (b as any).isVisible);

    setCategories(filtered);
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
        <h1 style={{ margin: 0 }}>카테고리관</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="카테고리명, 상품명 검색..."
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

      {categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>검색 결과가 없습니다.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {categories.map(cat => (
            <div key={cat.id} style={{
              border: '1px solid #000',
              padding: isMobile ? '0.75rem' : '1.25rem',
              backgroundColor: '#fff'
            }}>
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
                borderBottom: '1px solid #eee',
                paddingBottom: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ margin: 0, fontSize: isMobile ? '1.1rem' : '1.3rem' }}>
                    {cat.name}
                  </h2>
                  <span style={{ color: '#666', fontSize: '0.8rem' }}>
                    등록 상품 <strong>{cat.productCount}</strong>개
                  </span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '1rem',
                paddingBottom: '0.5rem'
              }}>
                {cat.products.map(product => (
                  <Link 
                    key={product.id} 
                    to={`/product/${product.id}`}
                    style={{
                      flexShrink: 0,
                      width: '260px',
                      padding: '1rem',
                      border: '1px solid #eee',
                      borderRadius: '4px',
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'center',
                      textDecoration: 'underline',
                      color: 'inherit',
                      cursor: 'pointer',
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
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
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryList;
