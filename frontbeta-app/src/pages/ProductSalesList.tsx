import { useState, useEffect } from 'react';

interface SalesItem {
  id: number;
  orderNo: string;
  productName: string;
  quantity: number;
  soldAt: string;
  totalPrice: number;
}

/**
 * 상품 판매 내역 조회 (매니저용)
 * UC_PROD_04 구현 (Prototype - 검색 조건 추가)
 */
function ProductSalesList() {
  const [sales, setSales] = useState<SalesItem[]>([]);
  const [filteredSales, setFilteredSales] = useState<SalesItem[]>([]);
  
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
      { id: 1, orderNo: '250902101500001', productName: '맥북 프로 14인치', quantity: 1, soldAt: '2025-09-02T10:15:00', totalPrice: 2990000 },
      { id: 2, orderNo: '250902101500001', productName: '무선 키보드', quantity: 2, soldAt: '2025-09-02T10:15:00', totalPrice: 178000 },
      { id: 3, orderNo: '250905143000002', productName: '아이폰 15 Pro', quantity: 1, soldAt: '2025-09-05T14:30:00', totalPrice: 1550000 },
      { id: 4, orderNo: '250910164500003', productName: '클린 코드', quantity: 1, soldAt: '2025-09-10T16:45:00', totalPrice: 33000 },
      { id: 5, orderNo: '250910164500003', productName: '자바 ORM 표준 JPA 프로그래밍', quantity: 1, soldAt: '2025-09-10T16:45:00', totalPrice: 38000 },
      { id: 6, orderNo: '250914130000005', productName: '제주 감귤 2kg', quantity: 3, soldAt: '2025-09-14T13:00:00', totalPrice: 45000 },
      { id: 7, orderNo: '250916083000006', productName: '무선 키보드', quantity: 1, soldAt: '2025-09-16T08:30:00', totalPrice: 89000 },
      { id: 8, orderNo: '250916083000006', productName: '클린 코드', quantity: 1, soldAt: '2025-09-16T08:30:00', totalPrice: 33000 },
      { id: 9, orderNo: '250924153000010', productName: '린넨 셔츠', quantity: 2, soldAt: '2025-09-24T15:30:00', totalPrice: 98000 },
      { id: 10, orderNo: '251003133000015', productName: '아이폰 15 Pro', quantity: 1, soldAt: '2025-10-03T13:30:00', totalPrice: 1550000 }
    ];
    setSales(mockSales);
    setFilteredSales(mockSales);
  }, []);

  const handleSearch = () => {
    let result = [...sales];

    // 상품명 검색
    if (searchName) {
      result = result.filter(item => item.productName.toLowerCase().includes(searchName.toLowerCase()));
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
      <h1>상품 판매 내역 (MANAGER)</h1>
      
      {/* 검색 필터 UI */}
      <div style={{ 
        padding: '1.5rem', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px', 
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>상품명</label>
            <input 
              type="text" 
              placeholder="상품명 입력..." 
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{ padding: '0.4rem', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>판매기간</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '0.4rem', border: '1px solid #ccc' }} />
              <span>~</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '0.4rem', border: '1px solid #ccc' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>금액 범위 (원)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="number" placeholder="최소" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={{ padding: '0.4rem', border: '1px solid #ccc', width: '100px' }} />
              <span>~</span>
              <input type="number" placeholder="최대" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ padding: '0.4rem', border: '1px solid #ccc', width: '100px' }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button onClick={resetFilters} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>초기화</button>
          <button onClick={handleSearch} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}>검색</button>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #000' }}>
            <th style={{ textAlign: 'left', padding: '1rem' }}>주문번호</th>
            <th style={{ textAlign: 'left', padding: '1rem' }}>상품명</th>
            <th style={{ textAlign: 'center', padding: '1rem' }}>수량</th>
            <th style={{ textAlign: 'right', padding: '1rem' }}>총 판매금액</th>
            <th style={{ textAlign: 'right', padding: '1rem' }}>판매일시</th>
          </tr>
        </thead>
        <tbody>
          {filteredSales.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>조건에 맞는 판매 내역이 없습니다.</td>
            </tr>
          ) : (
            filteredSales.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{item.orderNo}</td>
                <td style={{ padding: '1rem' }}>{item.productName}</td>
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
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
        <strong>검색 결과 총 매출:</strong> {filteredSales.reduce((acc, curr) => acc + curr.totalPrice, 0).toLocaleString()}원
      </div>
    </div>
  );
}

export default ProductSalesList;
