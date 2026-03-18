import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MyPage from './pages/MyPage';
import Cart from './pages/Cart';
import type { Member } from './types';

/**
 * 프론트엔드 메인 진입점
 * PRD-FRONTAPP 2.1 요구사항 반영 (UI 간소화 적용)
 */
function App() {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const mockLogin = (role: 'BUYER' | 'MANAGER') => {
    setCurrentUser({
      id: 1,
      email: 'user@example.com',
      name: role === 'BUYER' ? '구매자' : '관리자',
      role: role
    });
  };

  return (
    <Router basename="/study-start-java17">
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
        <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>상품목록</Link>
        <Link to="/cart" style={{ textDecoration: 'none', color: '#333' }}>장바구니</Link>
        
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
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" style={{ textDecoration: 'none', color: '#333' }}>로그인</Link>
            <Link to="/register" style={{ textDecoration: 'none', color: '#333' }}>회원가입</Link>
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
        </Routes>
      </main>
    </Router>
  );
}

export default App;
