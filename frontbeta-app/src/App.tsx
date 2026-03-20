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
import CategoryList from './pages/CategoryList';
import ProductDetail from './pages/ProductDetail';
import SellerStore from './pages/SellerStore';
import EditProfileBuyer from './pages/EditProfileBuyer';
import EditProfileSeller from './pages/EditProfileSeller';
import type { Member } from './types';
import { useIsMobile } from './hooks/useIsMobile';

/**
 * 프론트엔드 메인 진입점
 * PRD-FRONTAPP 요구사항 반영 (메뉴 상시 노출로 변경)
 */
function App() {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const isMobile = useIsMobile();

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <Router basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <nav style={{
        borderBottom: '1px solid #000',
        fontFamily: 'sans-serif',
        fontSize: isMobile ? '0.75rem' : '0.85rem'
      }}>
        {/* 1행: S 로고 + SHOP + 로그인/회원가입 영역 */}
        <div style={{
          padding: isMobile ? '0.3rem 0.5rem' : '0.4rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '0.4rem' : '0.8rem',
          borderBottom: '1px solid #eee',
          flexWrap: 'nowrap',
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'underline', color: '#000' }}>
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="S" style={{ width: isMobile ? '18px' : '22px', height: isMobile ? '18px' : '22px' }} />
            <span style={{ fontWeight: 'bold', fontSize: isMobile ? '0.9rem' : '1.1rem' }}>SHOP</span>
          </Link>
          <div style={{ flex: 1 }}></div>
          {currentUser ? (
            <>
              <span style={{
                padding: '0.1rem 0.4rem',
                border: '1px solid #ccc',
                fontSize: '0.75rem',
                color: currentUser.role === 'SELLER' ? '#d00' : '#333'
              }}>
                {currentUser.role === 'SELLER' ? 'SELLER' : 'USER'}
              </span>
              <span>{currentUser.name}</span>
              <button onClick={handleLogout} style={{ padding: '0.2rem 0.4rem', cursor: 'pointer', fontSize: '0.75rem' }}>로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'underline', color: '#333', whiteSpace: 'nowrap' }}>로그인</Link>
              <Link to="/register" style={{ textDecoration: 'underline', color: '#333', whiteSpace: 'nowrap' }}>회원가입</Link>
              <span style={{ color: '#ccc' }}>|</span>
              <Link to="/manager/login" style={{ textDecoration: 'underline', color: '#d00', whiteSpace: 'nowrap' }}>판매자로그인</Link>
              <Link to="/manager/register" style={{ textDecoration: 'underline', color: '#d00', whiteSpace: 'nowrap' }}>판매자가입</Link>
            </>
          )}
        </div>

        {/* 2행: 내정보 링크 */}
        <div style={{
          padding: isMobile ? '0.3rem 0.5rem' : '0.4rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '0.4rem' : '1rem',
          borderBottom: '1px solid #eee',
        }}>
          <div style={{ flex: 1 }}></div>
          <Link to="/mypage" style={{ textDecoration: 'underline', color: '#333' }}>내정보(B)</Link>
          <Link to="/mypage/edit" style={{ textDecoration: 'underline', color: '#333' }}>정보수정(B)</Link>
          <Link to="/manager/mypage" style={{ textDecoration: 'underline', color: '#d00' }}>내정보(S)</Link>
          <Link to="/manager/mypage/edit" style={{ textDecoration: 'underline', color: '#d00' }}>정보수정(S)</Link>
          <span style={{ color: '#ccc' }}>|</span>
        </div>

        {/* 3행: 내비게이션 메뉴 (상품 관련) */}
        <div style={{
          padding: isMobile ? '0.3rem 0.5rem' : '0.5rem 1rem',
          display: 'flex',
          gap: isMobile ? '0.6rem' : '1.2rem',
          alignItems: 'center',
          flexWrap: 'nowrap',
          borderBottom: '1px solid #eee',
        }}>
          <div style={{ flex: 1 }}></div>
          <Link to="/" style={{ textDecoration: 'underline', color: '#333', whiteSpace: 'nowrap' }}>상품목록</Link>
          <Link to="/product/1" style={{ textDecoration: 'underline', color: '#333', whiteSpace: 'nowrap' }}>상품상세(S)</Link>
          <Link to="/categories" style={{ textDecoration: 'underline', color: '#333', whiteSpace: 'nowrap' }}>카테고리관</Link>
          <Link to="/brands" style={{ textDecoration: 'underline', color: '#333', whiteSpace: 'nowrap' }}>브랜드관</Link>
          <Link to="/seller/2" style={{ textDecoration: 'underline', color: '#333', whiteSpace: 'nowrap' }}>판매자스토어</Link>
          <Link to="/cart" style={{ textDecoration: 'underline', color: '#333', whiteSpace: 'nowrap' }}>장바구니</Link>        </div>

        {/* 4행: 내비게이션 메뉴 (주문 및 관리 관련) */}
        <div style={{
          padding: isMobile ? '0.3rem 0.5rem' : '0.5rem 1rem',
          display: 'flex',
          gap: isMobile ? '0.6rem' : '1.2rem',
          alignItems: 'center',
          flexWrap: 'nowrap',
        }}>
          <div style={{ flex: 1 }}></div>
          <Link to="/orders" style={{ textDecoration: 'underline', color: '#333', whiteSpace: 'nowrap' }}>주문목록</Link>
          <Link to="/order/1" style={{ textDecoration: 'underline', color: '#333', whiteSpace: 'nowrap' }}>주문상세(S)</Link>
          <Link to="/addresses" style={{ textDecoration: 'underline', color: '#333', whiteSpace: 'nowrap' }}>배송지관리</Link>
          <Link to="/manager/sales" style={{ textDecoration: 'underline', color: '#d00', fontWeight: 'bold', whiteSpace: 'nowrap' }}>판매내역(S)</Link>
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
