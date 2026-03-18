import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MyPage from './pages/MyPage';
import Cart from './pages/Cart';
import ManagerLogin from './pages/ManagerLogin';
import ManagerRegister from './pages/ManagerRegister';
import OrderList from './pages/OrderList';
import AddressManagement from './pages/AddressManagement';
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
        padding: '1rem', 
        borderBottom: '1px solid #000', 
        display: 'flex', 
        gap: '1.5rem', 
        alignItems: 'center',
        fontFamily: 'sans-serif'
      }}>
        <Link to="/" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#000' }}>SHOP</Link>
        <div style={{ flex: 1 }}></div>
        
        {/* 공통 메뉴 (상시 노출) */}
        <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>상품목록</Link>
        <Link to="/cart" style={{ textDecoration: 'none', color: '#333' }}>장바구니</Link>
        <Link to="/mypage" style={{ textDecoration: 'none', color: '#333' }}>내정보</Link>
        <Link to="/orders" style={{ textDecoration: 'none', color: '#333' }}>주문목록</Link>
        <Link to="/addresses" style={{ textDecoration: 'none', color: '#333' }}>배송지관리</Link>
        
        <span style={{ color: '#ccc' }}>|</span>

        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ 
              padding: '0.2rem 0.5rem', 
              border: '1px solid #ccc',
              fontSize: '0.8rem',
              color: currentUser.role === 'MANAGER' ? '#d00' : '#00d'
            }}>
              {currentUser.role === 'MANAGER' ? 'ADMIN' : 'USER'}
            </span>
            <span style={{ fontSize: '0.9rem' }}>{currentUser.name}</span>
            <button onClick={handleLogout} style={{ padding: '0.2rem 0.5rem', cursor: 'pointer' }}>로그아웃</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/login" style={{ textDecoration: 'none', color: '#333' }}>로그인</Link>
            <Link to="/register" style={{ textDecoration: 'none', color: '#333' }}>회원가입</Link>
            <span style={{ color: '#ccc' }}>|</span>
            <Link to="/manager/login" style={{ textDecoration: 'none', color: '#d00', fontSize: '0.9rem' }}>관리자로그인</Link>
            <Link to="/manager/register" style={{ textDecoration: 'none', color: '#d00', fontSize: '0.9rem' }}>관리자가입</Link>
          </div>
        )}
      </nav>

      <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/addresses" element={<AddressManagement />} />
          <Route path="/manager/login" element={<ManagerLogin />} />
          <Route path="/manager/register" element={<ManagerRegister />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
