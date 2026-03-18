import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MyPage from './pages/MyPage';

/**
 * 프론트엔드 메인 진입점
 * PRD-FRONTAPP 요구사항에 따른 라우팅 구성
 */
function App() {
  return (
    <Router>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', gap: '1rem' }}>
        <Link to="/">홈 (상품목록)</Link>
        <Link to="/login">로그인</Link>
        <Link to="/register">회원가입</Link>
        <Link to="/mypage">마이페이지</Link>
      </nav>

      <main style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
