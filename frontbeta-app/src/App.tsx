import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
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
import CategoryList from './pages/CategoryList';
import ProductDetail from './pages/ProductDetail';
import SellerStore from './pages/SellerStore';
import EditProfileBuyer from './pages/EditProfileBuyer';
import EditProfileSeller from './pages/EditProfileSeller';
import type { Member } from './types';
import { useIsMobile } from './hooks/useIsMobile';

/**
 * 전역 배경색 제어를 위한 컴포넌트
 */
function ScrollToTopAndBg() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    // 판매자 스토어(/seller/...)인 경우 배경색 적용 (짙은 파란색)
    if (pathname.includes('/seller/')) {
      document.body.style.backgroundColor = '#8bbdfa';
    } else {
      document.body.style.backgroundColor = '#fff';
    }
  }, [pathname]);

  return null;
}

/**
 * 프론트엔드 메인 진입점
 * PRD-FRONTAPP 요구사항 반영 (메뉴 5줄 구성)
 */
function App() {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const isMobile = useIsMobile();

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <Router basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <ScrollToTopAndBg />
      <nav style={{
        borderBottom: '1px solid #000',
        fontFamily: 'sans-serif',
        fontSize: isMobile ? '0.75rem' : '0.85rem',
        backgroundColor: 'transparent'
      }}>
        {/* 1행: 로고 및 로그인 상태 */}
        <div style={{
          padding: isMobile ? '0.3rem 0.5rem' : '0.4rem 1rem',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #eee',
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'underline', color: '#000' }}>
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="S" style={{ width: isMobile ? '18px' : '22px', height: isMobile ? '18px' : '22px' }} />
            <span style={{ fontWeight: 'bold', fontSize: isMobile ? '0.9rem' : '1.1rem' }}>SHOP</span>
          </Link>
          <div style={{ flex: 1 }}></div>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', border: '1px solid #ccc', padding: '0 0.2rem' }}>{currentUser.role}</span>
              <span>{currentUser.name}</span>
              <button onClick={handleLogout} style={{ fontSize: '0.75rem', cursor: 'pointer' }}>로그아웃</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" style={{ textDecoration: 'underline', color: '#333' }}>로그인</Link>
              <Link to="/register" style={{ textDecoration: 'underline', color: '#333' }}>가입</Link>
            </div>
          )}
        </div>

        {/* 2행: 판매자 가입/로그인 (모바일 분리) */}
        <div style={{
          padding: '0.3rem 0.5rem',
          display: isMobile ? 'flex' : 'none',
          justifyContent: 'flex-end',
          gap: '0.8rem',
          borderBottom: '1px solid #eee',
          backgroundColor: 'rgba(255,255,255,0.3)'
        }}>
          <Link to="/manager/login" style={{ textDecoration: 'underline', color: '#d00' }}>판매자로그인</Link>
          <Link to="/manager/register" style={{ textDecoration: 'underline', color: '#d00' }}>판매자가입</Link>
        </div>

        {/* 3행: 회원/판매자 정보수정 */}
        <div style={{
          padding: '0.3rem 0.5rem',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: isMobile ? '0.5rem' : '1rem',
          borderBottom: '1px solid #eee',
        }}>
          <Link to="/mypage" style={{ textDecoration: 'underline', color: '#333' }}>내정보(B)</Link>
          <Link to="/mypage/edit" style={{ textDecoration: 'underline', color: '#333' }}>수정(B)</Link>
          <span style={{ color: '#ccc' }}>|</span>
          <Link to="/manager/mypage" style={{ textDecoration: 'underline', color: '#d00' }}>내정보(S)</Link>
          <Link to="/manager/mypage/edit" style={{ textDecoration: 'underline', color: '#d00' }}>수정(S)</Link>
        </div>

        {/* 4행: 주요 관 서비스 */}
        <div style={{
          padding: '0.4rem 0.5rem',
          display: 'flex',
          justifyContent: 'center',
          gap: isMobile ? '0.5rem' : '1.2rem',
          borderBottom: '1px solid #eee',
        }}>
          <Link to="/" style={{ textDecoration: 'underline', color: '#333' }}>상품목록</Link>
          <Link to="/categories" style={{ textDecoration: 'underline', color: '#333' }}>카테고리</Link>
          <Link to="/brands" style={{ textDecoration: 'underline', color: '#333' }}>브랜드</Link>
          <Link to="/cart" style={{ textDecoration: 'underline', color: '#333' }}>장바구니</Link>
        </div>

        {/* 5행: 스토어 및 주문 관리 */}
        <div style={{
          padding: '0.4rem 0.5rem',
          display: 'flex',
          justifyContent: 'center',
          gap: isMobile ? '0.4rem' : '1.2rem',
          backgroundColor: 'rgba(0,0,0,0.03)'
        }}>
          <Link to="/seller/2" style={{ textDecoration: 'underline', color: '#333' }}>스토어(공)</Link>
          <Link to="/seller/4" style={{ textDecoration: 'underline', color: '#333' }}>스토어(일)</Link>
          <Link to="/orders" style={{ textDecoration: 'underline', color: '#333' }}>주문</Link>
          <Link to="/addresses" style={{ textDecoration: 'underline', color: '#333' }}>배송지</Link>
          <Link to="/manager/sales" style={{ textDecoration: 'underline', color: '#d00', fontWeight: 'bold' }}>판매내역</Link>
        </div>
      </nav>

      <main style={{ padding: isMobile ? '1rem 0.5rem' : '2rem', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/brands" element={<BrandList />} />
          <Route path="/seller/:id" element={<SellerStore />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mypage" element={<BuyerMyPage />} />
          <Route path="/mypage/edit" element={<EditProfileBuyer />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/addresses" element={<AddressManagement />} />
          <Route path="/manager/login" element={<ManagerLogin />} />
          <Route path="/manager/register" element={<ManagerRegister />} />
          <Route path="/manager/mypage" element={<ManagerMyPage />} />
          <Route path="/manager/mypage/edit" element={<EditProfileSeller />} />
          <Route path="/manager/sales" element={<ProductSalesList />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
