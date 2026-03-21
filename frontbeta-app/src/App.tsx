import { useEffect, useState } from 'react';
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
import SellerList from './pages/SellerList';
import EditProfileBuyer from './pages/EditProfileBuyer';
import EditProfileSeller from './pages/EditProfileSeller';
import { useIsMobile } from './hooks/useIsMobile';

/**
 * 전역 배경색 및 스크롤바 제어를 위한 컴포넌트
 */
function ScrollToTopAndBg() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // 판매자 스토어 배경색 분기
    if (pathname.includes('/seller/1') || pathname.includes('/seller/2')) {
      document.body.style.backgroundColor = '#f5f0e6'; // 옅은 갈색 (공식: 애플, 삼성)
    } else if (pathname.includes('/seller/4')) {
      document.body.style.backgroundColor = '#f0fff0'; // 옅은 초록색 (일반)
    } else if (pathname.includes('/seller/')) {
      document.body.style.backgroundColor = '#8bbdfa'; // 기본 판매자 배경
    } else {
      document.body.style.backgroundColor = '#fff';
    }

    // 모바일 스크롤바 숨기기 스타일 주입
    const style = document.createElement('style');
    style.innerHTML = `
      /* 전체 요소에 대해 스크롤바 숨기기 (기능은 유지) */
      * {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
      }
      *::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [pathname]);

  return null;
}

/**
 * 프론트엔드 메인 진입점
 * 상단바 5행 구성 (로고 좌측, 메뉴 우측 정렬)
 */
function App() {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState<boolean>(() => {
    var saved = localStorage.getItem('navMenuOpen');
    return saved === 'true';
  });

  const toggleMenu = () => {
    var next = !menuOpen;
    setMenuOpen(next);
    localStorage.setItem('navMenuOpen', String(next));
  };

  const navLinkStyle: React.CSSProperties = {
    textDecoration: 'underline',
    color: 'inherit',
    whiteSpace: 'nowrap'
  };

  const rowContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: isMobile ? '0.4rem 0.5rem' : '0.5rem 1rem',
    borderBottom: '1px solid #eee',
    backgroundColor: 'transparent'
  };

  const menuGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: isMobile ? '0.5rem' : '1.2rem',
    marginLeft: 'auto',
    overflowX: 'auto',
    flexWrap: 'nowrap'
  };

  return (
    <Router basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <ScrollToTopAndBg />
      <nav style={{
        borderBottom: '1px solid #000',
        fontFamily: 'sans-serif',
        fontSize: isMobile ? '0.75rem' : '0.85rem',
      }}>
        {/* 1행: 로고(좌) + 토글 버튼 + 인증 관련(우) */}
        <div style={rowContainerStyle}>
          <Link to="/" style={{ ...navLinkStyle, display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#000', fontWeight: 'bold' }}>
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="S" style={{ width: '16px', height: '16px' }} />
            SHOP
          </Link>
          <button
            onClick={toggleMenu}
            style={{ marginLeft: '0.75rem', padding: isMobile ? '0.2rem 0.5rem' : '0.2rem 0.6rem', border: '1px solid #bbb', backgroundColor: '#fff', cursor: 'pointer', fontSize: isMobile ? '0.7rem' : '0.8rem', whiteSpace: 'nowrap' }}
          >
            {menuOpen ? '메뉴 접기 ▲' : '메뉴 펼치기 ▼'}
          </button>
          <div style={menuGroupStyle}>
            <Link to="/login" style={navLinkStyle}>로그인</Link>
            <Link to="/register" style={navLinkStyle}>회원가입</Link>
            <span style={{ color: '#ccc' }}>|</span>
            <Link to="/manager/login" style={{ ...navLinkStyle, color: '#d00' }}>판매자로그인</Link>
            <Link to="/manager/register" style={{ ...navLinkStyle, color: '#d00' }}>판매자가입</Link>
          </div>
        </div>

        {menuOpen && (
          <>
            {/* 2행: 정보 관리 (내정보(B), 정보수정(B), 내정보(S), 정보수정(S)) */}
            <div style={rowContainerStyle}>
              <div style={menuGroupStyle}>
                <Link to="/mypage" style={navLinkStyle}>내정보(B)</Link>
                <Link to="/mypage/edit" style={navLinkStyle}>정보수정(B)</Link>
                <span style={{ color: '#ccc' }}>|</span>
                <Link to="/manager/mypage" style={{ ...navLinkStyle, color: '#d00' }}>내정보(S)</Link>
                <Link to="/manager/mypage/edit" style={{ ...navLinkStyle, color: '#d00' }}>정보수정(S)</Link>
              </div>
            </div>

            {/* 3행: 상품 및 전시 (상품목록, 상품상세, 카테고리관, 브랜드관) */}
            <div style={rowContainerStyle}>
              <div style={menuGroupStyle}>
                <Link to="/" style={navLinkStyle}>상품목록</Link>
                <Link to="/product/1" style={navLinkStyle}>상품상세</Link>
                <Link to="/categories" style={navLinkStyle}>카테고리관</Link>
                <Link to="/brands" style={navLinkStyle}>브랜드관</Link>
              </div>
            </div>

            {/* 4행: 판매자 및 판매관리 (판매자목록, 판매자스토어(공식), 판매자스토어(일반), 판매내역(S)) */}
            <div style={rowContainerStyle}>
              <div style={menuGroupStyle}>
                <Link to="/sellers" style={{ ...navLinkStyle, fontWeight: 'bold' }}>판매자목록</Link>
                <span style={{ color: '#ccc' }}>|</span>
                <Link to="/seller/2" style={navLinkStyle}>판매자스토어(공식)</Link>
                <Link to="/seller/4" style={navLinkStyle}>판매자스토어(일반)</Link>
                <Link to="/manager/sales" style={{ ...navLinkStyle, color: '#d00', fontWeight: 'bold' }}>판매내역(S)</Link>
              </div>
            </div>

            {/* 5행: 구매 및 주문 관리 (장바구니, 주문목록, 주문상세, 배송지관리) */}
            <div style={{ ...rowContainerStyle, borderBottom: 'none' }}>
              <div style={menuGroupStyle}>
                <Link to="/cart" style={navLinkStyle}>장바구니</Link>
                <Link to="/orders" style={navLinkStyle}>주문목록</Link>
                <Link to="/order/1" style={navLinkStyle}>주문상세</Link>
                <Link to="/addresses" style={navLinkStyle}>배송지관리</Link>
              </div>
            </div>
          </>
        )}
      </nav>

      <main style={{ padding: isMobile ? '1rem 0.5rem' : '2rem', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/brands" element={<BrandList />} />
          <Route path="/sellers" element={<SellerList />} />
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
