export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">WorkBudduy</h3>
            <p className="text-gray-600">
              최고의 프리랜서와 클라이언트를 연결하는 플랫폼입니다.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">서비스</h4>
            <ul className="space-y-2">
              <li><a href="/projects" className="text-gray-600 hover:text-blue-600 cursor-pointer">프로젝트 찾기</a></li>
              <li><a href="/freelancers" className="text-gray-600 hover:text-blue-600 cursor-pointer">프리랜서 찾기</a></li>
              <li><a href="/recommendations" className="text-gray-600 hover:text-blue-600 cursor-pointer">맞춤 추천</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">고객지원</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 cursor-pointer">도움말</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 cursor-pointer">문의하기</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 cursor-pointer">공지사항</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">정보</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 cursor-pointer">이용약관</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 cursor-pointer">개인정보처리방침</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2025 프리랜서 매칭 플랫폼. All rights reserved.
          </p>
          <a 
            href="https://readdy.ai/?origin=logo" 
            className="text-gray-500 text-sm hover:text-blue-600 cursor-pointer mt-2 md:mt-0"
          >
            Powered by Readdy
          </a>
        </div>
      </div>
    </footer>
  );
}