import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MyPage from './pages/MyPage';
import Cart from './pages/Cart';

/**
 * 프론트엔드 메인 진입점
 * PRD-FRONTAPP 2.1 요구사항 반영 (장바구니 추가)
 */
function App() {
  return (
    <Router>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none', color: '#333' }}>MY SHOP</Link>
        <div style={{ flex: 1 }}></div>
        <Link to="/">상품목록</Link>
        <Link to="/cart">장바구니🛒</Link>
        <Link to="/login">로그인</Link>
        <Link to="/register">회원가입</Link>
        <Link to="/mypage">마이페이지</Link>
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
