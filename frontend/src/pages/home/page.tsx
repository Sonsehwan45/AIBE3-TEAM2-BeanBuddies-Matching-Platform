
import { Link } from 'react-router-dom';
import { mockProjects, mockFreelancers } from '../../mocks/users';
import Button from '../../components/base/Button';

export default function Home() {
  const featuredProjects = mockProjects.slice(0, 3);
  const featuredFreelancers = mockFreelancers.slice(0, 2);

  return (
    <div className="min-h-screen">
      {/* 히어로 섹션 */}
      <section 
        className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white py-24"
        style={{
          backgroundImage: `url('https://readdy.ai/api/search-image?query=Modern%20freelancer%20working%20on%20laptop%20in%20bright%20office%20space%2C%20professional%20collaboration%2C%20diverse%20team%2C%20clean%20minimalist%20workspace%2C%20natural%20lighting%2C%20productivity%20and%20innovation%20concept%2C%20business%20teamwork%20background&width=1920&height=700&seq=hero2&orientation=landscape')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/60"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              최고의 프리랜서와<br />클라이언트를 연결합니다
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-blue-100 leading-relaxed">
              전문적인 매칭 시스템으로 완벽한 파트너를 찾아보세요<br />
              성공적인 프로젝트 협업을 위한 최고의 플랫폼입니다
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/projects">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all border-0">
                  <i className="ri-search-line mr-2"></i>
                  프로젝트 찾기
                </Button>
              </Link>
              <Link to="/freelancers">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                  <i className="ri-team-line mr-2"></i>
                  프리랜서 찾기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 공지사항/배너 */}
      <section className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center bg-white rounded-full px-6 py-3 shadow-sm">
              <i className="ri-notification-3-line text-yellow-600 mr-3 text-lg"></i>
              <span className="text-sm font-medium text-gray-800">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">새로운 기능 출시!</span> 
                AI 기반 맞춤 추천 서비스가 시작되었습니다.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 서비스 소개 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">왜 우리 플랫폼을 선택해야 할까요?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">검증된 매칭 시스템과 안전한 거래 환경을 제공합니다</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-shield-check-line text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">안전한 거래</h3>
              <p className="text-gray-600">에스크로 시스템과 평가 시스템으로 안전하고 신뢰할 수 있는 거래를 보장합니다</p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-ai-generate text-2xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI 매칭</h3>
              <p className="text-gray-600">고도화된 AI 알고리즘으로 프로젝트와 프리랜서를 정확하게 매칭합니다</p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-customer-service-2-line text-2xl text-purple-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">24/7 지원</h3>
              <p className="text-gray-600">전문 상담사가 24시간 프로젝트 진행을 도와드립니다</p>
            </div>
          </div>
        </div>
      </section>

      {/* 추천 프로젝트 섹션 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">인기 프로젝트</h2>
            <p className="text-lg text-gray-600">지금 가장 주목받고 있는 프로젝트들을 확인해보세요</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    project.status === '모집중' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {project.status}
                  </span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{project.category}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{project.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                  {project.skills.length > 3 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      +{project.skills.length - 3}개
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
                  <div className="flex items-center">
                    <i className="ri-money-dollar-circle-line mr-1"></i>
                    <span className="font-semibold text-green-600">{project.budget}</span>
                  </div>
                  <div className="flex items-center">
                    <i className="ri-time-line mr-1"></i>
                    <span>{project.duration}</span>
                  </div>
                </div>
                
                <Link to={`/projects/${project.id}`}>
                  <Button variant="outline" className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                    <i className="ri-arrow-right-line mr-2"></i>
                    자세히 보기
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/projects">
              <Button size="lg" className="px-8 py-4 text-lg">
                <i className="ri-folder-open-line mr-2"></i>
                모든 프로젝트 보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 추천 프리랜서 섹션 */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">검증된 전문가들</h2>
            <p className="text-lg text-gray-600">실력 있는 프리랜서들과 함께 성공적인 프로젝트를 만들어보세요</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {featuredFreelancers.map((freelancer) => (
              <div key={freelancer.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group">
                <div className="flex items-start space-x-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {freelancer.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{freelancer.name}</h3>
                      <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                        <i className="ri-star-fill text-yellow-400 mr-1"></i>
                        <span className="text-sm font-semibold text-yellow-700">{freelancer.averageRating}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 font-medium">{freelancer.experience}</p>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{freelancer.introduction}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {freelancer.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                      {freelancer.skills.length > 4 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{freelancer.skills.length - 4}개
                        </span>
                      )}
                    </div>
                    
                    <Link to={`/freelancers/${freelancer.id}`}>
                      <Button variant="outline" size="sm" className="group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                        <i className="ri-user-line mr-2"></i>
                        프로필 보기
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/freelancers">
              <Button size="lg" className="px-8 py-4 text-lg">
                <i className="ri-team-line mr-2"></i>
                모든 프리랜서 보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">믿을 수 있는 플랫폼</h2>
            <p className="text-xl text-blue-100">수많은 성공 스토리가 증명합니다</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">1,245+</div>
              <div className="text-blue-100">완료된 프로젝트</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">850+</div>
              <div className="text-blue-100">검증된 프리랜서</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
              <div className="text-blue-100">고객 만족도</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">고객 지원</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">지금 시작하세요</h2>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              프로젝트를 등록하거나 프리랜서로 활동을 시작해보세요<br />
              성공적인 협업의 첫 걸음을 함께 시작합니다
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/signup">
                <Button size="lg" className="px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                  <i className="ri-user-add-line mr-2"></i>
                  프리랜서로 시작하기
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="px-10 py-4 text-lg font-semibold border-2 hover:bg-blue-600 hover:text-white transition-all">
                  <i className="ri-briefcase-line mr-2"></i>
                  프로젝트 등록하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
