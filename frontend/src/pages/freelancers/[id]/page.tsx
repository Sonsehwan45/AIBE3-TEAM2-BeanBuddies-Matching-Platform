import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockFreelancers } from '../../../mocks/users';
import Button from '../../../components/base/Button';

interface FreelancerDetailProps {
  userType?: 'client' | 'freelancer';
}

export default function FreelancerDetail({ userType = 'client' }: FreelancerDetailProps) {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'profile' | 'portfolio' | 'reviews'>('profile');
  
  const freelancer = mockFreelancers.find(f => f.id === Number(id));
  
  if (!freelancer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">프리랜서를 찾을 수 없습니다</h2>
          <Link to="/freelancers">
            <Button>프리랜서 목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: '프로필', icon: 'ri-user-line' },
    { id: 'portfolio', label: '포트폴리오', icon: 'ri-folder-line' },
    { id: 'reviews', label: '리뷰', icon: 'ri-star-line' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 뒤로가기 */}
        <div className="mb-6">
          <Link to="/freelancers" className="flex items-center text-blue-600 hover:text-blue-700 cursor-pointer">
            <i className="ri-arrow-left-line mr-2"></i>
            프리랜서 목록으로 돌아가기
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 사이드바 - 프리랜서 기본 정보 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  {freelancer.name.charAt(0)}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{freelancer.name}</h2>
                <p className="text-gray-600 mb-3">{freelancer.email}</p>
                <div className="flex items-center justify-center mb-4">
                  <i className="ri-star-fill text-yellow-400 mr-1"></i>
                  <span className="font-semibold mr-2">{freelancer.averageRating}</span>
                  <span className="text-sm text-gray-500">({freelancer.activityHistory})</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <span className="text-sm text-gray-600">경력</span>
                  <p className="font-semibold text-gray-900">{freelancer.experience}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">주요 기술</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {freelancer.skills.map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">관심 분야</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {freelancer.interests.map((interest) => (
                      <span key={interest} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {userType === 'client' && (
                <div className="space-y-3">
                  <Link to={`/freelancers/${freelancer.id}/propose`}>
                    <Button className="w-full" size="lg">
                      <i className="ri-send-plane-line mr-2"></i>
                      프로젝트 제안
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    <i className="ri-heart-line mr-2"></i>
                    관심 프리랜서 등록
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* 탭 메뉴 */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <i className={`${tab.icon} mr-2`}></i>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 탭 콘텐츠 */}
              <div className="p-6">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">자기소개</h3>
                      <p className="text-gray-700 leading-relaxed">{freelancer.introduction}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">활동 이력</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">진행 중인 프로젝트</h4>
                          <div className="space-y-2">
                            {freelancer.ongoingProjects.map((project, index) => (
                              <div key={index} className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm font-medium text-blue-900">{project}</p>
                                <span className="text-xs text-blue-600">진행중</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">완료한 프로젝트</h4>
                          <div className="space-y-2">
                            {freelancer.completedProjects.slice(0, 3).map((project, index) => (
                              <div key={index} className="p-3 bg-green-50 rounded-lg">
                                <p className="text-sm font-medium text-green-900">{project}</p>
                                <span className="text-xs text-green-600">완료</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'portfolio' && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <i className="ri-folder-line text-4xl text-gray-400 mb-4"></i>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">포트폴리오</h3>
                      <p className="text-gray-500 mb-4">프리랜서가 공개한 포트폴리오가 표시됩니다.</p>
                      <Button variant="outline">
                        <i className="ri-download-line mr-2"></i>
                        포트폴리오 다운로드
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">받은 리뷰</h3>
                      <div className="flex items-center">
                        <i className="ri-star-fill text-yellow-400 mr-1"></i>
                        <span className="font-semibold mr-2">{freelancer.averageRating}</span>
                        <span className="text-sm text-gray-500">(총 15개 리뷰)</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[1, 2, 3].map((review) => (
                        <div key={review} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-gray-900">프로젝트 #{review}</p>
                              <p className="text-sm text-gray-600">클라이언트 A</p>
                            </div>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <i key={star} className="ri-star-fill text-yellow-400 text-sm"></i>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm">
                            매우 만족스러운 작업이었습니다. 커뮤니케이션도 원활하고 품질도 뛰어났습니다.
                          </p>
                          <p className="text-xs text-gray-500 mt-2">2024.01.15</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}