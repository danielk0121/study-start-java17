import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';

/**
 * 상품 목록 페이지 (Home)
 * PRD 2.3 요구사항 반영 (장바구니 담기 기능 추가)
 */
function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [finalQuery, setFinalQuery] = useState('');

  useEffect(() => {
    // TODO: 백엔드 API 연동 (GET /products)
    const mockProducts: Product[] = [
      { id: 1, name: '맥북 프로 14인치', price: 2990000, stock: 10, category: 'ELECTRONICS', brandName: 'Apple', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=A',
        thumbnailUrl1: 'https://via.placeholder.com/400x400?text=MacBook+Thumb+1'
      },
      { id: 2, name: '아이폰 15 Pro', price: 1550000, stock: 25, category: 'ELECTRONICS', brandName: 'Apple', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=A' },
      { id: 3, name: '무선 키보드', price: 89000, stock: 50, category: 'ELECTRONICS', brandName: 'Logitech', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=L' },
      { id: 4, name: '린넨 셔츠', price: 49000, stock: 100, category: 'CLOTHING', brandName: 'Uniqlo', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=U' },
      { id: 5, name: '청바지 슬림핏', price: 79000, stock: 80, category: 'CLOTHING', brandName: 'Zara', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=Z' },
      { id: 6, name: '제주 감귤 2kg', price: 15000, stock: 200, category: 'FOOD', brandName: 'CJ', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=C' },
      { id: 7, name: '유기농 아메리카노 원두 500g', price: 22000, stock: 150, category: 'FOOD', brandName: 'Starbucks', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=S' },
      { id: 8, name: '클린 코드', price: 33000, stock: 60, category: 'BOOKS', brandName: 'Pearson', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=P' },
      { id: 9, name: '자바 ORM 표준 JPA 프로그래밍', price: 38000, stock: 45, category: 'BOOKS', brandName: 'OReilly', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=O' },
      { id: 10, name: '텀블러 500ml', price: 25000, stock: 120, category: 'ETC', brandName: 'Muji', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=M' },
      { id: 11, name: 'Galaxy S24', price: 1150000, stock: 30, category: 'ELECTRONICS', brandName: 'Samsung', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=S' },
      { id: 12, name: 'WH-1000XM5', price: 450000, stock: 20, category: 'ELECTRONICS', brandName: 'Sony', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=S' },
      { id: 13, name: 'Air Max 97', price: 199000, stock: 50, category: 'CLOTHING', brandName: 'Nike', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=N' },
      { id: 14, name: 'Designing Data-Intensive Applications', price: 45000, stock: 100, category: 'BOOKS', brandName: 'OReilly', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=O' },
      { id: 15, name: 'LEGO Star Wars', price: 210000, stock: 5, category: 'ETC', brandName: 'LEGO', brandThumbnailUrl: 'https://via.placeholder.com/30x30?text=L' }
    ];

    // 검색 필터링
    const query = finalQuery.toLowerCase();
    const filtered = mockProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.brandName.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query)
    );
    setProducts(filtered);
  }, [finalQuery]);

  const handleSearch = () => {
    setFinalQuery(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleAddToCart = (product: Product) => {
    // TODO: API 연동 (POST /carts/me/items)
    console.log('Add to cart:', product);
    alert(`${product.name}이(가) 장바구니에 담겼습니다.`);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>상품 목록</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="상품, 브랜드 검색..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ padding: '0.5rem', width: '250px', border: '1px solid #000' }}
          />
          <button 
            onClick={handleSearch}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            검색
          </button>
        </div>
      </div>
      
      {products.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>검색 결과가 없습니다.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {products.map(product => (
          <div key={product.id} style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
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
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {product.brandThumbnailUrl && (
                <img src={product.brandThumbnailUrl} alt={product.brandName} style={{ width: '20px', height: '20px', border: '1px solid #eee', objectFit: 'contain' }} />
              )}
              <span>{product.brandName} | {product.category}</span>
              <small style={{ color: '#999' }}>(ID: {product.id})</small>
            </div>
            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: '#000' }}>
              <h3 style={{ margin: '0 0 1rem 0', cursor: 'pointer' }}>{product.name}</h3>
            </Link>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>재고: {product.stock}개</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>{product.price.toLocaleString()}원</p>
              <button 
                onClick={() => handleAddToCart(product)}
                style={{ padding: '0.3rem 0.6rem', cursor: 'pointer', border: '1px solid #000', backgroundColor: '#fff', fontSize: '0.8rem' }}
              >
                장바구니
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

export default Home;
