
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../base/Button';
import { useAuth } from '@/context/AuthContext';
import { client } from "@/lib/backend/client";
import toast from "react-hot-toast";

interface HeaderProps {
  userType?: 'client' | 'freelancer' | null;
  onUserTypeChange?: (type: 'client' | 'freelancer') => void;
}

export default function Header({ userType, onUserTypeChange }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, token, setUser, setToken } = useAuth(); // 로그인 상태 확인

  const navigation = [
    { name: '홈', href: '/' },
    { name: '프로젝트 찾기', href: '/projects' },
    { name: '프리랜서 찾기', href: '/freelancers' },
    { name: '맞춤 추천', href: '/recommendations' }
  ];

  //서버 로그아웃이랑 연동해야함
  const handleLogout = async () => {
    try {
      const res = await client.POST("/api/v1/auth/logout", {
        throwHttpErrors: false,
      });

      if (res.response.ok) {
        setToken(null);
        setUser(null);
        toast.success(res.data?.msg || "로그아웃 완료");
        navigate("/", { replace: true });
      } else {
        setToken(null);
        setUser(null);
        // 브라우저 쿠키 삭제
        document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        toast.error( res.error?.msg + "/n" + "서버에서 refreshToken을 삭제하는데 실패해 프론트에서 삭제하였습니다.");
      }
    } catch (err) {
      console.error(err);
      setToken(null);
      setUser(null);
      toast.error("서버 오류가 발생했습니다.");
    }
  };

  const role = user?.role.toLowerCase() as 'client' | 'freelancer' | undefined;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'Pacifico, serif' }}>
              logo
            </span>
          </Link>

          {/* 내비게이션 */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  location.pathname === item.href
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

         {/* 사용자 정보 / 로그인 상태 */}
          <div className="flex items-center space-x-4">
            {/* 로그인 되어 있으면 */}
            {token && user ? (
              <>
                {onUserTypeChange && role && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">역할:</span>
                    <div className="flex bg-gray-100 rounded-full p-1">
                      <button
                        onClick={() => onUserTypeChange('client')}
                        className={`px-3 py-1 rounded-full text-xs whitespace-nowrap cursor-pointer transition-colors ${
                          role === 'client'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        클라이언트
                      </button>
                      <button
                        onClick={() => onUserTypeChange('freelancer')}
                        className={`px-3 py-1 rounded-full text-xs whitespace-nowrap cursor-pointer transition-colors ${
                          role === 'freelancer'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        프리랜서
                      </button>
                    </div>
                  </div>
                )}
                <span className="text-sm text-gray-700">
                  환영합니다, {user.name}님 ({role})
                </span>

                <Button variant="outline" size="sm" onClick={handleLogout}>
                  로그아웃
                </Button>

                <Link to="/mypage">
                  <Button variant="secondary" size="sm">
                    마이페이지
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">로그인</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">회원가입</Button>
                </Link>
              </>
            )}

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 cursor-pointer"
            >
              <i className={`ri-${isMenuOpen ? 'close' : 'menu'}-line text-lg`}></i>
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="px-2 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
