import { useState, useEffect } from 'react';

interface SalesItem {
  id: number;
  orderId: number;
  productName: string;
  quantity: number;
  soldAt: string;
  totalPrice: number;
}

/**
 * 상품 판매 내역 조회 (매니저용)
 * UC_PROD_04 구현 (Prototype)
 */
function ProductSalesList() {
  const [sales, setSales] = useState<SalesItem[]>([]);

  useEffect(() => {
    // Flyway V2, V3 샘플 데이터를 기반으로 한 Mock 데이터
    const mockSales: SalesItem[] = [
      { id: 1, orderId: 1, productName: '맥북 프로 14인치', quantity: 1, soldAt: '2025-09-02T10:15:00', totalPrice: 2990000 },
      { id: 2, orderId: 1, productName: '무선 키보드', quantity: 2, soldAt: '2025-09-02T10:15:00', totalPrice: 178000 },
      { id: 3, orderId: 2, productName: '아이폰 15 Pro', quantity: 1, soldAt: '2025-09-05T14:30:00', totalPrice: 1550000 },
      { id: 4, orderId: 3, productName: '클린 코드', quantity: 1, soldAt: '2025-09-10T16:45:00', totalPrice: 33000 },
      { id: 5, orderId: 3, productName: '자바 ORM 표준 JPA 프로그래밍', quantity: 1, soldAt: '2025-09-10T16:45:00', totalPrice: 38000 },
      { id: 6, orderId: 5, productName: '제주 감귤 2kg', quantity: 3, soldAt: '2025-09-14T13:00:00', totalPrice: 45000 },
      { id: 7, orderId: 6, productName: '무선 키보드', quantity: 1, soldAt: '2025-09-16T08:30:00', totalPrice: 89000 },
      { id: 8, orderId: 6, productName: '클린 코드', quantity: 1, soldAt: '2025-09-16T08:30:00', totalPrice: 33000 },
      { id: 9, orderId: 10, productName: '린넨 셔츠', quantity: 2, soldAt: '2025-09-24T15:30:00', totalPrice: 98000 },
      { id: 10, orderId: 15, productName: '아이폰 15 Pro', quantity: 1, soldAt: '2025-10-03T13:30:00', totalPrice: 1550000 }
    ];
    setSales(mockSales);
  }, []);

  return (
    <div>
      <h1>상품 판매 내역 (MANAGER)</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>※ 유스케이스 UC_PROD_04 검증을 위한 샘플 데이터입니다.</p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #000' }}>
            <th style={{ textAlign: 'left', padding: '1rem' }}>판매ID</th>
            <th style={{ textAlign: 'left', padding: '1rem' }}>주문번호</th>
            <th style={{ textAlign: 'left', padding: '1rem' }}>상품명</th>
            <th style={{ textAlign: 'center', padding: '1rem' }}>수량</th>
            <th style={{ textAlign: 'right', padding: '1rem' }}>총 판매금액</th>
            <th style={{ textAlign: 'right', padding: '1rem' }}>판매일시</th>
          </tr>
        </thead>
        <tbody>
          {sales.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '1rem' }}>{item.id}</td>
              <td style={{ padding: '1rem' }}>#{item.orderId}</td>
              <td style={{ padding: '1rem' }}>{item.productName}</td>
              <td style={{ padding: '1rem', textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ padding: '1rem', textAlign: 'right' }}>{item.totalPrice.toLocaleString()}원</td>
              <td style={{ padding: '1rem', textAlign: 'right' }}>
                {new Date(item.soldAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
        <strong>총 매출 요약 (샘플):</strong> {sales.reduce((acc, curr) => acc + curr.totalPrice, 0).toLocaleString()}원
      </div>
    </div>
  );
}

export default ProductSalesList;
