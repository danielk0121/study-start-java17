import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

interface SalesItem {
  id: number;
  orderNo: string;
  productId: number;
  productName: string;
  quantity: number;
  soldAt: string;
  totalPrice: number;
}

/**
 * 상품 판매 내역 조회 (매니저용)
 * UC_PROD_04 구현 (Prototype - 상세 컬럼 추가, 모바일 최적화)
 */
function ProductSalesList() {
  const [sales, setSales] = useState<SalesItem[]>([]);
  const [filteredSales, setFilteredSales] = useState<SalesItem[]>([]);
  const isMobile = useIsMobile();

  // 검색 조건 상태
  const [searchName, setSearchName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    // Flyway V2, V3, V11 샘플 데이터를 기반으로 한 Mock 데이터
    // 주문번호 형식: yyMMddHHmmssNNN
    const mockSales: SalesItem[] = [
      { id: 1, orderNo: '250902101500001', productId: 1, productName: '[Apple] 맥북 프로 14인치 M3 Pro 실버', quantity: 1, soldAt: '2025-09-02T10:15:00', totalPrice: 2990000 },
      { id: 2, orderNo: '250902101500001', productId: 3, productName: '[Logitech] MX Keys Mini 무선 기계식 키보드', quantity: 2, soldAt: '2025-09-02T10:15:00', totalPrice: 178000 },
      { id: 3, orderNo: '250905143000002', productId: 2, productName: '[Apple] 아이폰 15 Pro 256GB 내추럴 티타늄', quantity: 1, soldAt: '2025-09-05T14:30:00', totalPrice: 1550000 },
      { id: 4, orderNo: '250910164500003', productId: 8, productName: '[Pearson] 클린 코드: 애자일 소프트웨어 장인 정신', quantity: 1, soldAt: '2025-09-10T16:45:00', totalPrice: 33000 },
      { id: 5, orderNo: '250910164500003', productId: 9, productName: '[OReilly] 자바 ORM 표준 JPA 프로그래밍 가이드', quantity: 1, soldAt: '2025-09-10T16:45:00', totalPrice: 38000 },
      { id: 6, orderNo: '250914130000005', productId: 6, productName: '[CJ] 서귀포 프리미엄 고당도 제주 감귤 2kg', quantity: 3, soldAt: '2025-09-14T13:00:00', totalPrice: 45000 },
      { id: 7, orderNo: '250916083000006', productId: 3, productName: '[Logitech] MX Keys Mini 무선 기계식 키보드', quantity: 1, soldAt: '2025-09-16T08:30:00', totalPrice: 89000 },
      { id: 8, orderNo: '250916083000006', productId: 8, productName: '[Pearson] 클린 코드: 애자일 소프트웨어 장인 정신', quantity: 1, soldAt: '2025-09-16T08:30:00', totalPrice: 33000 },
      { id: 9, orderNo: '250924153000010', productId: 4, productName: '[Uniqlo] 프리미엄 리넨 셔츠 (긴팔) 화이트 L', quantity: 2, soldAt: '2025-09-24T15:30:00', totalPrice: 98000 },
      { id: 10, orderNo: '251003133000015', productId: 2, productName: '[Apple] 아이폰 15 Pro 256GB 내추럴 티타늄', quantity: 1, soldAt: '2025-10-03T13:30:00', totalPrice: 1550000 }
    ];
    setSales(mockSales);
    setFilteredSales(mockSales);
  }, []);

  const handleSearch = () => {
    let result = [...sales];

    // 상품명 검색
    if (searchName) {
      result = result.filter(item =>
        item.productName.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // 날짜 검색
    if (startDate) {
      result = result.filter(item => item.soldAt >= `${startDate}T00:00:00`);
    }
    if (endDate) {
      result = result.filter(item => item.soldAt <= `${endDate}T23:59:59`);
    }

    // 금액 검색
    if (minPrice) {
      result = result.filter(item => item.totalPrice >= parseInt(minPrice));
    }
    if (maxPrice) {
      result = result.filter(item => item.totalPrice <= parseInt(maxPrice));
    }

    setFilteredSales(result);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const resetFilters = () => {
    setSearchName('');
    setStartDate('');
    setEndDate('');
    setMinPrice('');
    setMaxPrice('');
    setFilteredSales(sales);
  };

  return (
    <div>
      <h1>상품 판매 내역 (SELLER)</h1>

      {/* 검색 필터 UI */}
      <div style={{
        padding: isMobile ? '1rem' : '1.5rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>상품명</label>
            <input
              type="text"
              placeholder="상품명 입력..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ padding: '0.4rem', border: '1px solid #ccc', width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>판매기간</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} onKeyDown={handleKeyDown} style={{ padding: '0.4rem', border: '1px solid #ccc', flex: 1, minWidth: '120px' }} />
              <span>~</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} onKeyDown={handleKeyDown} style={{ padding: '0.4rem', border: '1px solid #ccc', flex: 1, minWidth: '120px' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>금액 범위 (원)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="number" placeholder="최소" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} onKeyDown={handleKeyDown} style={{ padding: '0.4rem', border: '1px solid #ccc', flex: 1, minWidth: 0 }} />
              <span>~</span>
              <input type="number" placeholder="최대" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} onKeyDown={handleKeyDown} style={{ padding: '0.4rem', border: '1px solid #ccc', flex: 1, minWidth: 0 }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button onClick={resetFilters} style={{ padding: '0.5rem 1rem', cursor: 'pointer', border: '1px solid #ccc', background: '#fff' }}>초기화</button>
          <button onClick={handleSearch} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}>검색</button>
        </div>
      </div>

      <div style={{ 
        marginBottom: '1.5rem', 
        padding: '1rem', 
        backgroundColor: '#f9f9f9', 
        border: '1px solid #ddd', 
        textAlign: isMobile ? 'center' : 'right',
        fontSize: '1.1rem'
      }}>
        <strong>검색 결과 총 매출:</strong> <span style={{ color: '#d00', fontWeight: 'bold' }}>{filteredSales.reduce((acc, curr) => acc + curr.totalPrice, 0).toLocaleString()}원</span>
      </div>

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredSales.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>검색 결과가 없습니다.</p>
          ) : (
            filteredSales.map(item => (
              <div key={item.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{item.orderNo}</div>
                    <small style={{ color: '#999' }}>ID: {item.id} | {new Date(item.soldAt).toLocaleString()}</small>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>상품명</span>
                    <Link to={`/product/${item.productId}`} style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#000', textDecoration: 'underline' }}>{item.productName}</Link>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>상품ID</span>
                    <Link to={`/product/${item.productId}`} style={{ fontSize: '0.9rem', fontFamily: 'monospace', color: '#999', textDecoration: 'underline' }}>{item.productId.toString().padStart(8, '0')}</Link>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>수량</span>
                    <span style={{ fontSize: '0.9rem' }}>{item.quantity}개</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f9f9f9', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>판매금액</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{item.totalPrice.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #000' }}>
                <th style={{ textAlign: 'left', padding: '1rem' }}>주문번호</th>
                <th style={{ textAlign: 'left', padding: '1rem' }}>상품ID</th>
                <th style={{ textAlign: 'left', padding: '1rem' }}>상품명</th>
                <th style={{ textAlign: 'center', padding: '1rem' }}>수량</th>
                <th style={{ textAlign: 'right', padding: '1rem' }}>판매금액</th>
                <th style={{ textAlign: 'right', padding: '1rem' }}>판매일시</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>조건에 맞는 판매 내역이 없습니다.</td>
                </tr>
              ) : (
                filteredSales.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{item.orderNo}</td>
                    <td style={{ padding: '1rem' }}>
                      <Link to={`/product/${item.productId}`} style={{ color: '#999', fontFamily: 'monospace', textDecoration: 'underline' }}>
                        {item.productId.toString().padStart(8, '0')}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Link to={`/product/${item.productId}`} style={{ color: '#000', textDecoration: 'underline' }}>
                        {item.productName}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>{item.totalPrice.toLocaleString()}원</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {new Date(item.soldAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProductSalesList;
