import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockRecommendations } from '../../mocks/users';
import Button from '../../components/base/Button';

interface RecommendationsProps {
  userType?: 'client' | 'freelancer';
}

export default function Recommendations({ userType = 'client' }: RecommendationsProps) {
  const [selectedTab, setSelectedTab] = useState<'recommendations' | 'criteria'>('recommendations');

  const recommendations = userType === 'client' 
    ? mockRecommendations.forClient 
    : mockRecommendations.forFreelancer;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">맞춤 추천</h1>
          <p className="text-gray-600">
            {userType === 'client' 
              ? 'AI가 분석한 프로젝트에 적합한 프리랜서를 추천합니다' 
              : 'AI가 분석한 나에게 적합한 프로젝트를 추천합니다'
            }
          </p>
        </div>

        {/* 탭 메뉴 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setSelectedTab('recommendations')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  selectedTab === 'recommendations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="ri-lightbulb-line mr-2"></i>
                추천 목록
              </button>
              <button
                onClick={() => setSelectedTab('criteria')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  selectedTab === 'criteria'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <i className="ri-settings-line mr-2"></i>
                추천 기준
              </button>
            </div>
          </div>

          {/* 탭 콘텐츠 */}
          <div className="p-6">
            {selectedTab === 'recommendations' && (
              <div className="space-y-6">
                {userType === 'client' ? (
                  // 클라이언트용 - 프리랜서 추천
                  <div className="space-y-6">
                    {mockRecommendations.forClient.map((recommendation, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                              {recommendation.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 mb-1">{recommendation.name}</h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center">
                                  <i className="ri-star-fill text-yellow-400 mr-1"></i>
                                  <span>{recommendation.rating}</span>
                                </div>
                                <span>프로젝트 {recommendation.pastProjects}건</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {recommendation.skills.map(skill => (
                                  <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600 mb-1">
                              {recommendation.matchRate}%
                            </div>
                            <div className="text-sm text-gray-500">매칭률</div>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-blue-900 mb-2">
                            <i className="ri-lightbulb-line mr-2"></i>
                            추천 이유
                          </h4>
                          <p className="text-blue-800 text-sm">{recommendation.reason}</p>
                        </div>
                        
                        <div className="flex space-x-3">
                          <Link to={`/freelancers/${recommendation.freelancerId}`} className="flex-1">
                            <Button variant="outline" className="w-full">
                              프로필 보기
                            </Button>
                          </Link>
                          <Link to={`/freelancers/${recommendation.freelancerId}/propose`} className="flex-1">
                            <Button className="w-full">
                              프로젝트 제안하기
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // 프리랜서용 - 프로젝트 추천
                  <div className="space-y-6">
                    {mockRecommendations.forFreelancer.map((recommendation, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{recommendation.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center">
                                <i className="ri-building-line mr-1"></i>
                                {recommendation.client}
                              </span>
                              <span className="flex items-center">
                                <i className="ri-wallet-line mr-1"></i>
                                {recommendation.budget}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600 mb-1">
                              {recommendation.matchRate}%
                            </div>
                            <div className="text-sm text-gray-500">매칭률</div>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-green-900 mb-2">
                            <i className="ri-lightbulb-line mr-2"></i>
                            추천 이유
                          </h4>
                          <p className="text-green-800 text-sm">{recommendation.reason}</p>
                        </div>
                        
                        <div className="flex space-x-3">
                          <Link to={`/projects/${recommendation.projectId}`} className="flex-1">
                            <Button variant="outline" className="w-full">
                              프로젝트 보기
                            </Button>
                          </Link>
                          <Link to={`/projects/${recommendation.projectId}/apply`} className="flex-1">
                            <Button className="w-full">
                              지원하기
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'criteria' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">
                    <i className="ri-magic-line mr-2"></i>
                    AI 추천 시스템
                  </h3>
                  <p className="text-blue-800 mb-4">
                    우리의 AI는 다양한 요소를 종합적으로 분석하여 최적의 매칭을 제공합니다.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">기술 스택 매칭</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">정확한 기술 스택 일치</span>
                        <span className="text-sm font-medium text-green-600">가중치 40%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">유사 기술 스택</span>
                        <span className="text-sm font-medium text-blue-600">가중치 20%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">학습 가능성</span>
                        <span className="text-sm font-medium text-gray-600">가중치 10%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">과거 프로젝트 분석</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">유사 프로젝트 경험</span>
                        <span className="text-sm font-medium text-green-600">가중치 35%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">프로젝트 규모</span>
                        <span className="text-sm font-medium text-blue-600">가중치 15%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">성공률</span>
                        <span className="text-sm font-medium text-purple-600">가중치 20%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">평가 점수</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">평균 평점</span>
                        <span className="text-sm font-medium text-yellow-600">가중치 25%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">리뷰 개수</span>
                        <span className="text-sm font-medium text-gray-600">가중치 10%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">최근 활동</span>
                        <span className="text-sm font-medium text-green-600">가중치 15%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">관심 분야</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">관심 분야 일치</span>
                        <span className="text-sm font-medium text-purple-600">가중치 20%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">업무 선호도</span>
                        <span className="text-sm font-medium text-blue-600">가중치 15%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">협업 스타일</span>
                        <span className="text-sm font-medium text-gray-600">가중치 10%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <i className="ri-lightbulb-line text-yellow-600 text-lg mr-3 mt-0.5"></i>
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">추천 정확도를 높이는 팁</p>
                      <ul className="space-y-1 text-yellow-700">
                        <li>• 프로필 정보를 상세하게 작성해주세요</li>
                        <li>• 관심 분야와 기술 스택을 최신으로 업데이트해주세요</li>
                        <li>• 프로젝트 완료 후 피드백을 적극적으로 주고받아주세요</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}