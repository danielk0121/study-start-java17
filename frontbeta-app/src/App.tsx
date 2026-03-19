import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BuyerMyPage from './pages/BuyerMyPage';
import Cart from './pages/Cart';
import ManagerLogin from './pages/ManagerLogin';
import ManagerRegister from './pages/ManagerRegister';
import ManagerMyPage from './pages/ManagerMyPage';
import OrderList from './pages/OrderList';
import OrderDetail from './pages/OrderDetail';
import AddressManagement from './pages/AddressManagement';
import ProductSalesList from './pages/ProductSalesList';
import BrandList from './pages/BrandList';
import ProductDetail from './pages/ProductDetail';
import type { Member } from './types';

/**
 * 프론트엔드 메인 진입점
 * PRD-FRONTAPP 요구사항 반영 (메뉴 상시 노출로 변경)
 */
function App() {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <Router basename="/study-start-java17/frontbeta">
      <nav style={{
        borderBottom: '1px solid #000',
        fontFamily: 'sans-serif',
        fontSize: '0.85rem'
      }}>
        {/* 1행: 로고 + 인증 영역 */}
        <div style={{
          padding: '0.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          borderBottom: '1px solid #eee'
        }}>
          <Link to="/" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#000', fontSize: '1rem' }}>SHOP</Link>
          <div style={{ flex: 1 }}></div>
          <Link to="/mypage" style={{ textDecoration: 'none', color: '#333' }}>내정보(B)</Link>
          <Link to="/manager/mypage" style={{ textDecoration: 'none', color: '#d00' }}>내정보(M)</Link>
          <span style={{ color: '#ccc' }}>|</span>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{
                padding: '0.1rem 0.4rem',
                border: '1px solid #ccc',
                fontSize: '0.75rem',
                color: currentUser.role === 'MANAGER' ? '#d00' : '#333'
              }}>
                {currentUser.role === 'MANAGER' ? 'ADMIN' : 'USER'}
              </span>
              <span>{currentUser.name}</span>
              <button onClick={handleLogout} style={{ padding: '0.2rem 0.4rem', cursor: 'pointer', fontSize: '0.75rem' }}>로그아웃</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <Link to="/login" style={{ textDecoration: 'none', color: '#333' }}>로그인</Link>
              <Link to="/register" style={{ textDecoration: 'none', color: '#333' }}>회원가입</Link>
              <span style={{ color: '#ccc' }}>|</span>
              <Link to="/manager/login" style={{ textDecoration: 'none', color: '#d00' }}>관리자로그인</Link>
              <Link to="/manager/register" style={{ textDecoration: 'none', color: '#d00' }}>관리자가입</Link>
            </div>
          )}
        </div>

        {/* 2행: 내비게이션 메뉴 */}
        <div style={{
          padding: '0.5rem 1rem',
          display: 'flex',
          gap: '1.2rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <Link to="/">
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="홈" style={{ width: '20px', height: '20px', verticalAlign: 'middle' }} />
          </Link>
          <div style={{ flex: 1 }}></div>
          <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>상품목록</Link>
          <Link to="/brands" style={{ textDecoration: 'none', color: '#333' }}>브랜드관</Link>
          <Link to="/product/1" style={{ textDecoration: 'none', color: '#333' }}>상품상세(S)</Link>
          <Link to="/cart" style={{ textDecoration: 'none', color: '#333' }}>장바구니</Link>
          <Link to="/orders" style={{ textDecoration: 'none', color: '#333' }}>주문목록</Link>
          <Link to="/order/1" style={{ textDecoration: 'none', color: '#333' }}>주문상세(S)</Link>
          <Link to="/addresses" style={{ textDecoration: 'none', color: '#333' }}>배송지관리</Link>
          <Link to="/manager/sales" style={{ textDecoration: 'none', color: '#d00', fontWeight: 'bold' }}>판매내역(M)</Link>
        </div>
      </nav>

      <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/brands" element={<BrandList />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mypage" element={<BuyerMyPage />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/addresses" element={<AddressManagement />} />
          <Route path="/manager/login" element={<ManagerLogin />} />
          <Route path="/manager/register" element={<ManagerRegister />} />
          <Route path="/manager/mypage" element={<ManagerMyPage />} />
          <Route path="/manager/sales" element={<ProductSalesList />} />

        </Routes>
      </main>
    </Router>
  );
}

export default App;
