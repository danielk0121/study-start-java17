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
 * PRD-FRONTAPP 2.1 요구사항 반영 (권한 표기 추가)
 */
function App() {
  // 실제 앱에서는 로그인 성공 시 서버에서 받아온 정보로 설정됨
  const [currentUser, setCurrentUser] = useState<Member | null>(null);

  const handleLogout = () => {
    setCurrentUser(null);
    alert('로그아웃 되었습니다.');
  };

  // 테스트를 위한 더미 로그인 함수 (Login 페이지에서 호출됨을 가정)
  const mockLogin = (role: 'BUYER' | 'MANAGER') => {
    setCurrentUser({
      id: 1,
      email: 'user@example.com',
      name: role === 'BUYER' ? '구매자님' : '관리자님',
      role: role
    });
  };

  return (
    <Router>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none', color: '#333' }}>MY SHOP</Link>
        <div style={{ flex: 1 }}></div>
        <Link to="/">상품목록</Link>
        <Link to="/cart">장바구니🛒</Link>
        
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ 
              padding: '0.3rem 0.6rem', 
              backgroundColor: '#f0f0f0', 
              borderRadius: '4px', 
              fontSize: '0.85rem',
              fontWeight: 'bold',
              color: currentUser.role === 'MANAGER' ? '#d32f2f' : '#1976d2'
            }}>
              {currentUser.role === 'MANAGER' ? '상품 관리자' : '상품 구매자'}
            </span>
            <Link to="/mypage" style={{ fontWeight: 'bold' }}>{currentUser.name}</Link>
            <button onClick={handleLogout} style={{ cursor: 'pointer' }}>로그아웃</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login">로그인</Link>
            <Link to="/register">회원가입</Link>
            {/* 테스트용 버튼 */}
            <button onClick={() => mockLogin('BUYER')} style={{ fontSize: '0.7rem' }}>T:구매자</button>
            <button onClick={() => mockLogin('MANAGER')} style={{ fontSize: '0.7rem' }}>T:관리자</button>
          </div>
        )}
      </nav>

      <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
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
